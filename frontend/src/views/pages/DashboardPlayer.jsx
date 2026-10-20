import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Overview from '../components/dm_views/Overview';
import PartyView from '../components/dm_views/PartyView';
import LoreView from '../components/dm_views/LoreView';
import InventoryView from '../components/dm_views/InventoryView';

// Modals khusus Player
import AddCharacterModal from '../components/AddCharacterModal';
import JoinCampaignModal from '../components/JoinCampaignModal';

export default function DashboardPlayer() {
  const [activeView, setActiveView] = useState('overview'); 
  const [activeCampaignId, setActiveCampaignId] = useState(null); 

  // State Modals
  const [isAddCharacterOpen, setIsAddCharacterOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-parchment text-grimoire-dark overflow-hidden font-sans relative">
      
      {/* SIDEBAR DENGAN ROLE 'player' */}
      <Sidebar 
        role="player" 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Tombol Join Campaign (Akan terlihat jika Player belum memilih/punya campaign) */}
        {!activeCampaignId && (
          <div className="absolute top-8 right-8 z-10">
             <button 
               onClick={() => setIsJoinModalOpen(true)}
               className="bg-grimoire-dark text-grimoire-gold px-6 py-2.5 rounded shadow-lg font-bold uppercase tracking-wider text-sm border border-grimoire-gold hover:bg-black transition"
             >
               + Join Campaign
             </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-8">
          
          {activeView === 'overview' && (
            <Overview 
              activeCampaignId={activeCampaignId}
              setActiveCampaignId={setActiveCampaignId}
              setActiveView={setActiveView}
              onOpenAddCharacter={() => setIsAddCharacterOpen(true)}
              role="player" // Memberi tahu Overview bahwa yang melihat adalah Player
            />
          )}

          {activeView === 'party' && (
            <PartyView activeCampaignId={activeCampaignId} role="player" />
          )}

          {activeView === 'lore' && (
            <LoreView activeCampaignId={activeCampaignId} role="player" />
          )}

          {activeView === 'inventory' && (
            <InventoryView activeCampaignId={activeCampaignId} role="player" />
          )}

        </main>
      </div>

      <JoinCampaignModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        setActiveCampaignId={setActiveCampaignId} 
      />
      
      <AddCharacterModal 
        isOpen={isAddCharacterOpen} 
        onClose={() => setIsAddCharacterOpen(false)} 
        activeCampaignId={activeCampaignId} 
      />
    </div>
  );
}