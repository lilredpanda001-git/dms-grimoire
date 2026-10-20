/**
 * server/routes.js
 * ═══ LAYER 5: Transport — Route Definitions ═══
 *
 * Registers all Express routes with proper middleware chain.
 *
 * API Design:
 *   /api/auth/*                                — Authentication (register, login, logout)
 *   /api/campaigns/:campaignId/characters      — Party character CRUD
 *   /api/campaigns/:campaignId/inventory       — Party inventory CRUD
 *   /api/campaigns/:campaignId/npcs            — NPC CRUD
 *   /api/generate-npc                          — Global AI NPC generation
 *   /health                                    — Health check (public)
 */

import { asyncWrap } from "../io/errorHandler.js";
import { healthCheck } from "../controllers/healthController.js";
import {
    authMiddleware,
    optionalAuthMiddleware,
    handleRegister,
    handleLogin,
    handleLogout,
} from "../controllers/authController.js";
import * as characterCtrl from "../controllers/characterController.js";
import * as inventoryCtrl from "../controllers/inventoryController.js";
import * as npcCtrl from "../controllers/npcController.js";

/**
 * Registers all routes on the Express app.
 * @param {import('express').Application} app
 */
export function registerRoutes(app) {
    // ── Public ──
    app.get("/health", asyncWrap(healthCheck));

    // ── Auth Endpoints (Public — no token needed) ──
    app.post("/api/auth/register", asyncWrap(handleRegister));
    app.post("/api/auth/login", asyncWrap(handleLogin));
    app.post("/api/auth/logout", asyncWrap(handleLogout));

    // ── Character CRUD (Protected & Scoped to Campaign) ──
    app.post("/api/campaigns/:campaignId/characters", authMiddleware, asyncWrap(characterCtrl.handleCreate));
    app.get("/api/campaigns/:campaignId/characters", authMiddleware, asyncWrap(characterCtrl.handleGetAll));
    app.get("/api/campaigns/:campaignId/characters/:id", authMiddleware, asyncWrap(characterCtrl.handleGetById));
    app.patch("/api/campaigns/:campaignId/characters/:id/stat", authMiddleware, asyncWrap(characterCtrl.handleUpdateStat));
    app.patch("/api/campaigns/:campaignId/characters/:id", authMiddleware, asyncWrap(characterCtrl.handleUpdate));
    app.delete("/api/campaigns/:campaignId/characters/:id", authMiddleware, asyncWrap(characterCtrl.handleDelete));

    // ── Inventory CRUD (Protected & Scoped to Campaign) ──
    app.post("/api/campaigns/:campaignId/inventory", authMiddleware, asyncWrap(inventoryCtrl.handleCreate));
    app.get("/api/campaigns/:campaignId/inventory", authMiddleware, asyncWrap(inventoryCtrl.handleGetAll));
    app.get("/api/campaigns/:campaignId/inventory/:id", authMiddleware, asyncWrap(inventoryCtrl.handleGetById));
    app.patch("/api/campaigns/:campaignId/inventory/:id", authMiddleware, asyncWrap(inventoryCtrl.handleUpdate));
    app.delete("/api/campaigns/:campaignId/inventory/:id", authMiddleware, asyncWrap(inventoryCtrl.handleDelete));

    // ── AI Generation (Protected/Optional) ──
    // Tetap global karena biasanya hanya menerima prompt string dan mengembalikan data dummy/AI
    app.post("/api/generate-npc", optionalAuthMiddleware, asyncWrap(npcCtrl.handleGenerateAi));
    
    // Atau bisa juga dimasukkan ke scope campaign (tergantung kebutuhan context LLM ke depannya)
    app.post("/api/campaigns/:campaignId/npcs/generate", optionalAuthMiddleware, asyncWrap(npcCtrl.handleGenerateAi));

    // ── NPC CRUD (Protected & Scoped to Campaign) ──
    app.post("/api/campaigns/:campaignId/npcs", authMiddleware, asyncWrap(npcCtrl.handleCreate));
    app.get("/api/campaigns/:campaignId/npcs", authMiddleware, asyncWrap(npcCtrl.handleGetAll));
    app.get("/api/campaigns/:campaignId/npcs/:id", authMiddleware, asyncWrap(npcCtrl.handleGetById));
    app.patch("/api/campaigns/:campaignId/npcs/:id", authMiddleware, asyncWrap(npcCtrl.handleUpdate));
    app.delete("/api/campaigns/:campaignId/npcs/:id", authMiddleware, asyncWrap(npcCtrl.handleDelete));
}

export default { registerRoutes };