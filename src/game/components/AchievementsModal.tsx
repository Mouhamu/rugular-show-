import React from 'react';
import { PlayerProfile } from '../types';
import { Trophy, Award, Target, Flame, CheckCircle2, X } from 'lucide-react';

interface AchievementsModalProps {
  profile: PlayerProfile;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ profile, onClose }) => {
  const kdRatio = profile.deaths > 0 ? (profile.kills / profile.deaths).toFixed(2) : profile.kills.toFixed(2);
  const winRate = profile.totalMatches > 0 ? Math.round((profile.wins / profile.totalMatches) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-950 border border-white/10 rounded-3xl max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-wider">
                CAREER STATS & ACHIEVEMENTS
              </h2>
              <p className="text-xs font-mono text-slate-400">100% Offline progression tracked locally</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level & XP Overview */}
        <div className="bg-slate-900/80 border border-white/10 p-5 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">MILITARY RANK</span>
              <h3 className="text-2xl font-display font-black text-white">LEVEL {profile.level}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400">XP PROGRESS</span>
              <span className="text-sm font-mono font-bold text-amber-400 block tabular-nums">
                {profile.xp} / {profile.nextLevelXp} XP
              </span>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (profile.xp / profile.nextLevelXp) * 100)}%` }}
            />
          </div>
        </div>

        {/* Combat Record Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Matches</span>
            <span className="text-xl font-display font-bold text-white mt-1 tabular-nums">{profile.totalMatches}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Victory Rate</span>
            <span className="text-xl font-display font-bold text-emerald-400 mt-1 tabular-nums">{winRate}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Eliminations</span>
            <span className="text-xl font-display font-bold text-white mt-1 tabular-nums">{profile.kills}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">K/D Ratio</span>
            <span className="text-xl font-display font-bold text-cyan-400 mt-1 tabular-nums">{kdRatio}</span>
          </div>
        </div>

        {/* Achievements List */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            MEDALS & COMMENDATIONS
          </span>

          <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
            {profile.achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  ach.unlocked
                    ? 'border-amber-400/40 bg-amber-950/20'
                    : 'border-white/5 bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      ach.unlocked ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold text-white">{ach.title}</h4>
                    <p className="text-xs text-slate-400">{ach.description}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end min-w-[90px]">
                  <span className="text-xs font-mono font-bold text-amber-400">+{ach.xpReward} XP</span>
                  {ach.unlocked ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 mt-0.5 tabular-nums">
                      {ach.progress} / {ach.maxProgress}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end border-t border-white/10 pt-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
