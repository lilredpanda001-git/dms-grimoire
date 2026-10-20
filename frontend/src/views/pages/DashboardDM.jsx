import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Overview from '../components/dm_views/Overview';
import NpcView from '../components/dm_views/NPCView';
import PartyView from '../components/dm_views/PartyView';
import LoreView from '../components/dm_views/LoreView';
import InventoryView from '../components/dm_views/InventoryView';
import NotesView from '../components/dm_views/NotesView';

// Import Modals
import ArcaneScribeModal from '../components/ArcaneScribeModal';
import AddCharacterModal from '../components/AddCharacterModal';
import AddChronicleModal from '../components/AddChronicleModal';
import EditCampaignModal from '../components/EditCampaignModal';
import AddLoreModal from '../components/AddLoreModal';

export default function DashboardDM() {
  // --- STATE NAVIGASI UTAMA ---
  const [activeView, setActiveView] = useState('overview'); 
  // STATE INI SANGAT PENTING: Untuk melacak ID kampanye yang sedang dibuka
  const [activeCampaignId, setActiveCampaignId] = useState(null); 

  // --- STATE MODALS ---
  const [isScribeOpen, setIsScribeOpen] = useState(false);
  const [isAddCharacterOpen, setIsAddCharacterOpen] = useState(false);
  const [isChronicleModalOpen, setIsChronicleModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isAddLoreOpen, setIsAddLoreOpen] = useState(false);
  const [loreToEdit, setLoreToEdit] = useState(null);

  const handleOpenAddLore = () => {
    setLoreToEdit(null); // Reset ke null agar modal jadi mode ADD
    setIsAddLoreOpen(true);
  };

  const handleOpenEditLore = (lore) => {
    setLoreToEdit(lore); // Isi dengan item lore yang dipilih agar modal jadi mode EDIT
    setIsAddLoreOpen(true);
  };

  return (
    <div className="flex h-screen bg-parchment text-grimoire-dark overflow-hidden font-sans relative">
      
      {/* SIDEBAR */}
      <Sidebar 
        role="dm" 
        activeView={activeView} 
        setActiveView={setActiveView} 
        onOpenScribe={() => setIsScribeOpen(true)} 
      />

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* --- CONDITIONAL RENDERING --- */}
          
          {activeView === 'overview' && (
            <Overview 
              activeCampaignId={activeCampaignId}
              setActiveCampaignId={setActiveCampaignId}
              setActiveView={setActiveView}
              onOpenAddCharacter={() => setIsAddCharacterOpen(true)}
              onOpenChronicleModal={() => setIsChronicleModalOpen(true)}
              onOpenCampaignModal={() => setIsCampaignModalOpen(true)}
            />
          )}

          {activeView === 'party' && (
            <PartyView activeCampaignId={activeCampaignId} />
          )}

          {activeView === 'lore' && (
            <LoreView activeCampaignId={activeCampaignId} onOpenAddLore={() => setIsAddLoreOpen(true)} />
          )}

          {activeView === 'npcs' && (
            <NpcView activeCampaignId={activeCampaignId} onOpenScribe={() => setIsScribeOpen(true)} />
          )}

          {activeView === 'inventory' && (
            <InventoryView activeCampaignId={activeCampaignId} />
          )}

          {activeView === 'notes' && (
            <NotesView activeCampaignId={activeCampaignId} />
          )}

          
        </main>
      </div>

      {/* --- SEMUA MODALS --- */}
      
      <ArcaneScribeModal 
        isOpen={isScribeOpen} 
        onClose={() => setIsScribeOpen(false)} 
        campaignName="DM's Grimoire" 
        activeCampaignId={activeCampaignId} 
      />
      
      <AddCharacterModal 
        isOpen={isAddCharacterOpen} 
        onClose={() => setIsAddCharacterOpen(false)} 
        activeCampaignId={activeCampaignId} 
      />
      
      <AddChronicleModal 
        isOpen={isChronicleModalOpen} 
        onClose={() => setIsChronicleModalOpen(false)} 
        activeCampaignId={activeCampaignId} 
      />
      
      <EditCampaignModal 
        isOpen={isCampaignModalOpen} 
        onClose={() => setIsCampaignModalOpen(false)} 
        activeCampaignId={activeCampaignId} 
      />

      <AddLoreModal 
        isOpen={isAddLoreOpen} 
        onClose={() => setIsAddLoreOpen(false)}
        activeCampaignId={activeCampaignId} 
      />

    </div>
  );
}