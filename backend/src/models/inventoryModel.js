/**
 * models/inventoryModel.js
 * ═══ LAYER 2: Model — Inventory Database Operations ═══
 */
import { db, ref, get, set, push, update, remove } from "../config/firebase.js";

// Fungsi pembuat path dinamis
const getNode = (campaignId) => `campaigns/${campaignId}/inventory`;

export async function create(campaignId, data) {
    const newRef = push(ref(db, getNode(campaignId)));
    const entry = {
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
    await set(newRef, entry);
    return { id: newRef.key, data: entry };
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
    await update(ref(db, `${getNode(campaignId)}/${id}`), {
        ...updates,
        updatedAt: Date.now(),
    });
}

export async function removeById(campaignId, id) {
    await remove(ref(db, `${getNode(campaignId)}/${id}`));
}

export default { create, findAll, findById, updateById, removeById };