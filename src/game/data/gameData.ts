import { CharacterDef, WeaponDef, TouchControlLayout, GameSettings, Achievement } from '../types';

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'char_vanguard',
    name: 'Marcus Kane',
    callsign: 'Vanguard',
    theme: 'Green Military Woodland Soldier',
    role: 'Assault',
    camoPrimary: '#384832', // Olive green drab
    camoSecondary: '#242e20',
    vestColor: '#2b3824',
    helmetColor: '#3d4d36',
    skinTone: '#cf9d7c',
    hairColor: '#362b24',
    hasHelmet: true,
    hasGoggles: false,
    hasBackpack: true,
    hasMask: false,
    unlockLevel: 1,
    description: 'Veteran frontline operator with standard-issue woodland ballistic armor and communications harness.'
  },
  {
    id: 'char_dune',
    name: 'Zane Al-Mansoor',
    callsign: 'Dune',
    theme: 'Desert Tactical Operator',
    role: 'Recon',
    camoPrimary: '#c29b68', // Desert tan
    camoSecondary: '#8c6b41',
    vestColor: '#785b34',
    helmetColor: '#967347',
    skinTone: '#a87854',
    hairColor: '#1a1816',
    hasHelmet: false, // Tactical cap + headset
    hasGoggles: true,
    hasBackpack: true,
    hasMask: true,
    unlockLevel: 1,
    description: 'Arid climate specialist outfitted with ballistic dust goggles, desert shemagh, and high-mobility harness.'
  },
  {
    id: 'char_ghost',
    name: 'Elena Cruz',
    callsign: 'Ghost',
    theme: 'Urban Tactical Specialist',
    role: 'Infiltrator',
    camoPrimary: '#475569', // Slate urban
    camoSecondary: '#334155',
    vestColor: '#1e293b',
    helmetColor: '#334155',
    skinTone: '#dfb091',
    hairColor: '#1e1b18',
    hasHelmet: true,
    hasGoggles: false,
    hasBackpack: false,
    hasMask: true,
    unlockLevel: 2,
    description: 'Urban combat reconnaissance operative with lightweight carbon plates and low-acoustic combat boots.'
  },
  {
    id: 'char_cobalt',
    name: 'Dmitri Volkov',
    callsign: 'Cobalt',
    theme: 'Blue Special-Operations Operative',
    role: 'Heavy',
    camoPrimary: '#1e3a5f', // Deep navy
    camoSecondary: '#0f243d',
    vestColor: '#0a192c',
    helmetColor: '#193555',
    skinTone: '#e3be9f',
    hairColor: '#4a3d31',
    hasHelmet: true,
    hasGoggles: true,
    hasBackpack: true,
    hasMask: false,
    unlockLevel: 3,
    description: 'Elite maritime and night raid operative equipped with pressurized tactical helmet and reinforced shoulder plates.'
  },
  {
    id: 'char_pyro',
    name: 'Rex Jackson',
    callsign: 'Pyro',
    theme: 'Red Assault Demolitions',
    role: 'Demolitions',
    camoPrimary: '#7f1d1d', // Crimson hazard
    camoSecondary: '#450a0a',
    vestColor: '#1c1917',
    helmetColor: '#991b1b',
    skinTone: '#704732',
    hairColor: '#1c1917',
    hasHelmet: true,
    hasGoggles: true,
    hasBackpack: true,
    hasMask: true,
    unlockLevel: 5,
    description: 'Heavy assault breacher carrying reinforced blast plating and explosive charge deployment pouches.'
  },
  {
    id: 'char_phantom',
    name: 'Aria Lin',
    callsign: 'Phantom',
    theme: 'Lightweight Scout Operator',
    role: 'Recon',
    camoPrimary: '#3f3f46', // Carbon stealth
    camoSecondary: '#27272a',
    vestColor: '#18181b',
    helmetColor: '#27272a',
    skinTone: '#fad0b5',
    hairColor: '#09090b',
    hasHelmet: false, // Low-profile tactical headset
    hasGoggles: false,
    hasBackpack: false,
    hasMask: true,
    unlockLevel: 7,
    description: 'Agile forward scout optimized for maximum sprint speed and rapid flank maneuvers with minimalist gear.'
  },
  {
    id: 'char_spectre',
    name: 'Tariq Stone',
    callsign: 'Spectre',
    theme: 'Covert Black Ops Infiltrator',
    role: 'Infiltrator',
    camoPrimary: '#18181b', // Matte pitch black
    camoSecondary: '#09090b',
    vestColor: '#0d0d11',
    helmetColor: '#18181b',
    skinTone: '#946648',
    hairColor: '#09090b',
    hasHelmet: true,
    hasGoggles: true,
    hasBackpack: true,
    hasMask: true,
    unlockLevel: 10,
    description: 'Classified black operations operative featuring radar-absorbent fabric and integrated heads-up comms.'
  },
  {
    id: 'char_valkyrie',
    name: 'Maya Jensen',
    callsign: 'Valkyrie',
    theme: 'Combat Medic & Field Breacher',
    role: 'Medic',
    camoPrimary: '#2e4c44', // Pine teal
    camoSecondary: '#1a332c',
    vestColor: '#142721',
    helmetColor: '#233d36',
    skinTone: '#f2cbb1',
    hairColor: '#8a5c2d',
    hasHelmet: true,
    hasGoggles: false,
    hasBackpack: true,
    hasMask: false,
    unlockLevel: 12,
    description: 'Combat triage breacher with field trauma equipment, side-mounted tourniquets, and tactical shield rig.'
  }
];

