/**
 * services/inventoryService.js
 * ═══ LAYER 3: Service — Inventory Business Logic ═══
 */
import * as InventoryModel from "../models/inventoryModel.js";
import { AppError, ErrorCode } from "../io/AppError.js";

export async function addItem(campaignId, data) {
    try {
        return await InventoryModel.create(campaignId, data);
    } catch (err) {
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to add inventory item: ${err.message}`);
    }
}

export async function getAllItems(campaignId) {
    try {
        return await InventoryModel.findAll(campaignId);
    } catch (err) {
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to fetch inventory: ${err.message}`);
    }
}

export async function getItemById(campaignId, id) {
    const item = await InventoryModel.findById(campaignId, id);
    if (!item) {
        throw new AppError(ErrorCode.INVENTORY_ITEM_NOT_FOUND, `Inventory item with ID "${id}" not found`);
    }
    return item;
}

export async function updateItem(campaignId, id, updates) {
    await getItemById(campaignId, id); // Validasi eksistensi
    try {
        if (updates.quantity !== undefined && updates.quantity <= 0) {
            await InventoryModel.removeById(campaignId, id);
            return null;
        }
        await InventoryModel.updateById(campaignId, id, updates);
        return await InventoryModel.findById(campaignId, id);
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to update inventory item: ${err.message}`);
    }
}

export async function removeItem(campaignId, id) {
    await getItemById(campaignId, id); // Validasi eksistensi
    try {
        await InventoryModel.removeById(campaignId, id);
    } catch (err) {
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to delete inventory item: ${err.message}`);
    }
}

export default { addItem, getAllItems, getItemById, updateItem, removeItem };