/**
 * models/npcModel.js
 * ═══ LAYER 2: Model — NPC Database Operations ═══
 */

import { db, ref, get, set, push, update, remove } from "../config/firebase.js";

// Fungsi pembuat path dinamis
const getNode = (campaignId) => `campaigns/${campaignId}/npcs`;

export async function create(campaignId, data) {
    const newRef = push(ref(db, getNode(campaignId)));
    const id = data.id || newRef.key;

    const entry = {
        ...data,
        id,
        role: data.role || data.title || data.class || "NPC",
        location: data.location || "The Ashen Crown",
        description: data.description || data.personality || data.lore || "",
        traits:
            data.traits ||
            [
                data.race && data.class ? `${data.race} ${data.class}` : null,
                data.disposition ? `Disposition: ${data.disposition}` : null,
            ]
                .filter(Boolean)
                .join(" · "),
        createdAt: data.createdAt || Date.now(),
        updatedAt: Date.now(),
    };

    await set(ref(db, `${getNode(campaignId)}/${id}`), entry);
    return { id, data: entry };
}

export async function findAll(campaignId) {
    const snapshot = await get(ref(db, getNode(campaignId)));
    return snapshot.val() || {};
}

export async function findById(campaignId, id) {
    const snapshot = await get(ref(db, `${getNode(campaignId)}/${id}`));
    return snapshot.exists() ? { id, ...snapshot.val() } : null;
}

export async function updateById(campaignId, id, updates) {
    const payload = {
        ...updates,
        updatedAt: Date.now(),
    };
    await update(ref(db, `${getNode(campaignId)}/${id}`), payload).catch(() => {});
}

export async function removeById(campaignId, id) {
    await remove(ref(db, `${getNode(campaignId)}/${id}`)).catch(() => {});
}

export default { create, findAll, findById, updateById, removeById };