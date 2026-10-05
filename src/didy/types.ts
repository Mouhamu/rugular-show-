/**
 * DIDY CUP - Types and Interfaces
 * A 3D Cartoon Mobile Multiplayer Game inspired by Regular Show
 */

export type GameMode = 'SOLO_PARK' | 'DROP_2V2' | 'DROP_4V4' | 'BLUETOOTH_2V2' | 'BLUETOOTH_4V4';

export type DropPhase = 'PLANE_FLYBY' | 'FREEFALL' | 'GLIDING' | 'LANDED';

export type ControlScheme = 'DYNAMIC_JOYSTICK' | 'FIXED_JOYSTICK' | 'SWIPE_PAD' | 'DPAD_BUTTONS';

export interface RegularShowCharacter {
  id: string;
  name: string;
  species: string;
  catchphrase: string;
  color: string;
  accentColor: string;
  height: number;
  speed: number;
  jumpForce: number;
  description: string;
  unlocked: boolean;
  unlockRequirement?: string;
  emoteName: string;
}

export interface AnimalCompanion {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'fox' | 'panda' | 'rabbit' | 'bird' | 'wolf';
  color: string;
  secondaryColor: string;
  personality: string;
  unlocked: boolean;
  scale: number;
}

export interface PlayerProfile {
  name: string; // Default: "Mouha muh"
  wins: number;
  matchesPlayed: number;
  didyCupTrophies: number;
  bestScore: number;
  favoriteCharacterId: string;
  favoritePetId: string;
  selectedCharacterId: string;
  selectedPetId: string;
  selectedGliderId: string;
  unlockedCharacterIds: string[];
  unlockedPetIds: string[];
  unlockedGliderIds: string[];
  coins: number;
}

export interface ControlLayout {
  controlScheme: ControlScheme;
  joystickSize: number;
  joystickOpacity: number;
  buttonSize: number;
  buttonOpacity: number;
  joystickSensitivity: number;
  cameraSensitivity: number;
  autoRun: boolean;
  vibration: boolean;
  buttonPositions: {
    jump: { x: number; y: number };
    crouch: { x: number; y: number };
    sprint: { x: number; y: number };
    action: { x: number; y: number };
    interact: { x: number; y: number };
    emote: { x: number; y: number };
  };
}

export type GraphicsPreset = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' | 'BATTERY_SAVER';

export interface GameSettings {
  language: 'ar' | 'en';
  graphicsPreset: GraphicsPreset;
  targetFps: 30 | 60;
  resolutionScale: number;
  shadowsEnabled: boolean;
  particlesEnabled: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  isMuted: boolean;
  controls: ControlLayout;
}

export interface GliderItem {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  price: number;
  unlocked: boolean;
}

export interface InGamePlayer {
  id: string;
  name: string;
  isLocal: boolean;
  isBot: boolean;
  characterId: string;
  petId?: string;
  team: 'BLUE' | 'RED' | 'SOLO';
  score: number;
  health: number; // 0 to 100
  position: { x: number; y: number; z: number };
  rotationY: number;
  isAlive: boolean;
  isGliding: boolean;
  isFreefalling: boolean;
  isGrounded: boolean;
  isCrouching: boolean;
  isEmoting: boolean;
  currentEmote?: string;
}

export interface BRChallenge {
  id: string;
  title: string;
  progress: number;
  max: number;
  rewardCoins: number;
  completed: boolean;
}

export interface BRLootCrate {
  id: string;
  position: { x: number; y: number; z: number };
  type: 'AIRDROP' | 'SUPPLY' | 'SODA_CACHE';
  opened: boolean;
  item: string;
}

export interface MatchScoreboardEntry {
  playerId: string;
  name: string;
  characterName: string;
  team: 'BLUE' | 'RED' | 'SOLO';
  score: number;
  medalsCollected: number;
  isLocal: boolean;
}

export interface ChaosEvent {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
}

export interface BluetoothPeer {
  id: string;
  name: string;
  rssi: number; // Signal strength in dBm e.g. -42
  deviceModel: string;
  isHost: boolean;
  connected: boolean;
  isReady: boolean;
  team: 'BLUE' | 'RED';
  characterId: string;
  ping: number;
}

export interface BluetoothRoom {
  id: string;
  name: string;
  hostName: string;
  mode: 'DROP_2V2' | 'DROP_4V4';
  players: BluetoothPeer[];
  maxPlayers: number;
  status: 'SEARCHING' | 'WAITING' | 'READY' | 'PLAYING';
  createdTime: number;
}

