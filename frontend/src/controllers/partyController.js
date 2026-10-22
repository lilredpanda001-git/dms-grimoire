import { ref, push, set, update, remove } from 'firebase/database';
import { db } from '../firebase';

// Tambah karakter ke campaign spesifik
export const addCharacter = async (campaignId, characterData) => {
  if (!campaignId) throw new Error("Pilih kampanye terlebih dahulu.");
  try {
    const partyRef = ref(db, `campaigns/${campaignId}/party`);
    const newCharRef = push(partyRef);
    const hpMax = Number(characterData.combat?.hpMax ?? characterData.hpMax ?? 10);
    const hpCurrent = Number(characterData.combat?.hpCurrent ?? characterData.hpCurrent ?? hpMax);
    const ac = Number(characterData.combat?.ac ?? characterData.ac ?? 10);

    await set(newCharRef, {
      id: newCharRef.key,
      ...characterData,
      combat: {
        ...characterData.combat,
        hpMax,
        hpCurrent,
        ac,
        hpTemp: Number(characterData.combat?.hpTemp ?? 0),
        initiativeModifier: Number(characterData.combat?.initiativeModifier ?? 0),
        speed: Number(characterData.combat?.speed ?? 30),
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error adding character: ", error);
    throw error;
  }
};

// Update karakter di campaign spesifik
export const updateFullCharacter = async (campaignId, characterId, characterData) => {
  if (!campaignId || !characterId) return;
  try {
    const charRef = ref(db, `campaigns/${campaignId}/party/${characterId}`);
    await update(charRef, {
      ...characterData,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error updating character: ", error);
    throw error;
  }
};