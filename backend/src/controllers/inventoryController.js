/**
 * controllers/inventoryController.js
 * ═══ LAYER 4: Controller — Inventory CRUD Endpoints ═══
 */
import * as InventoryService from "../services/inventoryService.js";
import { parseRequest, CreateInventoryItemSchema, UpdateInventoryItemSchema } from "../io/request.js";
import { sendSuccess } from "../io/response.js";

export async function handleCreate(req, res) {
    const { campaignId } = req.params;
    const data = parseRequest(CreateInventoryItemSchema, req.body);
    const result = await InventoryService.addItem(campaignId, data);
    sendSuccess(res, result, { action: "inventory.create" }, 201);
}

export async function handleGetAll(req, res) {
    const { campaignId } = req.params;
    const items = await InventoryService.getAllItems(campaignId);
    sendSuccess(res, items, { action: "inventory.list" });
}

export async function handleGetById(req, res) {
    const { campaignId, id } = req.params;
    const item = await InventoryService.getItemById(campaignId, id);
    sendSuccess(res, item, { action: "inventory.get" });
}

export async function handleUpdate(req, res) {
    const { campaignId, id } = req.params;
    const updates = parseRequest(UpdateInventoryItemSchema, req.body);
    const item = await InventoryService.updateItem(campaignId, id, updates);

    if (item === null) {
        sendSuccess(res, { deleted: true, id, reason: "quantity_zero" }, { action: "inventory.auto_delete" });
    } else {
        sendSuccess(res, item, { action: "inventory.update" });
    }
}

export async function handleDelete(req, res) {
    const { campaignId, id } = req.params;
    await InventoryService.removeItem(campaignId, id);
    sendSuccess(res, { deleted: true, id }, { action: "inventory.delete" });
}

export default { handleCreate, handleGetAll, handleGetById, handleUpdate, handleDelete };