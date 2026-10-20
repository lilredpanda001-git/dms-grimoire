import { ref, set, update, push, get, remove } from 'firebase/database';
import { db, auth } from '../firebase';

// 1. BUAT KAMPANYE (Otomatis atur DM sebagai member)
export const createNewCampaign = async (title = 'Untitled Campaign') => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User belum login.");

    const campaignsRef = ref(db, 'campaigns');
    const newCampRef = push(campaignsRef); 
    const campaignId = newCampRef.key;
    
    // Generate kode unik 6 karakter untuk invite pemain
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await set(newCampRef, {
      info: {
        title: title,
        chapterTitle: 'Chapter 1: The Beginning',
        system: 'D&D 5e',
        status: 'Active',
        description: 'Sebuah petualangan baru dimulai...',
        progress: 0,
        currentLocation: 'Unknown',
        locationDesc: '',
        inviteCode: inviteCode, // Simpan kode untuk pemain
        createdAt: Date.now()
      },
      // ACL: Sistem akses siapa saja yang bisa masuk ke kampanye ini
      members: {
        [user.uid]: 'dm' // Pembuat otomatis menjadi DM
      }
    });

    const chaptersRef = ref(db, `campaigns/${campaignId}/chapters`);
    const newChapRef = push(chaptersRef);
    await set(newChapRef, {
      title: 'Chapter 1: The Beginning',
      createdAt: Date.now()
    });
    
    return campaignId;
  } catch (error) {
    console.error("Error creating campaign: ", error);
    throw error;
  }
};

// 2. JOIN KAMPANYE (Untuk Player)
export const joinCampaign = async (inviteCode) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User belum login.");
    if (!inviteCode) throw new Error("Kode invite kosong.");

    const campaignsRef = ref(db, 'campaigns');
    const snapshot = await get(campaignsRef);
    
    if (!snapshot.exists()) throw new Error("Tidak ada kampanye yang ditemukan.");

    let foundCampaignId = null;
    
    // Cari kampanye yang kode invite-nya cocok
    snapshot.forEach((childSnap) => {
      const campData = childSnap.val();
      if (campData.info?.inviteCode === inviteCode.toUpperCase()) {
        foundCampaignId = childSnap.key;
      }
    });

    if (!foundCampaignId) throw new Error("Kode Invite tidak valid atau kampanye tidak ditemukan.");

    // Tambahkan user sebagai 'player' di kampanye tersebut
    await set(ref(db, `campaigns/${foundCampaignId}/members/${user.uid}`), 'player');
    
    return foundCampaignId;
  } catch (error) {
    console.error("Error joining campaign:", error);
    throw error;
  }
};

export const updateCampaignInfo = async (campaignId, updatedData) => {
  if (!campaignId) return;
  try {
    const infoRef = ref(db, `campaigns/${campaignId}/info`);
    await update(infoRef, {
      ...updatedData,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error updating campaign info: ", error);
    throw error;
  }
};

export const addChapterToCampaign = async (campaignId, chapterTitle) => {
  if (!campaignId || !chapterTitle) return;
  try {
    const chaptersRef = ref(db, `campaigns/${campaignId}/chapters`);
    const newChapRef = push(chaptersRef);
    await set(newChapRef, {
      title: chapterTitle,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("Error adding chapter: ", error);
    throw error;
  }
};

export const updateChapter = async (campaignId, chapterId, updatedData) => {
  if (!campaignId || !chapterId) return;
  try {
    const chapRef = ref(db, `campaigns/${campaignId}/chapters/${chapterId}`);
    await update(chapRef, updatedData);
  } catch (error) {
    console.error("Error updating chapter: ", error);
    throw error;
  }
};

export const deleteChapter = async (campaignId, chapterId) => {
  if (!campaignId || !chapterId) return;
  try {
    const chapRef = ref(db, `campaigns/${campaignId}/chapters/${chapterId}`);
    await remove(chapRef);
  } catch (error) {
    console.error("Error deleting chapter: ", error);
    throw error;
  }
};

export const deleteCampaign = async (campaignId) => {
  if (!campaignId) return;
  try {
    const campRef = ref(db, `campaigns/${campaignId}`);
    await remove(campRef);
  } catch (error) {
    console.error("Error deleting campaign: ", error);
    throw error;
  }
};