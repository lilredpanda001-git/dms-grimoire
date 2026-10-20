import { ref, push, set, update, remove } from 'firebase/database';
import { db } from '../firebase';

// Tambah Lore
export const addLore = async (campaignId, loreData) => {
  if (!campaignId) throw new Error("Pilih kampanye terlebih dahulu.");
  try {
    const loreRef = ref(db, `campaigns/${campaignId}/lore`);
    const newLoreRef = push(loreRef);
    
    await set(newLoreRef, {
      id: newLoreRef.key,
      title: loreData.title || "Untitled Document",
      category: loreData.category || "Other",
      content: loreData.content || "",
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("Error adding lore:", error);
    throw new Error(`Gagal menambah Lore: ${error.message}`);
  }
};

// Update Lore (FUNGSI BARU)
export const updateLore = async (campaignId, id, loreData) => {
  if (!campaignId || !id) return;
  try {
    const loreRef = ref(db, `campaigns/${campaignId}/lore/${id}`);
    await update(loreRef, {
      title: loreData.title,
      category: loreData.category,
      content: loreData.content,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error updating lore:", error);
    throw new Error(`Gagal mengupdate Lore: ${error.message}`);
  }
};

// Hapus Lore
export const deleteLore = async (campaignId, id) => {
  if (!campaignId || !id) return;
  try {
    const loreRef = ref(db, `campaigns/${campaignId}/lore/${id}`);
    await remove(loreRef);
  } catch (error) {
    console.error("Error deleting lore:", error);
    throw new Error(`Gagal menghapus Lore: ${error.message}`);
  }
};