import { useState, useEffect } from 'react';
import { X, Backpack } from 'lucide-react';
import { addItem, updateItem } from '../../controllers/inventoryController';

export default function InventoryFormModal({ isOpen, onClose, activeCampaignId, editData }) {
  const [formData, setFormData] = useState({ name: '', type: 'Misc', quantity: 1, description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({ 
        name: editData.name, 
        type: editData.type, 
        quantity: editData.quantity, 
        description: editData.description 
      });
    } else {
      setFormData({ name: '', type: 'Misc', quantity: 1, description: '' });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCampaignId) {
      alert("Pilih campaign terlebih dahulu!");
      return;
    }
    
    setLoading(true);
    try {
      if (editData) {
        await updateItem(activeCampaignId, editData.id, formData);
      } else {
        await addItem(activeCampaignId, formData);
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-parchment-light w-full max-w-lg rounded-xl shadow-2xl relative text-grimoire-dark border border-parchment-dark">
        <div className="flex justify-between items-center p-6 border-b border-parchment-dark bg-white/50">
          <div className="flex items-center gap-3">
            <div className="bg-grimoire-dark p-2 rounded">
              <Backpack className="text-grimoire-gold w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif uppercase">{editData ? 'Edit Item' : 'Stash Item'}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-grimoire-dark">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
              <input 
                type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-white border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold font-serif"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qty</label>
              <input 
                type="number" min="1" required value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 bg-white border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold font-serif text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
            <select 
              value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold font-serif text-sm"
            >
              <option value="Weapon">Weapon</option>
              <option value="Armor">Armor</option>
              <option value="Potion">Potion</option>
              <option value="Magic Item">Magic Item</option>
              <option value="Misc">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Description / Stats</label>
            <textarea 
              rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Damage, effects, or lore behind this item..."
              className="w-full px-3 py-2 bg-white border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold resize-none text-sm leading-relaxed"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-parchment-dark">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500">Cancel</button>
            <button type="submit" disabled={loading} className="bg-grimoire-dark hover:bg-grimoire-light text-white font-bold py-2 px-6 rounded">
              {loading ? 'Stashing...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}