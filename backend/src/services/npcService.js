/**
 * services/npcService.js
 * ═══ LAYER 3: Service — NPC Business Logic ═══
 */

import * as NpcModel from "../models/npcModel.js";
import * as CharacterModel from "../models/characterModel.js";
import * as mcpClient from "./mcpClient.js";
import { AppError, ErrorCode } from "../io/AppError.js";
import { db, ref, set } from "../config/firebase.js";

export async function createNpc(campaignId, data) {
    try {
        return await NpcModel.create(campaignId, { ...data, source: "manual" });
    } catch (err) {
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to create NPC: ${err.message}`);
    }
}

export async function getAllNpcs(campaignId) {
    try {
        return await NpcModel.findAll(campaignId);
    } catch (err) {
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to fetch NPCs: ${err.message}`);
    }
}

export async function getNpcById(campaignId, id) {
    const npc = await NpcModel.findById(campaignId, id);
    if (!npc) {
        throw new AppError(ErrorCode.NPC_NOT_FOUND, `NPC with ID "${id}" not found`);
    }
    return npc;
}

export async function updateNpc(campaignId, id, updates) {
    await getNpcById(campaignId, id);
    try {
        await NpcModel.updateById(campaignId, id, updates);
        return await NpcModel.findById(campaignId, id);
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to update NPC: ${err.message}`);
    }
}

export async function deleteNpc(campaignId, id) {
    await getNpcById(campaignId, id);
    try {
        await NpcModel.removeById(campaignId, id);
    } catch (err) {
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to delete NPC: ${err.message}`);
    }
}

export async function generateNpcWithAi(campaignId, { prompt, type }) {
    // 1. Fetch current party data based on campaignId
    let partyContext = null;
    try {
        const party = await CharacterModel.findAll(campaignId);
        if (party && Object.keys(party).length > 0) {
            const members = Object.values(party);
            partyContext = {
                memberCount: members.length,
                averageLevel: Math.round(
                    members.reduce((sum, m) => sum + (m.level || 1), 0) / members.length,
                ),
                members: members.map((m) => ({
                    name: m.name,
                    class: m.characterClass || m.class || "Fighter",
                    race: m.race || "Human",
                    level: m.level || 1,
                    hp: m.combat
                        ? { current: m.combat.hpCurrent ?? 10, max: m.combat.hpMax ?? 10 }
                        : (m.hp || { current: 10, max: 10 }),
                })),
            };
        }
    } catch {
        console.warn("[NpcService] Could not fetch party context, proceeding without it");
    }

    // 2. Call MCP
    const mcpResponse = await mcpClient.generateNpc({ prompt, type, partyContext, render: true });

    // 3. Save to Firebase
    const npcData = mcpResponse.data?.npc;
    if (!npcData) {
        throw new AppError(
            ErrorCode.MCP_PARSE_FAILED,
            "MCP response did not contain valid NPC data",
            { mcpResponse: mcpResponse.data },
        );
    }

    const npcEntry = {
        name: npcData.name || "Unknown NPC",
        title: npcData.title || "",
        type: npcData.type || "NPC",
        race: npcData.race || "Human",
        class: npcData.class || "Commoner",
        level: npcData.level || 1,
        hp: npcData.hp || { current: 10, max: 10 },
        armorClass: npcData.armorClass || 10,
        stats: npcData.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        disposition: npcData.disposition || "Neutral",
        location: npcData.location || "",
        personality: npcData.personality || "",
        lore: npcData.lore || "",
        secret: npcData.secret || "",
        source: "ai",
        aiMeta: {
            prompt,
            type,
            generatedAt: Date.now(),
            avatar: mcpResponse.data?.avatar || null,
            image: mcpResponse.data?.image || null,
        },
    };

    const saved = await NpcModel.create(campaignId, npcEntry);

    // Sync to category-specific nodes WITHIN THE CAMPAIGN
    if (type === "Location lore") {
        await set(ref(db, `campaigns/${campaignId}/lore/${saved.id}`), {
            id: saved.id,
            title: npcData.name || npcData.title || "Ancient Location",
            category: "Location",
            content: npcData.lore || npcData.description || npcData.personality || "",
            createdAt: Date.now(),
        }).catch(() => {});
    } else if (type === "Story twist") {
        await set(ref(db, `campaigns/${campaignId}/chronicles/${saved.id}`), {
            id: saved.id,
            sessionNumber: 1, // Optional: auto-detect current session
            title: `Plot Twist: ${npcData.name || npcData.title || "Unexpected Turn"}`,
            description: npcData.secret || npcData.lore || npcData.personality || "",
            createdAt: Date.now(),
        }).catch(() => {});
    } else if (type === "Magic item") {
        await set(ref(db, `campaigns/${campaignId}/inventory/${saved.id}`), {
            id: saved.id,
            name: npcData.name || "Enchanted Relic",
            type: "treasure",
            quantity: 1,
            description: npcData.lore || npcData.personality || "",
            createdAt: Date.now(),
        }).catch(() => {});
    }

    return {
        id: saved.id,
        npc: saved.data,
        mcpMeta: mcpResponse.meta,
    };
}

export default { createNpc, getAllNpcs, getNpcById, updateNpc, deleteNpc, generateNpcWithAi };