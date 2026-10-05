import React, { useState } from 'react';
import { CharacterDef, PlayerProfile } from '../types';
import { CHARACTERS } from '../data/gameData';
import { Shield, Lock, Check, UserCheck, Star } from 'lucide-react';

interface OperatorsModalProps {
  profile: PlayerProfile;
  onSelectCharacter: (charId: string) => void;
  onClose: () => void;
}

export const OperatorsModal: React.FC<OperatorsModalProps> = ({
  profile,
  onSelectCharacter,
  onClose
}) => {
  const [selectedId, setSelectedId] = useState<string>(profile.selectedCharacterId);
  const activeChar = CHARACTERS.find(c => c.id === selectedId) || CHARACTERS[0];

  const handleConfirm = () => {
    onSelectCharacter(selectedId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-950 border border-white/10 rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col gap-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-wider">TACTICAL OPERATORS</h2>
            <p className="text-xs font-mono text-slate-400">
              Select your frontline specialist · Unlocks automatically as you level up
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">CURRENT RANK</span>
            <span className="text-sm font-display font-black text-amber-400">LEVEL {profile.level}</span>
          </div>
        </div>

        {/* 2-Column layout: Grid of characters + Inspector preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Character Grid */}
          <div className="md:col-span-2 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {CHARACTERS.map(char => {
              const isSelected = char.id === selectedId;
              const isUnlocked = profile.unlockedCharacterIds.includes(char.id) || profile.level >= char.unlockLevel;

              return (
                <div
                  key={char.id}
                  onClick={() => isUnlocked && setSelectedId(char.id)}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                    isUnlocked ? 'cursor-pointer hover:border-white/30' : 'opacity-50 cursor-not-allowed'
                  } ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-500/30'
                      : 'border-white/10 bg-slate-900/60'
                  }`}
                >
                  <div>
                    {/* Visual Color Pill Bar */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: char.camoPrimary }} />
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: char.vestColor }} />
                      <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: char.helmetColor }} />
                    </div>

                    <h4 className="text-sm font-display font-bold text-white">{char.name}</h4>
                    <span className="text-xs font-mono text-cyan-400 font-semibold block">"{char.callsign}"</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase mt-0.5 block">{char.role}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    {isUnlocked ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> READY
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Unlocks Lv. {char.unlockLevel}
                      </span>
                    )}

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950 font-bold text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Operator Details Card */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold">
                DOSSIER FILE
              </span>
              <h3 className="text-2xl font-display font-black text-white mt-1">{activeChar.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300">
                  {activeChar.callsign}
                </span>
                <span className="text-xs font-mono text-slate-400">· {activeChar.role}</span>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 leading-relaxed">
                {activeChar.description}
              </div>

              {/* Kit Details */}
              <div className="flex flex-col gap-2 mt-4 text-xs font-mono">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">OUTFIT THEME</span>
                  <span className="text-white text-right">{activeChar.theme}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">HEADGEAR</span>
                  <span className="text-white">{activeChar.hasHelmet ? 'Ballistic Helmet' : 'Tactical Cap'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">FACE MASK</span>
                  <span className="text-white">{activeChar.hasMask ? 'Tactical Shemagh' : 'None'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">BACKPACK</span>
                  <span className="text-white">{activeChar.hasBackpack ? 'Tactical Field Rig' : 'Sleek Harness'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="mt-6 w-full py-3 rounded-xl text-xs font-display font-bold tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl transition-all"
            >
              DEPLOY WITH {activeChar.callsign.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/10 pt-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
