import { PlayerProfile, Achievement, PlayerLoadout, GameSettings, TouchControlLayout } from '../types';
import { DEFAULT_CONTROLS, DEFAULT_SETTINGS, INITIAL_ACHIEVEMENTS } from '../data/gameData';

const STORAGE_KEY = 'frontline_strike_3d_profile';

export function calculateNextLevelXp(level: number): number {
  return Math.floor(500 * Math.pow(1.35, level - 1));
}

export function getDefaultProfile(): PlayerProfile {
  return {
    name: 'Operator-7',
    level: 1,
    xp: 0,
    nextLevelXp: calculateNextLevelXp(1),
    totalMatches: 0,
    wins: 0,
    kills: 0,
    deaths: 0,
    headshots: 0,
    unlockedCharacterIds: ['char_vanguard', 'char_dune'], // Start with 2 unlocked
    unlockedSkinIds: ['skin_ak_std', 'skin_m4_std', 'skin_mp5_std', 'skin_p9_std', 'skin_knife_std', 'skin_frag_std'],
    achievements: [...INITIAL_ACHIEVEMENTS],
    loadout: {
      primaryWeaponId: 'wep_ak74m',
      secondaryWeaponId: 'wep_p9mm',
      meleeWeaponId: 'wep_knife',
      grenadeCount: 2,
      primarySkinId: 'skin_ak_std',
      secondarySkinId: 'skin_p9_std'
    },
    selectedCharacterId: 'char_vanguard',
    controlLayout: { ...DEFAULT_CONTROLS },
    settings: { ...DEFAULT_SETTINGS }
  };
}

export function loadPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure missing keys are merged
      return {
        ...getDefaultProfile(),
        ...parsed,
        loadout: { ...getDefaultProfile().loadout, ...(parsed.loadout || {}) },
        controlLayout: { ...DEFAULT_CONTROLS, ...(parsed.controlLayout || {}) },
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
      };
    }
  } catch {
    // LocalStorage blocked or parsing failed
  }
  return getDefaultProfile();
}

export function savePlayerProfile(profile: PlayerProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors
  }
}

export function awardPlayerXP(
  profile: PlayerProfile,
  amount: number,
  onLevelUp?: (newLevel: number, newlyUnlockedChars: string[], newlyUnlockedSkins: string[]) => void
): PlayerProfile {
  let xp = profile.xp + amount;
  let level = profile.level;
  let nextXp = profile.nextLevelXp;
  const newlyUnlockedChars: string[] = [];
  const newlyUnlockedSkins: string[] = [];

  while (xp >= nextXp && level < 50) {
    xp -= nextXp;
    level++;
    nextXp = calculateNextLevelXp(level);

    // Check unlocks
    if (level === 2 && !profile.unlockedCharacterIds.includes('char_ghost')) {
      newlyUnlockedChars.push('char_ghost');
    }
    if (level === 3 && !profile.unlockedCharacterIds.includes('char_cobalt')) {
      newlyUnlockedChars.push('char_cobalt');
    }
    if (level === 5 && !profile.unlockedCharacterIds.includes('char_pyro')) {
      newlyUnlockedChars.push('char_pyro');
    }
    if (level === 7 && !profile.unlockedCharacterIds.includes('char_phantom')) {
      newlyUnlockedChars.push('char_phantom');
    }
    if (level === 10 && !profile.unlockedCharacterIds.includes('char_spectre')) {
      newlyUnlockedChars.push('char_spectre');
    }
    if (level === 12 && !profile.unlockedCharacterIds.includes('char_valkyrie')) {
      newlyUnlockedChars.push('char_valkyrie');
    }

    // Skins unlocks
    if (level === 2 && !profile.unlockedSkinIds.includes('skin_ak_camo')) newlyUnlockedSkins.push('skin_ak_camo');
    if (level === 4 && !profile.unlockedSkinIds.includes('skin_m4_digital')) newlyUnlockedSkins.push('skin_m4_digital');
    if (level === 5 && !profile.unlockedSkinIds.includes('skin_mp5_neon')) newlyUnlockedSkins.push('skin_mp5_neon');
    if (level === 8 && !profile.unlockedSkinIds.includes('skin_awm_black')) newlyUnlockedSkins.push('skin_awm_black');
    if (level === 15 && !profile.unlockedSkinIds.includes('skin_ak_gold')) newlyUnlockedSkins.push('skin_ak_gold');
  }

  const updatedProfile: PlayerProfile = {
    ...profile,
    level,
    xp,
    nextLevelXp: nextXp,
    unlockedCharacterIds: Array.from(new Set([...profile.unlockedCharacterIds, ...newlyUnlockedChars])),
    unlockedSkinIds: Array.from(new Set([...profile.unlockedSkinIds, ...newlyUnlockedSkins]))
  };

  savePlayerProfile(updatedProfile);

  if (level > profile.level && onLevelUp) {
    onLevelUp(level, newlyUnlockedChars, newlyUnlockedSkins);
  }

  return updatedProfile;
}

export function updateAchievementProgress(
  profile: PlayerProfile,
  achievementId: string,
  progressDelta: number = 1
): { profile: PlayerProfile; justUnlocked: Achievement | null } {
  let justUnlocked: Achievement | null = null;
  const updatedAchievements = profile.achievements.map(ach => {
    if (ach.id !== achievementId || ach.unlocked) return ach;
    const newProgress = Math.min(ach.maxProgress, ach.progress + progressDelta);
    const unlocked = newProgress >= ach.maxProgress;
    if (unlocked) {
      justUnlocked = { ...ach, unlocked: true, progress: newProgress, unlockedAt: new Date().toISOString() };
      return justUnlocked;
    }
    return { ...ach, progress: newProgress };
  });

  let updatedProfile = {
    ...profile,
    achievements: updatedAchievements
  };

  if (justUnlocked) {
    updatedProfile = awardPlayerXP(updatedProfile, (justUnlocked as Achievement).xpReward);
  } else {
    savePlayerProfile(updatedProfile);
  }

  return { profile: updatedProfile, justUnlocked };
}
