import { ref, push, set, update, remove } from 'firebase/database';
import { db } from '../firebase';

export const addItem = async (campaignId, itemData) => {
  if (!campaignId) return;
  try {
    const itemRef = ref(db, `campaigns/${campaignId}/inventory`);
    const newItemRef = push(itemRef);
    
    await set(newItemRef, {
      id: newItemRef.key,
      name: itemData.name || "Unknown Item",
      type: itemData.type || "Misc",
      quantity: itemData.quantity || 1,
      description: itemData.description || "",
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("Error adding item:", error);
    throw error;
  }
};

export const updateItem = async (campaignId, itemId, itemData) => {
  if (!campaignId || !itemId) return;
  try {
    const itemRef = ref(db, `campaigns/${campaignId}/inventory/${itemId}`);
    await update(itemRef, {
      name: itemData.name,
      type: itemData.type,
      quantity: itemData.quantity,
      description: itemData.description,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

export const deleteItem = async (campaignId, itemId) => {
  if (!campaignId || !itemId) return;
  try {
    const itemRef = ref(db, `campaigns/${campaignId}/inventory/${itemId}`);
    await remove(itemRef);
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};