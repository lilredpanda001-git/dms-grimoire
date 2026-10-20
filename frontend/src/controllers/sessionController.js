import { ref, push, set, update, remove, get } from 'firebase/database';
import { db } from '../firebase';

// Tambah sesi baru (Path: campaigns/{campaignId}/sessions)
export const addSession = async (campaignId, title = 'Sesi Baru') => {
  if (!campaignId) throw new Error("Campaign ID wajib disertakan.");
  
  try {
    const sessionListRef = ref(db, `campaigns/${campaignId}/sessions`);
    const newSessionRef = push(sessionListRef);
    
    await set(newSessionRef, {
      id: newSessionRef.key,
      title: title,
      content: '',
      inGameDate: '',
      isCompleted: false, 
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    return newSessionRef.key;
  } catch (error) {
    console.error("Error adding session: ", error);
    throw error;
  }
};

// Update sesi & Trigger auto-Chronicle
export const updateSession = async (campaignId, sessionId, updatedData) => {
  if (!campaignId || !sessionId) return;
  try {
    const sessionRef = ref(db, `campaigns/${campaignId}/sessions/${sessionId}`);
    
    // Ambil data lama sebelum di-update untuk verifikasi
    const snapshot = await get(sessionRef);
    if (snapshot.exists()) {
      const oldData = snapshot.val();
      
      // LOGIKA TRIGGER: Jika sebelumnya isCompleted false, dan sekarang menjadi true
      if (!oldData.isCompleted && updatedData.isCompleted === true) {
        // Otomatis buat entri baru ke Chronicle campaign tersebut
        const chronRef = ref(db, `campaigns/${campaignId}/chronicles`);
        const newChronRef = push(chronRef);
        await set(newChronRef, {
          id: newChronRef.key,
          title: updatedData.title || oldData.title || "Sesi Tanpa Judul",
          sessionNumber: oldData.sessionNumber || 1, 
          description: updatedData.content || oldData.content || "Tidak ada detail sesi.",
          createdAt: Date.now()
        });
      }
    }

    // Update data session utamanya
    await update(sessionRef, {
      ...updatedData,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error updating session: ", error);
    throw error;
  }
};

// Hapus sesi (Path disesuaikan ke campaigns/)
export const deleteSession = async (campaignId, id) => {
  if (!campaignId || !id) return;
  try {
    const sessionRef = ref(db, `campaigns/${campaignId}/sessions/${id}`);
    await remove(sessionRef);
  } catch (error) {
    console.error("Error deleting session: ", error);
    throw error;
  }
};