export const WEAPONS: WeaponDef[] = [
  {
    id: 'wep_ak74m',
    name: 'AK-74M Vanguard',
    category: 'AR',
    damage: 32,
    headshotMultiplier: 2.1,
    fireRate: 9.5, // 570 RPM
    magazineSize: 30,
    maxReserveAmmo: 120,
    reloadTime: 2.2,
    recoilVertical: 0.035,
    recoilHorizontal: 0.015,
    spread: 0.04,
    adsSpreadMultiplier: 0.35,
    rangeFalloff: 45,
    bulletSpeed: 140,
    soundType: 'heavy_rifle',
    description: 'Hard-hitting assault rifle with high armor penetration and steady recoil curve.',
    skins: [
      { id: 'skin_ak_std', name: 'Mil-Spec Olive', primaryColor: '#2c3327', accentColor: '#1b1f18', pattern: 'standard', unlockLevel: 1 },
      { id: 'skin_ak_camo', name: 'Woodland Hunter', primaryColor: '#36452f', accentColor: '#5e432c', pattern: 'camo', unlockLevel: 2 },
      { id: 'skin_ak_spec', name: 'SpecOps Carbon', primaryColor: '#1e2229', accentColor: '#38bdf8', pattern: 'neon', unlockLevel: 6 },
      { id: 'skin_ak_gold', name: 'Golden Vanguard', primaryColor: '#d97706', accentColor: '#fef08a', pattern: 'gold', unlockLevel: 15 }
    ]
  },
  {
    id: 'wep_m4a1',
    name: 'M4A1 SpecOps',
    category: 'AR',
    damage: 28,
    headshotMultiplier: 2.0,
    fireRate: 11.5, // 690 RPM
    magazineSize: 30,
    maxReserveAmmo: 120,
    reloadTime: 1.9,
    recoilVertical: 0.026,
    recoilHorizontal: 0.012,
    spread: 0.032,
    adsSpreadMultiplier: 0.3,
    rangeFalloff: 40,
    bulletSpeed: 150,
    soundType: 'rifle',
    description: 'High rate of fire assault rifle offering pin-point accuracy and rapid handling.',
    skins: [
      { id: 'skin_m4_std', name: 'Tactical Tan', primaryColor: '#8c7653', accentColor: '#27272a', pattern: 'standard', unlockLevel: 1 },
      { id: 'skin_m4_digital', name: 'Digital Urban', primaryColor: '#475569', accentColor: '#94a3b8', pattern: 'digital', unlockLevel: 4 },
      { id: 'skin_m4_gold', name: 'Golden Ace', primaryColor: '#d97706', accentColor: '#fef08a', pattern: 'gold', unlockLevel: 18 }
    ]
  },
  {
    id: 'wep_mp5k',
    name: 'MP5-K Tactical',
    category: 'SMG',
    damage: 22,
    headshotMultiplier: 1.8,
    fireRate: 14.0, // 840 RPM
    magazineSize: 30,
    maxReserveAmmo: 150,
    reloadTime: 1.6,
    recoilVertical: 0.02,
    recoilHorizontal: 0.018,
    spread: 0.05,
    adsSpreadMultiplier: 0.4,
    rangeFalloff: 22,
    bulletSpeed: 120,
    soundType: 'smg',
    description: 'Compact submachine gun built for aggressive close-quarters clearing.',
    skins: [
      { id: 'skin_mp5_std', name: 'Matte Shadow', primaryColor: '#18181b', accentColor: '#3f3f46', pattern: 'standard', unlockLevel: 1 },
      { id: 'skin_mp5_neon', name: 'Cyber Strike', primaryColor: '#0284c7', accentColor: '#38bdf8', pattern: 'neon', unlockLevel: 5 },
      { id: 'skin_mp5_camo', name: 'Tiger Woodland', primaryColor: '#4d5d3e', accentColor: '#22291b', pattern: 'camo', unlockLevel: 9 }
    ]
  },
  {
    id: 'wep_spas12',
    name: 'SPAS-12 Breacher',
    category: 'SHOTGUN',
    damage: 18, // 8 pellets = 144 max close damage!
    headshotMultiplier: 1.6,
    fireRate: 1.5,
    magazineSize: 8,
    maxReserveAmmo: 32,
    reloadTime: 2.8,
    recoilVertical: 0.08,
    recoilHorizontal: 0.03,
    spread: 0.12,
    adsSpreadMultiplier: 0.7,
    rangeFalloff: 14,
    bulletSpeed: 100,
    soundType: 'shotgun',
    description: 'Heavy pump-action tactical shotgun devastating at point-blank room breaches.',
    skins: [
      { id: 'skin_spas_std', name: 'Heavy Ordnance', primaryColor: '#27272a', accentColor: '#52525b', pattern: 'standard', unlockLevel: 3 },
      { id: 'skin_spas_camo', name: 'Desert Raider', primaryColor: '#b48a58', accentColor: '#523a1e', pattern: 'camo', unlockLevel: 7 }
    ]
  },
  {
    id: 'wep_awm',
    name: 'AWM Vanguard',
    category: 'SNIPER',
    damage: 90,
    headshotMultiplier: 2.5, // One-shot headshot guarantee!
    fireRate: 0.8,
    magazineSize: 5,
    maxReserveAmmo: 25,
    reloadTime: 3.2,
    recoilVertical: 0.1,
    recoilHorizontal: 0.02,
    spread: 0.08,
    adsSpreadMultiplier: 0.005, // Laser accurate when scoped!
    rangeFalloff: 120,
    bulletSpeed: 240,
    soundType: 'sniper',
    description: 'Bolt-action precision anti-materiel sniper rifle with long-range high-magnification optics.',
    skins: [
      { id: 'skin_awm_std', name: 'Arctic Camo', primaryColor: '#94a3b8', accentColor: '#cbd5e1', pattern: 'standard', unlockLevel: 4 },
      { id: 'skin_awm_black', name: 'Black Ice', primaryColor: '#0f172a', accentColor: '#38bdf8', pattern: 'neon', unlockLevel: 8 },
      { id: 'skin_awm_gold', name: 'Royal Sovereign', primaryColor: '#b45309', accentColor: '#fef08a', pattern: 'gold', unlockLevel: 20 }
    ]
  },
  {
    id: 'wep_p9mm',
    name: 'Tactical 9mm',
    category: 'PISTOL',
    damage: 25,
    headshotMultiplier: 2.0,
    fireRate: 6.0,
    magazineSize: 15,
    maxReserveAmmo: 60,
    reloadTime: 1.4,
    recoilVertical: 0.022,
    recoilHorizontal: 0.008,
    spread: 0.035,
    adsSpreadMultiplier: 0.5,
    rangeFalloff: 25,
    bulletSpeed: 130,
    soundType: 'pistol',
    description: 'Reliable sidearm with rapid reload and clean sight alignment.',
    skins: [
      { id: 'skin_p9_std', name: 'Polymer Black', primaryColor: '#18181b', accentColor: '#3f3f46', pattern: 'standard', unlockLevel: 1 },
      { id: 'skin_p9_chrome', name: 'Silver Operator', primaryColor: '#e2e8f0', accentColor: '#64748b', pattern: 'standard', unlockLevel: 3 }
    ]
  },
  {
    id: 'wep_knife',
    name: 'Tactical K-Bar',
    category: 'MELEE',
    damage: 65,
    headshotMultiplier: 1.5,
    fireRate: 1.8,
    magazineSize: 1,
    maxReserveAmmo: 1,
    reloadTime: 0,
    recoilVertical: 0,
    recoilHorizontal: 0,
    spread: 0,
    adsSpreadMultiplier: 1,
    rangeFalloff: 2.2, // close melee reach
    bulletSpeed: 50,
    soundType: 'knife',
    description: 'Combat serrated combat knife for silent close-quarters takedowns.',
    skins: [
      { id: 'skin_knife_std', name: 'Black Oxide', primaryColor: '#09090b', accentColor: '#52525b', pattern: 'standard', unlockLevel: 1 },
      { id: 'skin_knife_damascus', name: 'Damascus Steel', primaryColor: '#475569', accentColor: '#94a3b8', pattern: 'camo', unlockLevel: 10 }
    ]
  },
  {
    id: 'wep_frag',
    name: 'M67 Frag Grenade',
    category: 'GRENADE',
    damage: 120, // Max blast center damage
    headshotMultiplier: 1.0,
    fireRate: 0.6,
    magazineSize: 1,
    maxReserveAmmo: 3,
    reloadTime: 0.8,
    recoilVertical: 0,
    recoilHorizontal: 0,
    spread: 0.02,
    adsSpreadMultiplier: 1,
    rangeFalloff: 8, // blast radius
    bulletSpeed: 25,
    soundType: 'grenade',
    description: 'High-explosive fragmentation grenade effective against entrenched enemies behind barricades.',
    skins: [
      { id: 'skin_frag_std', name: 'Standard Olive', primaryColor: '#365314', accentColor: '#ca8a04', pattern: 'standard', unlockLevel: 1 }
    ]
  }
];

