/**
 * controllers/npcController.js
 * ═══ LAYER 4: Controller — NPC CRUD + AI Generation Endpoints ═══
 */

import * as NpcService from "../services/npcService.js";
import { parseRequest, CreateNpcSchema, UpdateNpcSchema, GenerateNpcAiSchema } from "../io/request.js";
import { sendSuccess } from "../io/response.js";

export async function handleCreate(req, res) {
    const { campaignId } = req.params;
    const data = parseRequest(CreateNpcSchema, req.body);
    const result = await NpcService.createNpc(campaignId, data);
    sendSuccess(res, result, { action: "npc.create", source: "manual" }, 201);
}

export async function handleGetAll(req, res) {
    const { campaignId } = req.params;
    const npcs = await NpcService.getAllNpcs(campaignId);
    sendSuccess(res, npcs, { action: "npc.list" });
}

export async function handleGetById(req, res) {
    const { campaignId, id } = req.params;
    const npc = await NpcService.getNpcById(campaignId, id);
    sendSuccess(res, npc, { action: "npc.get" });
}

export async function handleUpdate(req, res) {
    const { campaignId, id } = req.params;
    const updates = parseRequest(UpdateNpcSchema, req.body);
    const npc = await NpcService.updateNpc(campaignId, id, updates);
    sendSuccess(res, npc, { action: "npc.update" });
}

export async function handleDelete(req, res) {
    const { campaignId, id } = req.params;
    await NpcService.deleteNpc(campaignId, id);
    sendSuccess(res, { deleted: true, id: req.params.id }, { action: "npc.delete" });
}

export async function handleGenerateAi(req, res) {
    // Bisa dari params (jika URL /api/campaigns/:campaignId/...) 
    // atau jika global (/api/generate-npc), butuh pengiriman campaignId di dalam body JSON dari frontend.
    const campaignId = req.params.campaignId || req.body.campaignId; 
    
    if (!campaignId) {
        return res.status(400).json({ status: "error", message: "campaignId is required to generate AI" });
    }

    const { prompt, type } = parseRequest(GenerateNpcAiSchema, req.body);
    const result = await NpcService.generateNpcWithAi(campaignId, { prompt, type });
    sendSuccess(res, result, { action: "npc.generate_ai", source: "mcp" }, 201);
}

export default { handleCreate, handleGetAll, handleGetById, handleUpdate, handleDelete, handleGenerateAi };