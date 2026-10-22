/**
 * services/llmClient.js
 * ═══ LAYER 4: Service — LLM HTTP Client (Gemini API) ═══
 *
 * Calls Gemini via OpenAI-compatible endpoint.
 * Handles timeout, error wrapping, and JSON extraction.
 */

import { config } from "../config/env.js";
import { AppError, ErrorCode } from "../io/AppError.js";

/**
 * Extracts and cleans JSON from LLM response text.
 * @param {string} rawText
 * @returns {object|null}
 */
export function extractJsonFromText(rawText) {
    if (!rawText || typeof rawText !== "string") return null;

    let cleaned = rawText.trim();
    if (cleaned.startsWith("```")) {
        cleaned = cleaned
            .replace(/^```(?:json)?\s*/i, "")
            .replace(/\s*```$/, "")
            .trim();
    }

    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf("{");
        const end = cleaned.lastIndexOf("}");
        if (start !== -1 && end > start) {
            try {
                return JSON.parse(cleaned.slice(start, end + 1));
            } catch {
                return null;
            }
        }
        return null;
    }
}

/**
 * Calls the configured OpenAI-compatible LLM endpoint with system + user messages.
 *
 * @param {object} params
 * @param {string} params.systemPrompt
 * @param {string} params.userPrompt
 * @param {object} [params.llmOverride] — Override config.llm partially
 * @returns {Promise<object>} Parsed JSON response
 * @throws {AppError} On missing credentials, timeout, upstream failure, or parse failure
 */
export async function callLlm({ systemPrompt, userPrompt, llmOverride = {} }) {
    const defaultGeminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    
    const llm = {
        endpoint: config.llm?.endpoint || defaultGeminiEndpoint,
        apiKey: config.llm?.apiKey || process.env.GEMINI_API_KEY,
        model: llmOverride.model || config.llm?.model || "gemini-3.5-flash-lite",
        timeoutMs: llmOverride.timeoutMs || config.llm?.timeoutMs || 30000,
    };

    if (!llm.apiKey) {
        throw new AppError(
            ErrorCode.LLM_UNREACHABLE,
            "LLM_API_KEY (or GEMINI_API_KEY) is required to generate AI content",
        );
    }

    const payload = {
        model: llm.model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        stream: false,
        // Opsional: Memaksa Gemini merespons dalam format JSON (jika didukung model)
        response_format: { type: "json_object" } 
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), llm.timeoutMs);

    try {
        const response = await fetch(llm.endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${llm.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        if (!response.ok) {
            const errText = await response.text().catch(() => "");
            throw new AppError(
                ErrorCode.LLM_UNREACHABLE,
                `LLM API HTTP ${response.status}: ${errText.slice(0, 200)}`,
            );
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
            throw new AppError(
                ErrorCode.LLM_PARSE_FAILED,
                "LLM response contained no message content",
            );
        }

        const parsed = extractJsonFromText(content);
        if (!parsed) {
            throw new AppError(
                ErrorCode.LLM_PARSE_FAILED,
                "Failed to parse valid JSON from LLM response",
            );
        }

        return parsed;
    } catch (err) {
        if (err instanceof AppError) throw err;
        if (err.name === "AbortError") {
            throw new AppError(
                ErrorCode.LLM_TIMEOUT,
                `LLM request timed out after ${llm.timeoutMs}ms`,
            );
        }
        throw new AppError(
            ErrorCode.LLM_UNREACHABLE,
            `Failed to connect to LLM endpoint: ${err.message}`,
        );
    } finally {
        clearTimeout(timer);
    }
}