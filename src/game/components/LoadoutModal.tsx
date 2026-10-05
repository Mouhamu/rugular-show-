import React, { useState } from 'react';
import { PlayerLoadout, WeaponDef, WeaponSkin } from '../types';
import { WEAPONS } from '../data/gameData';
import { Crosshair, Shield, Zap, Check, Lock } from 'lucide-react';

interface LoadoutModalProps {
  currentLoadout: PlayerLoadout;
  playerLevel: number;
  unlockedSkinIds: string[];
  onSaveLoadout: (newLoadout: PlayerLoadout) => void;
  onClose: () => void;
}

export const LoadoutModal: React.FC<LoadoutModalProps> = ({
  currentLoadout,
  playerLevel,
  unlockedSkinIds,
  onSaveLoadout,
  onClose
}) => {
  const [loadout, setLoadout] = useState<PlayerLoadout>({ ...currentLoadout });
  const [activeCategory, setActiveCategory] = useState<'PRIMARY' | 'SECONDARY' | 'SKINS'>('PRIMARY');

  const primaryWeapons = WEAPONS.filter(w => ['AR', 'SMG', 'SHOTGUN', 'SNIPER'].includes(w.category));
  const secondaryWeapons = WEAPONS.filter(w => w.category === 'PISTOL');

  const selectedPrimary = WEAPONS.find(w => w.id === loadout.primaryWeaponId) || primaryWeapons[0];
  const selectedSecondary = WEAPONS.find(w => w.id === loadout.secondaryWeaponId) || secondaryWeapons[0];

  const handleSelectPrimary = (wep: WeaponDef) => {
    setLoadout(prev => ({
      ...prev,
      primaryWeaponId: wep.id,
      primarySkinId: wep.skins[0]?.id || prev.primarySkinId
    }));
  };

  const handleSelectSecondary = (wep: WeaponDef) => {
    setLoadout(prev => ({
      ...prev,
      secondaryWeaponId: wep.id,
      secondarySkinId: wep.skins[0]?.id || prev.secondarySkinId
    }));
  };

  const handleSelectSkin = (skin: WeaponSkin) => {
    setLoadout(prev => ({
      ...prev,
      primarySkinId: skin.id
    }));
  };

  const handleConfirm = () => {
    onSaveLoadout(loadout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-950 border border-white/10 rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-wider">TACTICAL ARMORY & LOADOUT</h2>
            <p className="text-xs font-mono text-slate-400">Configure your primary weapon, sidearm, and camo skins</p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveCategory('PRIMARY')}
              className={`px-4 py-1.5 text-xs font-display font-bold rounded-lg transition-colors ${
                activeCategory === 'PRIMARY' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              PRIMARY WEAPON
            </button>
            <button
              onClick={() => setActiveCategory('SECONDARY')}
              className={`px-4 py-1.5 text-xs font-display font-bold rounded-lg transition-colors ${
                activeCategory === 'SECONDARY' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              SIDEARM
            </button>
            <button
              onClick={() => setActiveCategory('SKINS')}
              className={`px-4 py-1.5 text-xs font-display font-bold rounded-lg transition-colors ${
                activeCategory === 'SKINS' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              CAMO SKINS
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeCategory === 'PRIMARY' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weapon List */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Select Primary Weapon</span>
              {primaryWeapons.map(wep => {
                const isSelected = loadout.primaryWeaponId === wep.id;
                return (
                  <div
                    key={wep.id}
                    onClick={() => handleSelectPrimary(wep)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-display font-bold text-white tracking-wide">{wep.name}</span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          {wep.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{wep.description}</p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Weapon Stats Card */}
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                  WEAPON SPECIFICATIONS
                </span>
                <h3 className="text-2xl font-display font-black text-white mt-1">{selectedPrimary.name}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedPrimary.description}</p>

                {/* Stat Bars */}
                <div className="flex flex-col gap-3.5 mt-6">
                  {/* Damage */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400">DAMAGE</span>
                      <span className="text-white font-bold">{selectedPrimary.damage}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${(selectedPrimary.damage / 90) * 100}%` }} />
                    </div>
                  </div>

                  {/* Fire Rate */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400">FIRE RATE</span>
                      <span className="text-white font-bold">{selectedPrimary.fireRate} rps</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${(selectedPrimary.fireRate / 14) * 100}%` }} />
                    </div>
                  </div>

                  {/* Range */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400">EFFECTIVE RANGE</span>
                      <span className="text-white font-bold">{selectedPrimary.rangeFalloff}m</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${(selectedPrimary.rangeFalloff / 120) * 100}%` }} />
                    </div>
                  </div>

                  {/* Mag Size */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400">MAGAZINE CAPACITY</span>
                      <span className="text-white font-bold">{selectedPrimary.magazineSize} rounds</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${(selectedPrimary.magazineSize / 30) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'SECONDARY' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Select Sidearm</span>
              {secondaryWeapons.map(wep => {
                const isSelected = loadout.secondaryWeaponId === wep.id;
                return (
                  <div
                    key={wep.id}
                    onClick={() => handleSelectSecondary(wep)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-display font-bold text-white tracking-wide">{wep.name}</span>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          PISTOL
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{wep.description}</p>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                SIDEARM SPECIFICATIONS
              </span>
              <h3 className="text-2xl font-display font-black text-white mt-1">{selectedSecondary.name}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedSecondary.description}</p>
              <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
                Reliable sidearm equipped when primary runs dry. Quick draw swap speed.
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'SKINS' && (
          <div className="flex flex-col gap-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Unlocked Weapon Finishes for {selectedPrimary.name}
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedPrimary.skins.map(skin => {
                const isSelected = loadout.primarySkinId === skin.id;
                const isUnlocked = playerLevel >= skin.unlockLevel || unlockedSkinIds.includes(skin.id);

                return (
                  <div
                    key={skin.id}
                    onClick={() => isUnlocked && handleSelectSkin(skin)}
                    className={`relative p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                      isUnlocked ? 'cursor-pointer hover:border-white/30' : 'opacity-60 cursor-not-allowed'
                    } ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-500/30'
                        : 'border-white/10 bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div
                        className="w-full h-16 rounded-xl mb-3 flex items-center justify-center border border-white/10"
                        style={{ backgroundColor: skin.primaryColor }}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white/40 shadow-md"
                          style={{ backgroundColor: skin.accentColor }}
                        />
                      </div>
                      <span className="text-xs font-display font-bold text-white">{skin.name}</span>
                      <span className="block text-[10px] font-mono text-slate-400 uppercase mt-0.5">
                        {skin.pattern} FINISH
                      </span>
                    </div>

                    {!isUnlocked && (
                      <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-amber-400">
                        <Lock className="w-3 h-3" /> Unlocks at Lv. {skin.unlockLevel}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-8 py-2.5 rounded-xl text-xs font-display font-bold tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl transition-all"
          >
            EQUIP LOADOUT
          </button>
        </div>
      </div>
    </div>
  );
};
