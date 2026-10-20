/**
 * services/characterService.js
 * ═══ LAYER 3: Service — Character Business Logic ═══
 */

import * as CharacterModel from "../models/characterModel.js";
import { AppError, ErrorCode } from "../io/AppError.js";
import { parseRequest, CreateCharacterSchema, UpdateCharacterSchema } from "../io/request.js";

export async function createCharacter(campaignId, data) {
    const validated = parseRequest(CreateCharacterSchema, data);
    try {
        return await CharacterModel.create(campaignId, validated);
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to create character: ${err.message}`);
    }
}

export async function getAllCharacters(campaignId) {
    try {
        return await CharacterModel.findAll(campaignId);
    } catch (err) {
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to fetch characters: ${err.message}`);
    }
}

export async function getCharacterById(campaignId, id) {
    const character = await CharacterModel.findById(campaignId, id);
    if (!character) {
        throw new AppError(ErrorCode.CHARACTER_NOT_FOUND, `Character with ID "${id}" not found`);
    }
    return character;
}

export async function updateCharacter(campaignId, id, updates) {
    await getCharacterById(campaignId, id);
    const validated = parseRequest(UpdateCharacterSchema, updates);
    try {
        await CharacterModel.updateById(campaignId, id, validated);
        return await CharacterModel.findById(campaignId, id);
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to update character: ${err.message}`);
    }
}

export async function updateCharacterStat(campaignId, id, path, value) {
    await getCharacterById(campaignId, id);
    try {
        await CharacterModel.updatePath(campaignId, id, path, value);
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to update character stat: ${err.message}`);
    }
}

export async function deleteCharacter(campaignId, id) {
    await getCharacterById(campaignId, id);
    try {
        await CharacterModel.removeById(campaignId, id);
    } catch (err) {
        throw new AppError(ErrorCode.FIREBASE_ERROR, `Failed to delete character: ${err.message}`);
    }
}

export default {
    createCharacter,
    getAllCharacters,
    getCharacterById,
    updateCharacter,
    updateCharacterStat,
    deleteCharacter,
};