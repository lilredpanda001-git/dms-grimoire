import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Key, Plus, Crown, Shield, LogOut, ArrowRight } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { createNewCampaign, joinCampaign } from '../../controllers/campaignController';

export default function Portal() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    // Pantau kampanye pengguna secara real-time
    const campaignsRef = ref(db, 'campaigns');
    const unsub = onValue(campaignsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userCamps = [];

        for (const key in data) {
          const camp = data[key];
          if (camp.members && camp.members[user.uid]) {
            userCamps.push({
              id: key,
              title: camp.info?.title || 'Untitled Campaign',
              system: camp.info?.system || 'Unknown System',
              role: camp.members[user.uid] // 'dm' atau 'player'
            });
          }
        }
        setMyCampaigns(userCamps);
      } else {
        setMyCampaigns([]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  const handleCreateCampaign = async () => {
    const title = prompt("Masukkan nama Campaign Baru Anda:");
    if (title) {
      setLoading(true);
      try {
        await createNewCampaign(title);
        // Otomatis diarahkan ke DM dashboard karena pembuat adalah DM
        navigate('/dashboard/dm');
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  };

  const handleJoinCampaign = async (e) => {
    e.preventDefault();
    setError('');
    setIsJoining(true);
    try {
      await joinCampaign(joinCode.toUpperCase());
      navigate('/dashboard/player');
    } catch (err) {
      setError(err.message || "Gagal bergabung ke kampanye.");
      setIsJoining(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Keluar dari akun ini?")) {
      await signOut(auth);
      navigate('/login');
    }
  };

  const enterCampaign = (role, id) => {
    // Ingat kampanye mana yang diklik dari Lobby
    localStorage.setItem('targetCampaignId', id);
    
    if (role === 'dm') navigate('/dashboard/dm');
    else navigate('/dashboard/player');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-parchment">
        <div className="animate-pulse text-grimoire-dark font-serif text-2xl uppercase tracking-widest flex flex-col items-center gap-4">
          <BookOpen className="w-10 h-10 text-grimoire-gold" />
          Memasuki Lobby...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment flex justify-center py-12 px-4 animate-fade-in">
      <div className="max-w-5xl w-full">
        
        {/* Header Lobby */}
        <div className="flex justify-between items-end mb-12 border-b border-parchment-dark pb-6">
          <div>
            <h1 className="font-serif text-4xl text-grimoire-dark uppercase mb-2">Campaign Lobby</h1>
            <p className="text-gray-600">Pilih kampanye Anda untuk melanjutkan petualangan.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-bold uppercase tracking-wider"
          >
            Log out <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* KOLOM KIRI: DAFTAR KAMPANYE SAYA */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-serif text-2xl uppercase text-grimoire-dark mb-4">My Grimoires</h2>
            
            {myCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCampaigns.map((camp) => (
                  <div 
                    key={camp.id}
                    onClick={() => enterCampaign(camp.role, camp.id)} // <--- TAMBAHKAN camp.id DI SINI
                    className="bg-white border ... "
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{camp.system}</span>
                        {camp.role === 'dm' ? (
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Dungeon Master
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Player
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-grimoire-dark group-hover:text-grimoire-gold transition-colors leading-tight mb-2">
                        {camp.title}
                      </h3>
                    </div>
                    <div className="flex justify-end mt-4">
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-grimoire-gold transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-dashed border-gray-400 rounded-xl p-10 text-center flex flex-col items-center">
                <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="font-serif text-xl text-gray-500 uppercase mb-2">Tidak Ada Kampanye</h3>
                <p className="text-gray-400 text-sm">Anda belum memiliki atau bergabung dengan kampanye mana pun.</p>
              </div>
            )}
          </div>

          {/* KOLOM KANAN: ACTIONS (CREATE & JOIN) */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl uppercase text-grimoire-dark mb-4">New Journey</h2>
            
            {/* Create Campaign (Jadi DM) */}
            <div className="bg-grimoire-dark text-white rounded-xl p-6 shadow-lg relative overflow-hidden group">
              <Crown className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-5 group-hover:opacity-10 transition-opacity" />
              <h3 className="font-serif text-xl uppercase mb-2">Host Campaign</h3>
              <p className="text-gray-400 text-xs mb-6 max-w-[200px] leading-relaxed">
                Jadilah Dungeon Master. Buat dunia baru dan undang teman-teman Anda.
              </p>
              <button 
                onClick={handleCreateCampaign}
                className="w-full bg-grimoire-gold hover:bg-yellow-600 text-grimoire-dark font-bold py-3 rounded text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors relative z-10"
              >
                <Plus className="w-4 h-4" /> Create New
              </button>
            </div>

            {/* Join Campaign (Jadi Player) */}
            <div className="bg-white border border-parchment-dark rounded-xl p-6 shadow-md relative overflow-hidden group">
              <Shield className="absolute -bottom-4 -right-4 w-24 h-24 text-grimoire-dark opacity-5 group-hover:opacity-10 transition-opacity" />
              <h3 className="font-serif text-xl uppercase text-grimoire-dark mb-2">Join Campaign</h3>
              <p className="text-gray-500 text-xs mb-4 max-w-[200px] leading-relaxed">
                Punya kode invite dari DM Anda? Masukkan di sini untuk bergabung ke dalam party.
              </p>
              
              <form onSubmit={handleJoinCampaign} className="relative z-10">
                {error && <p className="text-red-500 text-xs mb-2 font-bold">{error}</p>}
                <input 
                  type="text" 
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="INVITE CODE" 
                  className="w-full px-4 py-3 mb-3 border border-gray-300 rounded focus:outline-none focus:border-grimoire-gold text-center text-lg tracking-[0.2em] uppercase bg-gray-50 font-bold"
                  maxLength={6}
                />
                <button 
                  type="submit"
                  disabled={isJoining || joinCode.length < 6}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded text-sm uppercase tracking-wider disabled:opacity-50 transition-colors"
                >
                  {isJoining ? 'Joining...' : 'Enter Code'}
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}