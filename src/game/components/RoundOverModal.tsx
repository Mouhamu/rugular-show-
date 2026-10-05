import React from 'react';
import { MatchState, PlayerState, Team } from '../types';
import { Trophy, Skull, ArrowRight, RotateCcw, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoundOverModalProps {
  match: MatchState;
  localPlayer: PlayerState;
  allPlayers: PlayerState[];
  onNextRound: () => void;
  onRematch: () => void;
  onExitToMenu: () => void;
}

export const RoundOverModal: React.FC<RoundOverModalProps> = ({
  match,
  localPlayer,
  allPlayers,
  onNextRound,
  onRematch,
  onExitToMenu
}) => {
  const isMatchOver = match.roundState === 'MATCH_OVER';
  const isRoundOver = match.roundState === 'ROUND_OVER';

  const isLocalWinner = match.winnerTeam === localPlayer.team;

  // Trigger celebration confetti on match victory!
  React.useEffect(() => {
    if (isMatchOver && isLocalWinner) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti unavailable
      }
    }
  }, [isMatchOver, isLocalWinner]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-950 border border-white/10 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl flex flex-col items-center text-center gap-6">
        {/* Victory / Defeat Header */}
        <div className="flex flex-col items-center">
          {isLocalWinner ? (
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-400/50 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_30px_rgba(225,29,72,0.4)]">
              <Skull className="w-8 h-8" />
            </div>
          )}

          <h2 className="text-3xl md:text-4xl font-display font-black tracking-wider text-white">
            {isMatchOver
              ? isLocalWinner
                ? 'VICTORY'
                : 'DEFEAT'
              : match.winnerTeam === 'ALPHA'
              ? 'TEAM ALPHA WINS ROUND'
              : 'TEAM BRAVO WINS ROUND'}
          </h2>

          <p className="text-xs font-mono text-slate-400 mt-1">
            {isMatchOver
              ? `Final Match Score: Alpha ${match.scores.ALPHA} - ${match.scores.BRAVO} Bravo`
              : `Round ${match.currentRound} Complete · Score: Alpha ${match.scores.ALPHA} - ${match.scores.BRAVO} Bravo`}
          </p>
        </div>

        {/* Local Performance Card */}
        <div className="w-full bg-slate-900/70 border border-white/5 rounded-2xl p-4 flex items-center justify-around">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Kills</span>
            <span className="text-xl font-display font-bold text-white tabular-nums">{localPlayer.stats.kills}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Damage</span>
            <span className="text-xl font-display font-bold text-cyan-400 tabular-nums">{localPlayer.stats.damageDealt}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Score</span>
            <span className="text-xl font-display font-bold text-amber-400 tabular-nums">{localPlayer.stats.score}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col w-full gap-2.5">
          {!isMatchOver ? (
            <button
              onClick={onNextRound}
              className="w-full py-3.5 rounded-2xl text-xs font-display font-bold tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>CONTINUE TO ROUND {match.currentRound + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRematch}
              className="w-full py-3.5 rounded-2xl text-xs font-display font-bold tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>REMATCH (NEW ROUND MATCH)</span>
            </button>
          )}

          <button
            onClick={onExitToMenu}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RETURN TO MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
