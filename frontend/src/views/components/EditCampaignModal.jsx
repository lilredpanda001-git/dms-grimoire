import { useState, useEffect } from 'react';
import { X, Map, Trash2 } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebase'; 
// PASTIKAN import fungsi baru yang tadi kita buat
import { updateCampaignInfo, updateChapter, deleteChapter, deleteCampaign } from '../../controllers/campaignController'; 

export default function EditCampaignModal({ isOpen, onClose, activeCampaignId }) {
  // State untuk Campaign Info
  const [formData, setFormData] = useState({
    title: '',
    system: '',
    status: '',
    campaignDescription: '',
    progress: 0,
    currentLocation: '',
    locationDesc: ''
  });
  
  // State khusus untuk memanajemen Chapter
  const [availableChapters, setAvailableChapters] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [chapterData, setChapterData] = useState({
    title: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !activeCampaignId) return;

    const campaignRef = ref(db, `campaigns/${activeCampaignId}/info`);
    const chaptersRef = ref(db, `campaigns/${activeCampaignId}/chapters`);

    let currentActiveChapterTitle = '';

    const unsubInfo = onValue(campaignRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        currentActiveChapterTitle = data.chapterTitle; // Simpan untuk disinkronkan dengan list chapter
        
        setFormData({
          title: data.title || '',
          system: data.system || '',
          status: data.status || 'Active',
          campaignDescription: data.campaignDescription || data.description || '',
          progress: data.progress || 0,
          currentLocation: data.currentLocation || '',
          locationDesc: data.locationDesc || ''
        });
      }
    });

    const unsubChapters = onValue(chaptersRef, (snapshot) => {
      if (snapshot.exists()) {
        const chaps = [];
        snapshot.forEach(child => {
          chaps.push({ id: child.key, ...child.val() });
        });
        setAvailableChapters(chaps);

        // Cari chapter yang judulnya sedang aktif di Info
        const activeChap = chaps.find(c => c.title === currentActiveChapterTitle) || chaps[0];
        
        if (activeChap) {
          setSelectedChapterId(activeChap.id);
          setChapterData({
            title: activeChap.title || '',
            description: activeChap.description || ''
          });
        }
      } else {
        setAvailableChapters([]);
        setSelectedChapterId('');
        setChapterData({ title: '', description: '' });
      }
    });

    return () => { unsubInfo(); unsubChapters(); };
  }, [isOpen, activeCampaignId]);

  if (!isOpen) return null;

  // Handler saat DM memilih chapter lain dari dropdown
  const handleChapterSelect = (e) => {
    const chapId = e.target.value;
    setSelectedChapterId(chapId);
    
    const chap = availableChapters.find(c => c.id === chapId);
    if (chap) {
      setChapterData({ 
        title: chap.title || '', 
        description: chap.description || '' 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCampaignId) return;

    setLoading(true);
    try {
      // 1. Simpan perubahan ke Campaign Info (Overview)
      await updateCampaignInfo(activeCampaignId, {
        ...formData,
        chapterTitle: chapterData.title, // Info merefleksikan judul chapter yang sedang aktif diedit
        chapterDescription: chapterData.description,
        progress: parseInt(formData.progress) || 0
      });

      // 2. Simpan perubahan Rename/Deskripsi ke dalam spesifik Chapter tersebut
      if (selectedChapterId) {
        await updateChapter(activeCampaignId, selectedChapterId, {
          title: chapterData.title,
          description: chapterData.description
        });
      }

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (!selectedChapterId) return;
    if (window.confirm(`Hapus chapter "${chapterData.title}"?`)) {
      await deleteChapter(activeCampaignId, selectedChapterId);
      // Firebase onValue akan otomatis me-refresh dropdown
    }
  };

  const handleDeleteCampaign = async () => {
    if (window.confirm(`PERINGATAN BAHAYA!\n\nApakah Anda yakin ingin menghapus campaign "${formData.title}" SECARA PERMANEN? Semua data akan musnah!`)) {
      await deleteCampaign(activeCampaignId);
      onClose();
      // Overview akan otomatis mendeteksi bahwa activeCampaignId sudah hilang dan me-reset layar
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-parchment-light w-full max-w-2xl rounded-xl shadow-2xl relative text-grimoire-dark border border-parchment-dark max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-parchment-dark bg-white/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-grimoire-dark p-2 rounded">
              <Map className="text-grimoire-gold w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif uppercase">Update Campaign</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-grimoire-dark">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* BAGIAN 1: GENERAL CAMPAIGN INFO */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Campaign Name</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold font-serif" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">System</label>
                  <input type="text" value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value})} className="w-full px-3 py-2 border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold text-sm">
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Overall Campaign Lore / Description</label>
              <textarea rows="2" required value={formData.campaignDescription} onChange={(e) => setFormData({...formData, campaignDescription: e.target.value})} className="w-full px-3 py-2 border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold text-sm resize-none"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Location (Name)</label>
                <input type="text" required value={formData.currentLocation} onChange={(e) => setFormData({...formData, currentLocation: e.target.value})} className="w-full px-3 py-2 border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold font-serif" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Overall Progress (%)</label>
                <input type="number" min="0" max="100" required value={formData.progress} onChange={(e) => setFormData({...formData, progress: e.target.value})} className="w-full px-3 py-2 border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold" />
              </div>
            </div>
          </div>

          {/* BAGIAN 2: CHAPTER MANAGEMENT */}
          <div className="border-t border-parchment-dark pt-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-lg uppercase font-bold text-grimoire-dark">Manage Chapters</h3>
              {availableChapters.length > 1 && (
                <button type="button" onClick={handleDeleteChapter} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete Chapter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">1. Select Chapter to Edit</label>
                <select value={selectedChapterId} onChange={handleChapterSelect} className="w-full px-3 py-2 border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold text-sm mb-4">
                  {availableChapters.map((chap) => (
                    <option key={chap.id} value={chap.id}>{chap.title}</option>
                  ))}
                </select>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 text-grimoire-gold">2. Rename Chapter (Optional)</label>
                <input type="text" required value={chapterData.title} onChange={(e) => setChapterData({...chapterData, title: e.target.value})} className="w-full px-3 py-2 border border-grimoire-gold rounded focus:outline-none focus:ring-1 focus:ring-grimoire-gold font-serif" placeholder="Chapter title..." />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 text-grimoire-gold">3. Chapter Description / Objectives</label>
                <textarea rows="5" required value={chapterData.description} onChange={(e) => setChapterData({...chapterData, description: e.target.value})} className="w-full h-[calc(100%-1.5rem)] px-3 py-2 border border-grimoire-gold rounded focus:outline-none focus:ring-1 focus:ring-grimoire-gold text-sm resize-none" placeholder="Write objectives specific to this chapter..."></textarea>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-between items-center border-t border-parchment-dark mt-6">
            {/* TOMBOL DELETE CAMPAIGN */}
            <button type="button" onClick={handleDeleteCampaign} className="px-4 py-2 text-xs font-bold text-red-500 hover:text-white hover:bg-red-600 rounded transition border border-transparent hover:border-red-700">
              DELETE CAMPAIGN
            </button>

            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
              <button type="submit" disabled={loading} className="bg-grimoire-dark hover:bg-grimoire-light text-white font-bold py-2 px-6 rounded shadow-md transition-colors">
                {loading ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}