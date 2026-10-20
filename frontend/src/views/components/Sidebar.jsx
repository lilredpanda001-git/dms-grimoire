import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. IMPORT INI
import { LayoutGrid, Users, BookOpen, UserSquare2, Backpack, ScrollText, Sparkles, LogOut } from 'lucide-react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar({ role, activeView, setActiveView, onOpenScribe }) {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const navigate = useNavigate(); // <--- 2. INISIALISASI NAVIGASI

  // Pantau status login pengguna secara real-time
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const allMenuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'party', label: 'Party', icon: Users },
    { id: 'lore', label: 'Story & Lore', icon: BookOpen },
    { id: 'npcs', label: 'NPCs', icon: UserSquare2 },
    { id: 'inventory', label: 'Inventory', icon: Backpack },
    { id: 'notes', label: 'Session Notes', icon: ScrollText }
  ];

  const menuItems = role === 'player' 
    ? allMenuItems.filter(m => ['overview', 'party', 'lore', 'inventory'].includes(m.id))
    : allMenuItems;

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari Grimoire?')) {
      try {
        await signOut(auth);
        navigate('/login'); // <--- 3. ARAHKAN KE LOGIN SETELAH LOGOUT
      } catch (error) {
        console.error("Error signing out:", error);
      }
    }
  };

  // Ambil inisial dan nama dari akun Firebase
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Unknown User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="w-64 bg-grimoire-dark text-parchment flex flex-col h-full border-r border-gray-800">
      {/* Header Sidebar */}
      <div className="p-6 flex items-center gap-3 mb-4">
        <div className="w-8 h-8 border border-grimoire-gold/50 rounded flex items-center justify-center">
          <BookOpen className="text-grimoire-gold w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-lg leading-tight">DM's Grimoire</h1>
          <p className="text-[10px] text-grimoire-gold tracking-widest uppercase">Campaign Companion</p>
        </div>
      </div>

      <div className="px-6 mb-4">
        <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">The Grimoire</p>
      </div>

      {/* Navigasi Menu */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-white/10 text-grimoire-gold' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-parchment'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Arcane Scribe AI Button (KHUSUS DM) */}
      {role === 'dm' && (
        <div className="p-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <Sparkles className="w-6 h-6 text-grimoire-gold mb-3" />
            <h4 className="font-serif text-sm font-bold text-white uppercase mb-1">Arcane Scribe</h4>
            <p className="text-xs text-gray-400 mb-3">Conjure an NPC, plot twist, or lore that fits your world.</p>
            <button 
              onClick={onOpenScribe}
              className="text-grimoire-gold hover:text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-colors"
            >
              Open AI scribe &rarr;
            </button>
          </div>
        </div>
      )}

      {/* User Profile & Logout */}
      <div 
        onClick={handleLogout}
        title="Klik untuk Log Out"
        className="p-4 border-t border-gray-800 flex items-center justify-between cursor-pointer hover:bg-red-900/20 group transition-colors"
      >
        <div className="flex items-center gap-3 truncate pr-2">
          <div className="w-8 h-8 shrink-0 bg-grimoire-gold text-grimoire-dark flex items-center justify-center rounded-full font-serif font-bold text-sm">
            {initial}
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-500 capitalize">{role === 'dm' ? 'Dungeon Master' : 'Player'}</p>
          </div>
        </div>
        <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-400 shrink-0 transition-colors" />
      </div>
    </aside>
  );
}