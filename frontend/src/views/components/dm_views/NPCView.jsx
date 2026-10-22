import { useState, useEffect } from 'react';
import { Users, Search, Sparkles, MapPin, Trash2, Edit2, Heart, Shield } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../firebase';
import { deleteNpc } from '../../../controllers/npcController';
import EditNPCModal from '../EditNPCModal';

// TAMBAHKAN activeCampaignId SEBAGAI PROP
export default function NpcView({ activeCampaignId, onOpenScribe }) {
  const [npcs, setNpcs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedNpcToEdit, setSelectedNpcToEdit] = useState(null);

  useEffect(() => {
    // Jika tidak ada campaign yang aktif, kosongkan daftar NPC
    if (!activeCampaignId) {
      setNpcs([]);
      setLoading(false);
      return;
    }

    // UBAH PATH MENJADI DINAMIS
    const npcRef = ref(db, `campaigns/${activeCampaignId}/npcs`);
    const unsubNpc = onValue(npcRef, (snapshot) => {
      if (snapshot.exists()) {
        const npcArray = Object.values(snapshot.val()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setNpcs(npcArray);
      } else {
        setNpcs([]);
      }
      setLoading(false);
    });

    return () => unsubNpc();
  }, [activeCampaignId]); // Jadikan activeCampaignId sebagai dependency

  // Filter NPC berdasarkan pencarian nama atau role
  const filteredNpcs = npcs.filter(npc => 
    (npc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (npc.role || npc.title || npc.class || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      {/* Header NPC */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1">Dramatis Personae</p>
          <h2 className="font-serif text-3xl text-grimoire-dark uppercase">Non-Player Characters</h2>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search NPC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-parchment-dark rounded-md focus:outline-none focus:border-grimoire-gold text-sm"
            />
          </div>
          
          {/* Arcane Scribe Button */}
          <button 
            onClick={onOpenScribe}
            className="bg-grimoire-dark hover:bg-grimoire-light text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-bold shadow-md whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-grimoire-gold" /> Conjure NPC
          </button>
        </div>
      </div>

      {/* Grid NPC */}
      {loading ? (
        <div className="flex justify-center py-20"><p className="text-gray-400 animate-pulse">Consulting the Grimoire...</p></div>
      ) : filteredNpcs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNpcs.map((npc) => {
            const role = npc.role || npc.title || npc.class || npc.type || 'NPC';
            const description = npc.description || npc.lore || npc.personality || '';
            const abilityScores = ['str', 'dex', 'con', 'int', 'wis', 'cha']
              .filter((stat) => npc.stats?.[stat] !== undefined);

            return (
            <div key={npc.id} className="bg-white border border-parchment-dark rounded-xl p-5 shadow-sm relative group hover:border-grimoire-gold transition-colors flex flex-col h-full">
              
              {/* Tombol Aksi (Edit & Delete) */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation();
                    setSelectedNpcToEdit(npc);
                    setIsEditModalOpen(true);
                  }}
                  className="text-gray-300 hover:text-blue-500 transition-colors bg-white/80 rounded-full p-1"
                  title="Edit NPC"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation();
                    // KIRIM activeCampaignId KE FUNGSI DELETE
                    if(window.confirm(`Hapus ${npc.name} dari catatan?`)) deleteNpc(activeCampaignId, npc.id); 
                  }}
                  className="text-gray-300 hover:text-red-500 transition-colors bg-white/80 rounded-full p-1"
                  title="Hapus NPC"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-parchment border border-parchment-dark text-grimoire-dark flex items-center justify-center rounded-full font-serif text-lg font-bold shrink-0">
                  {npc.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg uppercase text-grimoire-dark leading-tight pr-12">{npc.name}</h3>
                  <p className="text-xs text-grimoire-gold font-bold uppercase tracking-wider">{role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                <MapPin className="w-3 h-3" /> {npc.location || 'Unknown'}
              </div>

              {(npc.hp || npc.armorClass !== undefined) && (
                <div className="flex gap-5 mb-3 text-sm text-gray-600">
                  {npc.hp && (
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-red-500" />
                      HP {npc.hp.current ?? npc.hp.max ?? 0}/{npc.hp.max ?? 0}
                    </span>
                  )}
                  {npc.armorClass !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-gray-600" /> AC {npc.armorClass}
                    </span>
                  )}
                </div>
              )}

              {abilityScores.length > 0 && (
                <div className="grid grid-cols-6 gap-1.5 mb-4">
                  {abilityScores.map((stat) => (
                    <div key={stat} className="rounded border border-parchment-dark bg-parchment-light/50 p-1.5 text-center">
                      <p className="text-[9px] font-bold uppercase text-grimoire-gold">{stat}</p>
                      <p className="font-serif font-bold text-grimoire-dark">{npc.stats[stat]}</p>
                    </div>
                  ))}
                </div>
              )}

              <div 
                className="mb-4 flex-1 cursor-pointer group/desc relative"
                onClick={() => setExpandedId(expandedId === npc.id ? null : npc.id)}
              >
                <p className={`text-sm text-gray-600 transition-all duration-300 italic ${expandedId === npc.id ? '' : 'line-clamp-4'}`}>
                  "{description}"
                </p>
                <p className="text-xs font-semibold text-grimoire-gold mt-1.5 opacity-0 group-hover/desc:opacity-100 transition-opacity inline-block">
                  {expandedId === npc.id ? 'Tutup deskripsi' : 'Baca selengkapnya...'}
                </p>
              </div>
              
              <div className="mt-auto pt-3 border-t border-parchment-dark">
                <p className="text-xs text-gray-500"><span className="font-bold text-grimoire-dark">Traits:</span> {npc.traits || npc.disposition || '—'}</p>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="font-serif text-xl text-gray-400 uppercase mb-2">No NPCs Found</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            The world is empty. Use the Arcane Scribe to conjure new inhabitants for your campaign, or add them manually.
          </p>
          <button 
            onClick={onOpenScribe}
            className="text-grimoire-gold hover:text-grimoire-dark font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Open Arcane Scribe
          </button>
        </div>
      )}
      
      {/* TERUSKAN activeCampaignId KE MODAL EDIT */}
      <EditNPCModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedNpcToEdit(null);
        }} 
        npcData={selectedNpcToEdit}
        activeCampaignId={activeCampaignId} 
      />
    </div>
  );
}