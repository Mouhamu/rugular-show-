import React from 'react';
import { PlayerProfile } from '../types';
import { Play, Bluetooth, Shield, Trophy, Settings, Crosshair, Users, ChevronRight, Zap } from 'lucide-react';

interface MainMenuProps {
  profile: PlayerProfile;
  onQuickPlay: () => void;
  onOpenBluetooth: () => void;
  onOpenArmory: () => void;
  onOpenOperators: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  onQuickPlay,
  onOpenBluetooth,
  onOpenArmory,
  onOpenOperators,
  onOpenAchievements,
  onOpenSettings
}) => {
  return (
    <div className="relative w-full h-full min-h-screen bg-[#080b0f] text-slate-100 flex flex-col justify-between p-4 md:p-8 select-none overflow-hidden">
      {/* Background Graphic with Scrim */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/src/assets/images/tactical_game_cover_1791195553054.jpg"
          alt="Frontline Strike Tactical Battlefield"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-35 scale-105 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b0f] via-[#080b0f]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b0f] via-transparent to-[#080b0f]" />
      </div>

      {/* Top Header: Brand Wordmark & Player Dossier */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/tactical_app_icon_1791195563629.jpg"
            alt="Tactical Strike Emblem"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-xl shadow-lg border border-white/10 object-cover"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-display font-black tracking-wider text-white">
              FRONTLINE STRIKE <span className="text-cyan-400">3D</span>
            </h1>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
              Tactical Mobile Ops · Offline Bluetooth Combat
            </p>
          </div>
        </div>

        {/* Player Profile Capsule */}
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenAchievements}
            className="flex items-center gap-3 bg-slate-900/80 hover:bg-slate-800 border border-white/10 px-4 py-2 rounded-2xl cursor-pointer backdrop-blur-md transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-display font-black text-amber-400 text-sm">
              {profile.level}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-display font-bold text-white leading-tight">{profile.name}</span>
              <span className="text-[10px] font-mono text-slate-400">
                {profile.xp} / {profile.nextLevelXp} XP
              </span>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Hero Callout & Mode Cards */}
      <div className="relative z-10 my-auto max-w-4xl w-full mx-auto flex flex-col gap-6 py-6">
        {/* Main Play CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Primary Quick Match */}
          <button
            onClick={onQuickPlay}
            className="group relative p-6 rounded-3xl bg-gradient-to-br from-cyan-600/30 to-blue-900/40 border-2 border-cyan-400/50 hover:border-cyan-400 text-left transition-all duration-200 shadow-[0_0_30px_rgba(6,182,212,0.25)] hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] backdrop-blur-md cursor-pointer flex flex-col justify-between h-48 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
                OFFLINE INSTANT MATCH
              </span>
              <Play className="w-6 h-6 text-cyan-400 fill-cyan-400 group-hover:scale-110 transition-transform" />
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-display font-black text-white tracking-wide">
                START QUICK COMBAT
              </h2>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Fast-paced 3–7 minute tactical rounds with intelligent squad bots. Best of 5 rounds on Compound Outpost 7.
              </p>
            </div>
          </button>

          {/* Bluetooth Local Multiplayer */}
          <button
            onClick={onOpenBluetooth}
            className="group relative p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border-2 border-indigo-400/40 hover:border-indigo-400 text-left transition-all duration-200 shadow-xl hover:shadow-[0_0_35px_rgba(99,102,241,0.3)] backdrop-blur-md cursor-pointer flex flex-col justify-between h-48 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/30">
                2–4 PLAYERS LOCAL
              </span>
              <Bluetooth className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-display font-black text-white tracking-wide">
                BLUETOOTH MULTIPLAYER
              </h2>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Create or join a direct Bluetooth mesh room. Works 100% offline without Wi-Fi router or internet connection.
              </p>
            </div>
          </button>
        </div>

        {/* Secondary Navigation Row: Armory, Operators, Career */}
        <div className="grid grid-cols-3 gap-3">
          {/* Armory */}
          <button
            onClick={onOpenArmory}
            className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-white/10 hover:border-white/20 transition-all text-left flex flex-col justify-between backdrop-blur-sm cursor-pointer"
          >
            <Crosshair className="w-5 h-5 text-cyan-400 mb-2" />
            <div>
              <span className="text-xs font-display font-bold text-white block">ARMORY & WEAPONS</span>
              <span className="text-[10px] font-mono text-slate-400">Loadouts, ARs, Snipers, Skins</span>
            </div>
          </button>

          {/* Operators */}
          <button
            onClick={onOpenOperators}
            className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-white/10 hover:border-white/20 transition-all text-left flex flex-col justify-between backdrop-blur-sm cursor-pointer"
          >
            <Users className="w-5 h-5 text-emerald-400 mb-2" />
            <div>
              <span className="text-xs font-display font-bold text-white block">OPERATORS & GEAR</span>
              <span className="text-[10px] font-mono text-slate-400">8 Unique Military Outfits</span>
            </div>
          </button>

          {/* Career & Progression */}
          <button
            onClick={onOpenAchievements}
            className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-850 border border-white/10 hover:border-white/20 transition-all text-left flex flex-col justify-between backdrop-blur-sm cursor-pointer"
          >
            <Trophy className="w-5 h-5 text-amber-400 mb-2" />
            <div>
              <span className="text-xs font-display font-bold text-white block">CAREER & MEDALS</span>
              <span className="text-[10px] font-mono text-slate-400">Level, K/D, Achievements</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>DEVICE ENGINE: LIGHTWEIGHT 3D RENDERER (30–60 FPS)</span>
        </div>
        <span>CONTROLS: TOUCH VIRTUAL JOYSTICK & DESKTOP WASD/MOUSE</span>
      </div>
    </div>
  );
};
