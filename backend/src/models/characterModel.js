/**
 * models/characterModel.js
 * ═══ LAYER 2: Model — Character Database Operations ═══
 */

import { db, ref, get, set, push, update, remove } from "../config/firebase.js";

// Fungsi pembuat path dinamis
const getNode = (campaignId) => `campaigns/${campaignId}/party`;

function flattenForUpdate(obj, prefix = "") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}/${key}` : key;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
            Object.assign(result, flattenForUpdate(value, fullKey));
        } else {
            result[fullKey] = value;
        }
    }
    return result;
}

export async function create(campaignId, data) {
    const { id: customId, ...rest } = data;
    const characterId = customId || push(ref(db, getNode(campaignId))).key;

    const entry = {
        ...rest,
        id: characterId,
        createdAt: data.createdAt || Date.now(),
        updatedAt: Date.now(),
    };

    await set(ref(db, `${getNode(campaignId)}/${characterId}`), entry);
    return { id: characterId, ...entry, data: entry };
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
    const flattened = flattenForUpdate(updates);
    flattened.updatedAt = Date.now();
    await update(ref(db, `${getNode(campaignId)}/${id}`), flattened);
}

export async function updatePath(campaignId, id, path, value) {
    await set(ref(db, `${getNode(campaignId)}/${id}/${path}`), value);
}

export async function removeById(campaignId, id) {
    await remove(ref(db, `${getNode(campaignId)}/${id}`));
}

export default { create, findAll, findById, updateById, updatePath, removeById };