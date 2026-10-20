import { useState } from 'react';
import { X, Key } from 'lucide-react';
import { joinCampaign } from '../../controllers/campaignController';

export default function JoinCampaignModal({ isOpen, onClose, setActiveCampaignId }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const campaignId = await joinCampaign(code.toUpperCase());
      setActiveCampaignId(campaignId); // Langsung pindah ke campaign tersebut
      setCode('');
      onClose();
    } catch (err) {
      setError(err.message || "Gagal bergabung ke kampanye.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-parchment-light w-full max-w-md rounded-xl shadow-2xl relative text-grimoire-dark border border-parchment-dark">
        <div className="flex justify-between items-center p-6 border-b border-parchment-dark bg-white/50">
          <div className="flex items-center gap-3">
            <div className="bg-grimoire-dark p-2 rounded">
              <Key className="text-grimoire-gold w-5 h-5" />
            </div>
            <h2 className="text-2xl font-serif uppercase">Join Campaign</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-grimoire-dark">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Invite Code</label>
            <input 
              type="text" 
              required 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              className="w-full px-4 py-3 border border-parchment-dark rounded focus:outline-none focus:border-grimoire-gold font-serif text-center text-2xl tracking-[0.5em] uppercase bg-white" 
              placeholder="XXXXXX" 
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">Minta 6 digit kode invite ini dari Dungeon Master Anda.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-parchment-dark">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500">Cancel</button>
            <button type="submit" disabled={loading || code.length < 6} className="bg-grimoire-dark hover:bg-grimoire-light text-white font-bold py-2 px-6 rounded disabled:opacity-50">
              {loading ? 'Joining...' : 'Join Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}