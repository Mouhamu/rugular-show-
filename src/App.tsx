/**
 * DIDY CUP - 3D Cartoon Mobile Multiplayer Game
 * Inspired by the chaotic comedy and world of Regular Show
 */

import React, { useState, useEffect } from 'react';
import { PlayerProfile, GameSettings, GameMode, ControlLayout } from './didy/types';
import { loadProfile, saveProfile, loadSettings, saveSettings } from './didy/data/defaultSettings';
import { didyAudio } from './didy/audio/didyAudio';
import { MainMenu } from './didy/components/MainMenu';
import { CharacterSelectModal } from './didy/components/CharacterSelectModal';
import { PetSelectModal } from './didy/components/PetSelectModal';
import { ProfileModal } from './didy/components/ProfileModal';
import { ShopModal } from './didy/components/ShopModal';
import { SettingsModal } from './didy/components/SettingsModal';
import { ControlsCustomizerModal } from './didy/components/ControlsCustomizerModal';
import { AIAssistantModal } from './didy/components/AIAssistantModal';
import { BluetoothLobbyModal } from './didy/components/BluetoothLobbyModal';
import { DidyGameCanvas } from './didy/components/DidyGameCanvas';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile>(() => loadProfile());
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [screen, setScreen] = useState<'MAIN_MENU' | 'IN_GAME'>('MAIN_MENU');
  const [activeGameMode, setActiveGameMode] = useState<GameMode>('DROP_2V2');

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'NONE' | 'BLUETOOTH' | 'CHARACTERS' | 'PETS' | 'PROFILE' | 'SHOP' | 'SETTINGS' | 'CONTROLS_CUSTOMIZER' | 'AI_ASSISTANT'
  >('NONE');

  // Profile update handler
  const handleUpdateProfile = (updater: (prev: PlayerProfile) => PlayerProfile) => {
    setProfile(prev => {
      const updated = updater(prev);
      saveProfile(updated);
      return updated;
    });
  };

  // Settings update handler
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Start match
  const handleStartGame = (mode: GameMode) => {
    setActiveGameMode(mode);
    setScreen('IN_GAME');
  };

  return (
    <main className="w-full h-screen bg-[#0b1320] text-slate-100 select-none overflow-hidden touch-none font-sans">
      {/* 1. MAIN MENU */}
      {screen === 'MAIN_MENU' && (
        <MainMenu
          profile={profile}
          onStartGame={handleStartGame}
          onOpenBluetooth={() => setActiveModal('BLUETOOTH')}
          onOpenCharacters={() => setActiveModal('CHARACTERS')}
          onOpenPets={() => setActiveModal('PETS')}
          onOpenProfile={() => setActiveModal('PROFILE')}
          onOpenShop={() => setActiveModal('SHOP')}
          onOpenSettings={() => setActiveModal('SETTINGS')}
          onOpenAssistant={() => setActiveModal('AI_ASSISTANT')}
        />
      )}

      {/* 2. 3D GAMEPLAY CANVAS */}
      {screen === 'IN_GAME' && (
        <DidyGameCanvas
          profile={profile}
          settings={settings}
          gameMode={activeGameMode}
          onExitToMenu={() => {
            didyAudio.playButtonClick();
            setScreen('MAIN_MENU');
          }}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {/* --- OVERLAY MODALS --- */}

      {/* Bluetooth Multiplayer Lobby */}
      {activeModal === 'BLUETOOTH' && (
        <BluetoothLobbyModal
          profile={profile}
          onStartMatch={(mode) => {
            setActiveModal('NONE');
            handleStartGame(mode);
          }}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {/* Characters Selector */}
      {activeModal === 'CHARACTERS' && (
        <CharacterSelectModal
          selectedId={profile.selectedCharacterId}
          unlockedIds={profile.unlockedCharacterIds}
          onSelect={(charId) => {
            handleUpdateProfile(prev => ({
              ...prev,
              selectedCharacterId: charId,
              favoriteCharacterId: charId
            }));
          }}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {/* Animal Companions (Pets) Selector */}
      {activeModal === 'PETS' && (
        <PetSelectModal
          selectedId={profile.selectedPetId}
          unlockedIds={profile.unlockedPetIds}
          onSelect={(petId) => {
            handleUpdateProfile(prev => ({
              ...prev,
              selectedPetId: petId,
              favoritePetId: petId
            }));
          }}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {/* Player Profile Modal */}
      {activeModal === 'PROFILE' && (
        <ProfileModal
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {/* Shop Modal */}
      {activeModal === 'SHOP' && (
        <ShopModal
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {/* Settings Modal */}
      {activeModal === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleUpdateSettings}
          onOpenControlsCustomizer={() => setActiveModal('CONTROLS_CUSTOMIZER')}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {/* Controls Layout Editor Modal */}
      {activeModal === 'CONTROLS_CUSTOMIZER' && (
        <ControlsCustomizerModal
          layout={settings.controls}
          onSave={(newLayout: ControlLayout) => {
            handleUpdateSettings({ ...settings, controls: newLayout });
          }}
          onClose={() => setActiveModal('NONE')}
        />
      )}

      {/* AI Assistant Guide Modal */}
      {activeModal === 'AI_ASSISTANT' && (
        <AIAssistantModal
          onClose={() => setActiveModal('NONE')}
        />
      )}
    </main>
  );
}
