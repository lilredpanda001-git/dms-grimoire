import { useState, useEffect } from 'react';
import { Backpack, Search, Plus, Trash2, Edit3, ChevronDown, ChevronUp, Sword, Shield, FlaskConical, Gem, Box } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../../firebase';
import { deleteItem } from '../../../controllers/inventoryController';
import InventoryFormModal from '../InventoryFormModal'; // Sesuaikan path ini jika Anda menggunakan AddInventoryModal

export default function InventoryView({ activeCampaignId, role }) {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);

  // State untuk Expand/Collapse Card
  const [expandedIds, setExpandedIds] = useState({});
  
  // State untuk Modal Edit/Add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!activeCampaignId) {
      setItems([]);
      setLoading(false);
      return;
    }

    const inventoryRef = ref(db, `campaigns/${activeCampaignId}/inventory`);
    const unsub = onValue(inventoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const itemArray = Object.values(snapshot.val()).sort((a, b) => b.createdAt - a.createdAt);
        setItems(itemArray);
      } else {
        setItems([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [activeCampaignId]);

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getItemIcon = (type) => {
    if (type === 'Weapon') return <Sword className="w-4 h-4 text-red-600" />;
    if (type === 'Armor') return <Shield className="w-4 h-4 text-gray-600" />;
    if (type === 'Potion') return <FlaskConical className="w-4 h-4 text-green-600" />;
    if (type === 'Magic Item') return <Gem className="w-4 h-4 text-purple-600" />;
    return <Box className="w-4 h-4 text-amber-700" />;
  };

  const filteredItems = items.filter(item => 
    (filterType === 'All' || item.type === filterType) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-1">Party Stash</p>
          <h2 className="font-serif text-3xl text-grimoire-dark uppercase">Inventory</h2>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" placeholder="Search loot..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-parchment-dark rounded-md focus:outline-none focus:border-grimoire-gold text-sm"
            />
          </div>
          <select 
            value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-white border border-parchment-dark rounded-md text-sm font-bold text-gray-600 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Weapon">Weapons</option>
            <option value="Armor">Armor</option>
            <option value="Potion">Potions</option>
            <option value="Magic Item">Magic Items</option>
            <option value="Misc">Misc</option>
          </select>
          
          <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
            className="bg-grimoire-dark hover:bg-grimoire-light text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-bold whitespace-nowrap"
          >
            <Plus className="w-4 h-4 text-grimoire-gold" /> Add Loot
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><p className="text-gray-400 animate-pulse">Checking the bags...</p></div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {filteredItems.map(item => {
            const isExpanded = expandedIds[item.id];
            // Cek jika teks deskripsi panjang untuk memunculkan tombol expand
            const isLongText = item.description && (item.description.length > 120 || item.description.split('\n').length > 3);

            return (
              // TAMBAHKAN min-w-0 agar kartu tidak melebar ke samping
              <div key={item.id} className="bg-white border border-parchment-dark rounded-xl p-6 shadow-sm relative group hover:border-grimoire-gold transition-colors flex flex-col h-full min-w-0">
                
                {/* TOMBOL EDIT & HAPUS */}
                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2">
                  <button 
                    onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                    className="text-gray-300 hover:text-blue-500 transition-colors"
                    title="Edit Item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { if(window.confirm(`Hapus "${item.name}" dari inventory?`)) deleteItem(activeCampaignId, item.id) }}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Hapus Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-3 pr-16">
                  <div className="flex items-center gap-2">
                    {getItemIcon(item.type)}
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.type}</span>
                  </div>
                  <div className="bg-parchment-dark px-2 py-0.5 rounded text-xs font-bold text-grimoire-dark border border-grimoire-gold/30">
                    x{item.quantity}
                  </div>
                </div>
                
                {/* break-words agar teks yang tidak berspasi turun ke bawah */}
                <h3 className="font-serif font-bold text-xl uppercase text-grimoire-dark mb-2 leading-tight pr-12 break-words">
                  {item.name}
                </h3>
                
                {item.description ? (
                  <>
                    <p className={`text-sm text-gray-600 whitespace-pre-wrap break-words leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                      {item.description}
                    </p>
                    
                    {isLongText && (
                      <button 
                        onClick={() => toggleExpand(item.id)}
                        className="mt-3 text-xs font-bold text-grimoire-gold hover:text-grimoire-dark flex items-center gap-1 transition-colors w-fit"
                      >
                        {isExpanded ? <><ChevronUp className="w-3 h-3" /> Hide Details</> : <><ChevronDown className="w-3 h-3" /> See Details</>}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">No description provided.</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center flex flex-col items-center">
          <Backpack className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="font-serif text-xl text-gray-400 uppercase mb-2">Bags are Empty</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md">The party hasn't found any loot yet. Keep exploring to discover weapons, gold, and magical artifacts.</p>
        </div>
      )}

      {/* RENDER MODAL INVENTORY DI DALAM VIEW */}
      <InventoryFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
        activeCampaignId={activeCampaignId}
        editData={editingItem}
      />
    </div>
  );
}