/**
 * config/env.js
 * ═══ LAYER 0: Configuration ═══
 *
 * Loads .env, validates required variables, exports a frozen config object.
 * All other layers import config from here — never from process.env directly.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

dotenv.config({ path: path.join(ROOT, ".env") });

const nodeEnv = process.env.NODE_ENV || "development";
const llmEndpoint = env("LLM_ENDPOINT", "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions");

if (
	nodeEnv === "production" &&
	/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(llmEndpoint)
) {
	throw new Error("[config] LLM_ENDPOINT must be publicly reachable in production, not localhost/127.0.0.1");
}

function env(key, fallback = undefined) {
	const val = process.env[key];
	if (val !== undefined && val !== "") return val;
	if (fallback !== undefined) return fallback;
	throw new Error(`[config] Missing required environment variable: ${key}`);
}

function envInt(key, fallback = undefined) {
	const raw = env(key, fallback !== undefined ? String(fallback) : undefined);
	const num = Number.parseInt(raw, 10);
	if (Number.isNaN(num))
		throw new Error(
			`[config] Environment variable ${key} must be an integer, got: "${raw}"`,
		);
	return num;
}

export const config = Object.freeze({
	llm: Object.freeze({
		endpoint: llmEndpoint,
		apiKey: env("GEMINI_API_KEY", env("LLM_API_KEY", "")),
		model: env("LLM_MODEL", "gemini-2.5-flash"),
		timeoutMs: envInt("LLM_TIMEOUT_MS", 30000),
	}),

	server: Object.freeze({
		port: envInt("PORT", 3000),
		nodeEnv,
	}),

	render: Object.freeze({
		endpoint: env("GT_RENDER_ENDPOINT", "https://gtsetplanner.com/generate"),
	}),

	database: Object.freeze({
		itemsUrl: env(
			"GT_ITEMS_URL",
			"https://gtsetplanner.com/static/spfe_encrypted.json",
		),
		xorKey: env("XOR_KEY", "sorenessiscool"),
		cachePath: path.resolve(ROOT, env("CACHE_PATH", "./data/items_cache.json")),
	}),

	root: ROOT,
});

export default config;
