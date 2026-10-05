/**
 * Types and interfaces for Frontline Strike 3D
 */

export type Team = 'ALPHA' | 'BRAVO';

export type WeaponCategory = 'AR' | 'SMG' | 'SHOTGUN' | 'SNIPER' | 'PISTOL' | 'MELEE' | 'GRENADE';

export interface WeaponSkin {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  pattern: 'standard' | 'camo' | 'digital' | 'gold' | 'neon';
  unlockLevel: number;
}

export interface WeaponDef {
  id: string;
  name: string;
  category: WeaponCategory;
  damage: number; // base body damage
  headshotMultiplier: number;
  fireRate: number; // rounds per second
  magazineSize: number;
  maxReserveAmmo: number;
  reloadTime: number; // in seconds
  recoilVertical: number;
  recoilHorizontal: number;
  spread: number; // base accuracy
  adsSpreadMultiplier: number;
  rangeFalloff: number; // meters before damage decreases
  bulletSpeed: number; // for visual tracer
  skins: WeaponSkin[];
  description: string;
  soundType: 'rifle' | 'heavy_rifle' | 'smg' | 'shotgun' | 'sniper' | 'pistol' | 'knife' | 'grenade';
}

export interface CharacterDef {
  id: string;
  name: string;
  callsign: string;
  theme: string;
  role: 'Assault' | 'Recon' | 'Heavy' | 'Medic' | 'Infiltrator' | 'Demolitions';
  camoPrimary: string;
  camoSecondary: string;
  vestColor: string;
  helmetColor: string;
  skinTone: string;
  hairColor: string;
  hasHelmet: boolean;
  hasGoggles: boolean;
  hasBackpack: boolean;
  hasMask: boolean;
  unlockLevel: number;
  description: string;
}

export interface PlayerLoadout {
  primaryWeaponId: string;
  secondaryWeaponId: string;
  meleeWeaponId: string;
  grenadeCount: number;
  primarySkinId: string;
  secondarySkinId: string;
}

export interface PlayerStats {
  kills: number;
  deaths: number;
  assists: number;
  damageDealt: number;
  score: number;
  headshots: number;
}

export interface PlayerState {
  id: string;
  name: string;
  isLocal: boolean;
  isBot: boolean;
  isHost: boolean;
  team: Team;
  characterId: string;
  loadout: PlayerLoadout;
  stats: PlayerStats;
  
  // Real-time combat state
  health: number; // 0 - 100
  armor: number; // 0 - 100
  isAlive: boolean;
  
  // Spatial
  position: { x: number; y: number; z: number };
  rotation: { yaw: number; pitch: number }; // radians
  velocity: { x: number; y: number; z: number };
  
  // Action states
  currentSlot: 0 | 1 | 2 | 3; // 0: Primary, 1: Secondary, 2: Melee, 3: Grenade
  ammoInMag: number;
  ammoInReserve: number;
  isShooting: boolean;
  isAiming: boolean;
  isReloading: boolean;
  isCrouching: boolean;
  isSprinting: boolean;
  isJumping: boolean;
  isGrounded: boolean;
  isMeleeAttacking: boolean;
  isThrowingGrenade: boolean;
  
  // Timing
  reloadProgress: number; // 0 to 1
  shootCooldown: number;
  hurtCooldown: number;
  ping: number; // ms
}

export type RoundState = 'WAITING' | 'COUNTDOWN' | 'ACTIVE' | 'ROUND_OVER' | 'MATCH_OVER';

export interface KillFeedItem {
  id: string;
  killerName: string;
  killerTeam: Team;
  victimName: string;
  victimTeam: Team;
  weaponName: string;
  isHeadshot: boolean;
  timestamp: number;
}

export interface MatchState {
  roundState: RoundState;
  currentRound: number;
  maxRounds: number; // e.g. 5 (first to 3 wins)
  roundTimer: number; // seconds remaining in current round (e.g. 180s = 3 min)
  countdownTimer: number; // 3, 2, 1 before round starts
  scores: {
    ALPHA: number;
    BRAVO: number;
  };
  winnerTeam: Team | null;
  killFeed: KillFeedItem[];
}

export interface BluetoothPeer {
  id: string;
  name: string;
  rssi: number; // signal strength in dBm e.g. -45dBm (strong) to -85dBm (weak)
  deviceModel: string;
  isHost: boolean;
  connected: boolean;
  team: Team;
  characterId: string;
  ping: number;
}

export interface TouchControlLayout {
  joystick: { x: number; y: number; size: number };
  fireButton: { x: number; y: number; size: number };
  aimButton: { x: number; y: number; size: number };
  reloadButton: { x: number; y: number; size: number };
  jumpButton: { x: number; y: number; size: number };
  crouchButton: { x: number; y: number; size: number };
  grenadeButton: { x: number; y: number; size: number };
  weaponSwitch: { x: number; y: number; size: number };
  interactButton: { x: number; y: number; size: number };
}

export interface GameSettings {
  lookSensitivity: number; // 0.2 to 2.0
  adsSensitivityMultiplier: number; // 0.3 to 1.0
  invertY: boolean;
  graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH';
  targetFps: 30 | 60;
  masterVolume: number; // 0 to 1
  sfxVolume: number;
  musicVolume: number;
  hapticFeedback: boolean;
  showFps: boolean;
  dynamicShadows: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  totalMatches: number;
  wins: number;
  kills: number;
  deaths: number;
  headshots: number;
  unlockedCharacterIds: string[];
  unlockedSkinIds: string[];
  achievements: Achievement[];
  loadout: PlayerLoadout;
  selectedCharacterId: string;
  controlLayout: TouchControlLayout;
  settings: GameSettings;
}
