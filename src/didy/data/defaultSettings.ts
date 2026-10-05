import { PlayerProfile, GameSettings, ControlLayout, GliderItem } from '../types';

export const STORAGE_PROFILE_KEY = 'didy_cup_player_profile';
export const STORAGE_SETTINGS_KEY = 'didy_cup_game_settings';

export const DEFAULT_CONTROLS: ControlLayout = {
  controlScheme: 'DYNAMIC_JOYSTICK',
  joystickSize: 130,
  joystickOpacity: 0.85,
  buttonSize: 64,
  buttonOpacity: 0.9,
  joystickSensitivity: 1.0,
  cameraSensitivity: 1.1,
  autoRun: true,
  vibration: true,
  buttonPositions: {
    jump: { x: 91, y: 78 },     // percentages
    crouch: { x: 81, y: 76 },
    sprint: { x: 81, y: 88 },
    action: { x: 89, y: 62 },
    interact: { x: 73, y: 76 },
    emote: { x: 91, y: 46 }
  }
};

export const DEFAULT_SETTINGS: GameSettings = {
  language: 'ar',
  graphicsPreset: 'HIGH',
  targetFps: 60,
  resolutionScale: 1.0,
  shadowsEnabled: true,
  particlesEnabled: true,
  masterVolume: 0.9,
  musicVolume: 0.8,
  sfxVolume: 0.9,
  voiceVolume: 0.85,
  isMuted: false,
  controls: { ...DEFAULT_CONTROLS }
};

export const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Mouha muh',
  wins: 0,
  matchesPlayed: 0,
  didyCupTrophies: 0,
  bestScore: 0,
  favoriteCharacterId: 'mordecai',
  favoritePetId: 'pet_dog',
  selectedCharacterId: 'mordecai',
  selectedPetId: 'pet_dog',
  selectedGliderId: 'glider_classic',
  unlockedCharacterIds: ['mordecai', 'rigby', 'skips', 'muscle_man', 'hifive_ghost', 'benson', 'pops'],
  unlockedPetIds: ['pet_dog', 'pet_cat', 'pet_fox', 'pet_panda', 'pet_rabbit', 'pet_bird'],
  unlockedGliderIds: ['glider_classic', 'glider_bluejay', 'glider_rainbow'],
  coins: 450
};

export const GLIDERS: GliderItem[] = [
  {
    id: 'glider_classic',
    name: 'Park Issue Glider',
    color: '#38bdf8',
    accentColor: '#facc15',
    price: 0,
    unlocked: true
  },
  {
    id: 'glider_bluejay',
    name: 'Blue Jay Wings',
    color: '#2563eb',
    accentColor: '#ffffff',
    price: 150,
    unlocked: true
  },
  {
    id: 'glider_rainbow',
    name: 'Pops Candy Glider',
    color: '#ec4899',
    accentColor: '#fef08a',
    price: 250,
    unlocked: true
  },
  {
    id: 'glider_golden',
    name: 'DIDY Champion Glider',
    color: '#eab308',
    accentColor: '#ffffff',
    price: 500,
    unlocked: false
  }
];

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_PROFILE };
}

export function saveProfile(profile: PlayerProfile) {
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        controls: { ...DEFAULT_CONTROLS, ...(parsed.controls || {}) }
      };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
