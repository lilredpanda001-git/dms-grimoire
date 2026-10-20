import { db } from '../firebase';
import { ref, set, remove, push, update } from 'firebase/database';

export const addNpc = async (campaignId, npcData) => {
  if (!campaignId) throw new Error("Pilih kampanye terlebih dahulu.");
  try {
    const npcRef = ref(db, `campaigns/${campaignId}/npcs`);
    const newNpcRef = push(npcRef); 
    await set(newNpcRef, {
      id: newNpcRef.key,
      name: npcData.name || "Unknown Figure",
      role: npcData.role || "Commoner",
      location: npcData.location || "Unknown",
      description: npcData.description || "",
      traits: npcData.traits || "",
      createdAt: Date.now()
    });
  } catch (error) {
    throw new Error(`Gagal menambah NPC: ${error.message}`);
  }
};

export const updateNpc = async (campaignId, id, updatedData) => {
  if (!campaignId || !id) return;
  try {
    const npcRef = ref(db, `campaigns/${campaignId}/npcs/${id}`);
    await update(npcRef, {
      ...updatedData,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error updating NPC: ", error);
    throw error;
  }
};

export const deleteNpc = async (campaignId, id) => {
  if (!campaignId || !id) return;
  try {
    const npcRef = ref(db, `campaigns/${campaignId}/npcs/${id}`);
    await remove(npcRef);
  } catch (error) {
    throw new Error(`Gagal menghapus NPC: ${error.message}`);
  }
};