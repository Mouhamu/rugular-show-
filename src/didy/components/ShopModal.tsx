import React from 'react';
import { PlayerProfile } from '../types';
import { GLIDERS } from '../data/defaultSettings';
import { didyAudio } from '../audio/didyAudio';
import { ShoppingBag, Plane, Check, Lock, Sparkles, X, Coins } from 'lucide-react';

interface ShopModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  profile,
  onUpdateProfile,
  onClose
}) => {
  const handleSelectGlider = (gliderId: string) => {
    didyAudio.playButtonClick();
    onUpdateProfile(prev => ({ ...prev, selectedGliderId: gliderId }));
  };

  const handleBuyGlider = (glider: typeof GLIDERS[0]) => {
    if (profile.coins >= glider.price && !profile.unlockedGliderIds.includes(glider.id)) {
      didyAudio.playCollectMedal();
      onUpdateProfile(prev => ({
        ...prev,
        coins: prev.coins - glider.price,
        unlockedGliderIds: [...prev.unlockedGliderIds, glider.id],
        selectedGliderId: glider.id
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#0b1320] border-2 border-white/15 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white tracking-wider">
                PARK GLIDER SHOP
              </h2>
              <p className="text-xs font-mono text-cyan-300">
                Unlock custom sky gliders and descent trails for Drop Mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-amber-300 tabular-nums">
                {profile.coins} COINS
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GLIDERS.map(g => {
            const isUnlocked = profile.unlockedGliderIds.includes(g.id);
            const isSelected = profile.selectedGliderId === g.id;

            return (
              <div
                key={g.id}
                className={`p-4 rounded-3xl border flex flex-col justify-between gap-4 transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-500/30'
                    : 'border-white/10 bg-slate-900/60'
                }`}
              >
                <div>
                  {/* Glider Visual Color Swatch */}
                  <div
                    className="w-full h-24 rounded-2xl mb-3 border border-white/15 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: g.color }}
                  >
                    <Plane className="w-12 h-12 text-white/90 drop-shadow-md" />
                    <div
                      className="absolute bottom-2 right-2 w-5 h-5 rounded-full border border-white/30"
                      style={{ backgroundColor: g.accentColor }}
                    />
                  </div>

                  <h4 className="text-base font-display font-black text-white">{g.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">High aerodynamic maneuverability during Drop Mode.</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  {isUnlocked ? (
                    isSelected ? (
                      <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1">
                        <Check className="w-4 h-4" /> EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSelectGlider(g.id)}
                        className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-display font-bold text-white transition-colors cursor-pointer"
                      >
                        EQUIP
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleBuyGlider(g)}
                      disabled={profile.coins < g.price}
                      className={`px-4 py-2 rounded-xl text-xs font-display font-black tracking-wider transition-all flex items-center gap-1.5 ${
                        profile.coins >= g.price
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>UNLOCK ({g.price} C)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-xs font-mono text-slate-400">Earn coins by winning DIDY CUP matches!</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-display font-bold text-white transition-colors"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
