/**
 * controllers/characterController.js
 * ═══ LAYER 4: Controller — Character CRUD Endpoints ═══
 */

import * as CharacterService from "../services/characterService.js";
import { parseRequest, CreateCharacterSchema, UpdateCharacterSchema } from "../io/request.js";
import { sendSuccess } from "../io/response.js";
import { AppError, ErrorCode } from "../io/AppError.js";

export async function handleCreate(req, res) {
    const { campaignId } = req.params;
    const data = parseRequest(CreateCharacterSchema, req.body);
    const result = await CharacterService.createCharacter(campaignId, data);
    sendSuccess(res, result, { action: "character.create" }, 201);
}

export async function handleGetAll(req, res) {
    const { campaignId } = req.params;
    const characters = await CharacterService.getAllCharacters(campaignId);
    sendSuccess(res, characters, { action: "character.list" });
}

export async function handleGetById(req, res) {
    const { campaignId, id } = req.params;
    const character = await CharacterService.getCharacterById(campaignId, id);
    sendSuccess(res, character, { action: "character.get" });
}

export async function handleUpdate(req, res) {
    const { campaignId, id } = req.params;
    const updates = parseRequest(UpdateCharacterSchema, req.body);
    const character = await CharacterService.updateCharacter(campaignId, id, updates);
    sendSuccess(res, character, { action: "character.update" });
}

export async function handleUpdateStat(req, res) {
    const { campaignId, id } = req.params;
    const { path, value } = req.body;
    
    if (!path) {
        throw new AppError(ErrorCode.MISSING_FIELD, 'Field "path" is required (e.g. "combat/hpCurrent")');
    }
    
    await CharacterService.updateCharacterStat(campaignId, id, path, value);
    sendSuccess(res, { id, path, value }, { action: "character.update_stat" });
}

export async function handleDelete(req, res) {
    const { campaignId, id } = req.params;
    await CharacterService.deleteCharacter(campaignId, id);
    sendSuccess(res, { deleted: true, id }, { action: "character.delete" });
}

export default { handleCreate, handleGetAll, handleGetById, handleUpdate, handleUpdateStat, handleDelete };