export const DEFAULT_CONTROLS: TouchControlLayout = {
  joystick: { x: 18, y: 72, size: 120 }, // percentages from top-left
  fireButton: { x: 84, y: 70, size: 76 },
  aimButton: { x: 84, y: 48, size: 60 },
  reloadButton: { x: 74, y: 84, size: 54 },
  jumpButton: { x: 92, y: 55, size: 54 },
  crouchButton: { x: 92, y: 80, size: 54 },
  grenadeButton: { x: 70, y: 68, size: 50 },
  weaponSwitch: { x: 72, y: 16, size: 48 },
  interactButton: { x: 50, y: 78, size: 52 }
};

export const DEFAULT_SETTINGS: GameSettings = {
  lookSensitivity: 0.9,
  adsSensitivityMultiplier: 0.6,
  invertY: false,
  graphicsQuality: 'MEDIUM',
  targetFps: 60,
  masterVolume: 0.85,
  sfxVolume: 0.9,
  musicVolume: 0.4,
  hapticFeedback: true,
  showFps: true,
  dynamicShadows: true
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_blood',
    title: 'First Blood',
    description: 'Eliminate your first opponent in tactical combat.',
    xpReward: 250,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'ach_headhunter',
    title: 'Headhunter',
    description: 'Score 10 precision headshots with any weapon.',
    xpReward: 500,
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'ach_marksman',
    title: 'Ghost Sniper',
    description: 'Eliminate 5 enemies using the AWM Vanguard sniper rifle.',
    xpReward: 600,
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'ach_grenadier',
    title: 'Blast Specialist',
    description: 'Eliminate 3 enemies with M67 Frag Grenades.',
    xpReward: 400,
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'ach_iron_wall',
    title: 'Tactical Veteran',
    description: 'Win 5 full round-based matches.',
    xpReward: 1000,
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'ach_undefeated',
    title: 'Flawless Victory',
    description: 'Win a round without losing any health.',
    xpReward: 750,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  }
];
