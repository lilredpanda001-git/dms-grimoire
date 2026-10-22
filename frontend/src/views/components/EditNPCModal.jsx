import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { updateNpc } from "../../controllers/npcController";

export default function EditNPCModal({ isOpen, onClose, npcData, activeCampaignId }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    location: '',
    traits: '',
    description: '',
    race: '',
    characterClass: '',
    level: 1,
    hpCurrent: 10,
    hpMax: 10,
    armorClass: 10,
    stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (npcData) {
      const hpMax = Number(npcData.hp?.max ?? npcData.hpMax ?? 10);
      setFormData({
        name: npcData.name || '',
        role: npcData.role || npcData.title || npcData.class || '',
        location: npcData.location || '',
        traits: npcData.traits || '',
        description: npcData.description || npcData.content || npcData.lore || npcData.personality || '',
        race: npcData.race || '',
        characterClass: npcData.class || '',
        level: npcData.level ?? 1,
        hpCurrent: Number(npcData.hp?.current ?? npcData.hpCurrent ?? hpMax),
        hpMax,
        armorClass: Number(npcData.armorClass ?? npcData.ac ?? 10),
        stats: {
          str: npcData.stats?.str ?? 10,
          dex: npcData.stats?.dex ?? 10,
          con: npcData.stats?.con ?? 10,
          int: npcData.stats?.int ?? 10,
          wis: npcData.stats?.wis ?? 10,
          cha: npcData.stats?.cha ?? 10
        }
      });
    }
  }, [npcData]);

  if (!isOpen || !npcData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, stats: { ...prev.stats, [name]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCampaignId) {
      alert("Pilih campaign terlebih dahulu!");
      return;
    }

    setIsSubmitting(true);
    try {
      const hpMax = Math.max(1, Number(formData.hpMax));
      const hpCurrent = Math.min(hpMax, Math.max(0, Number(formData.hpCurrent)));
      const armorClass = Number(formData.armorClass);
      await updateNpc(activeCampaignId, npcData.id, {
        name: formData.name,
        role: formData.role,
        location: formData.location,
        traits: formData.traits,
        description: formData.description,
        race: formData.race,
        hpCurrent,
        hpMax,
        class: formData.characterClass,
        level: Number(formData.level),
        hp: { current: hpCurrent, max: hpMax },
        armorClass,
        ac: armorClass,
        stats: Object.fromEntries(
          Object.entries(formData.stats).map(([stat, value]) => [stat, Number(value)])
        )
      });
      onClose();
    } catch (error) {
      console.error("Error updating NPC:", error);
      alert("Gagal memperbarui data NPC.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-parchment-dark">
        <div className="bg-grimoire-dark px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-serif text-xl text-parchment uppercase tracking-wider">Edit NPC</h3>
            <p className="text-xs text-grimoire-gold uppercase tracking-widest">{npcData.name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Name</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title / Role</label>
              <input type="text" name="role" required value={formData.role} onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Race</label>
              <input type="text" name="race" value={formData.race} onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Class</label>
              <input type="text" name="characterClass" value={formData.characterClass} onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Level</label>
              <input type="number" name="level" min="1" value={formData.level} onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Traits / Disposition</label>
              <input type="text" name="traits" value={formData.traits} onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm" />
            </div>
          </div>

          <div className="mb-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Combat Stats</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current HP</label>
                <input type="number" name="hpCurrent" min="0" required value={formData.hpCurrent} onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max HP</label>
                <input type="number" name="hpMax" min="1" required value={formData.hpMax} onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Armor Class</label>
                <input type="number" name="armorClass" min="0" required value={formData.armorClass} onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm" />
              </div>
            </div>
          </div>

          <div className="mb-5">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ability Scores</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.keys(formData.stats).map((stat) => (
                <div key={stat}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stat}</label>
                  <input type="number" name={stat} min="1" max="30" required value={formData.stats[stat]} onChange={handleStatChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm text-center" />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description & Backstory</label>
            <textarea name="description" rows="5" value={formData.description} onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-grimoire-gold text-sm resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-grimoire-dark hover:bg-black text-white px-6 py-2 rounded-md flex items-center gap-2 text-sm font-bold transition-colors">
              <Save className="w-4 h-4 text-grimoire-gold" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}