import { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, Trash2, Map as MapIcon, Shield, ScrollText, Gem, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../firebase';
import { deleteLore } from '../../../controllers/loreController';
import LoreFormModal from '../LoreFormModal'; // Sesuaikan path ini jika Anda menggunakan nama AddLoreModal

// Tambahkan prop role='dm' agar Player tidak bisa edit/delete
export default function LoreView({ activeCampaignId, role = 'dm' }) {
  const [lores, setLores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // State untuk Expand/Collapse Card
  const [expandedIds, setExpandedIds] = useState({});
  
  // State untuk Modal Edit/Add mandiri di dalam LoreView
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLore, setEditingLore] = useState(null);

  useEffect(() => {
    if (!activeCampaignId) {
      setLores([]);
      setLoading(false);
      return;
    }

    const loreRef = ref(db, `campaigns/${activeCampaignId}/lore`);
    const unsubLore = onValue(loreRef, (snapshot) => {
      if (snapshot.exists()) {
        const loreArray = Object.values(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt);
        setLores(loreArray);
      } else {
        setLores([]);
      }
      setLoading(false);
    });
    return () => unsubLore();
  }, [activeCampaignId]);

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryIcon = (category) => {
    if (category === 'Location') return <MapIcon className="w-4 h-4 text-blue-600" />;
    if (category === 'Faction') return <Shield className="w-4 h-4 text-red-600" />;
    if (category === 'History') return <ScrollText className="w-4 h-4 text-amber-700" />;
    if (category === 'Item') return <Gem className="w-4 h-4 text-purple-600" />;
    return <BookOpen className="w-4 h-4 text-gray-600" />;
  };

  const filteredLores = lores.filter(lore => 
    (filterCategory === 'All' || lore.category === filterCategory) &&
    (lore.title.toLowerCase().includes(searchTerm.toLowerCase()) || lore.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1">World Archive</p>
          <h2 className="font-serif text-3xl text-grimoire-dark uppercase">Story & Lore</h2>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" placeholder="Search archive..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-parchment-dark rounded-md focus:outline-none focus:border-grimoire-gold text-sm"
            />
          </div>
          <select 
            value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-white border border-parchment-dark rounded-md text-sm font-bold text-gray-600 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Location">Locations</option>
            <option value="Faction">Factions</option>
            <option value="History">History</option>
            <option value="Item">Items</option>
          </select>
          
          {role === 'dm' && (
            <button 
              onClick={() => { setEditingLore(null); setIsModalOpen(true); }}
              className="bg-grimoire-dark hover:bg-grimoire-light text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-grimoire-gold" /> Add Lore
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><p className="text-gray-400 animate-pulse">Dusting off the tomes...</p></div>
      ) : filteredLores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {filteredLores.map(lore => {
            const isExpanded = expandedIds[lore.id];
            const isLongText = lore.content.length > 150 || lore.content.split('\n').length > 4;

            return (
              // TAMBAHKAN min-w-0 DI SINI UNTUK MENCEGAH KARTU MELEBAR
              <div key={lore.id} className="bg-white border border-parchment-dark rounded-xl p-6 shadow-sm relative group hover:border-grimoire-gold transition-colors flex flex-col h-full min-w-0">
                
                {role === 'dm' && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                    <button 
                      onClick={() => { setEditingLore(lore); setIsModalOpen(true); }}
                      className="text-gray-300 hover:text-blue-500 transition-colors"
                      title="Edit Lore"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { if(window.confirm(`Hapus catatan "${lore.title}" dari arsip?`)) deleteLore(activeCampaignId, lore.id) }}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                      title="Hapus Lore"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  {getCategoryIcon(lore.category)}
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{lore.category}</span>
                </div>
                
                {/* TAMBAHKAN truncate atau break-words JIKA JUDUL TERLALU PANJANG */}
                <h3 className="font-serif font-bold text-xl uppercase text-grimoire-dark mb-3 leading-tight pr-12 break-words">
                  {lore.title}
                </h3>
                
                {/* TAMBAHKAN break-words DI SINI UNTUK MEMAKSA TEKS TURUN KE BAWAH */}
                <p className={`text-sm text-gray-600 whitespace-pre-wrap break-words leading-relaxed ${isExpanded ? '' : 'line-clamp-4'}`}>
                  {lore.content}
                </p>

                {isLongText && (
                  <button 
                    onClick={() => toggleExpand(lore.id)}
                    className="mt-4 text-xs font-bold text-grimoire-gold hover:text-grimoire-dark flex items-center gap-1 transition-colors w-fit"
                  >
                    {isExpanded ? <><ChevronUp className="w-3 h-3" /> Read Less</> : <><ChevronDown className="w-3 h-3" /> Read More</>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center">
          <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="font-serif text-xl text-gray-400 uppercase mb-2">The Archive is Empty</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md">Chronicle the world's history, document factions, and note down important locations to keep your campaign rich and immersive.</p>
        </div>
      )}

      {/* RENDER MODAL DI DALAM LORE VIEW */}
      <LoreFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingLore(null); }} 
        activeCampaignId={activeCampaignId}
        editData={editingLore}
      />
    </div>
  );
}