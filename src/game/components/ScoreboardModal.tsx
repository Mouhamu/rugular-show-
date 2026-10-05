import React from 'react';
import { PlayerState, MatchState, Team } from '../types';
import { Users, X, Trophy, Skull, Crosshair, Shield } from 'lucide-react';

interface ScoreboardModalProps {
  match: MatchState;
  players: PlayerState[];
  onClose: () => void;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({ match, players, onClose }) => {
  const alphaPlayers = players.filter(p => p.team === 'ALPHA');
  const bravoPlayers = players.filter(p => p.team === 'BRAVO');

  const renderTeamTable = (team: Team, teamName: string, teamScore: number, teamPlayers: PlayerState[]) => {
    const isAlpha = team === 'ALPHA';
    const accentColor = isAlpha ? 'text-blue-400' : 'text-rose-400';
    const borderAccent = isAlpha ? 'border-blue-500/30' : 'border-rose-500/30';
    const bgHeader = isAlpha ? 'bg-blue-950/30' : 'bg-rose-950/30';

    return (
      <div className={`flex flex-col rounded-2xl border ${borderAccent} bg-slate-900/60 overflow-hidden shadow-xl`}>
        {/* Team Banner */}
        <div className={`flex items-center justify-between px-4 py-3 ${bgHeader} border-b border-white/5`}>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isAlpha ? 'bg-blue-500' : 'bg-rose-500'}`} />
            <h3 className={`text-base font-display font-bold tracking-wider ${accentColor}`}>{teamName}</h3>
          </div>
          <div className="flex items-center gap-2 font-display font-black text-2xl text-white">
            <span className="text-xs font-mono text-slate-400 uppercase font-normal mr-1">Rounds:</span>
            {teamScore}
          </div>
        </div>

        {/* Players List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px]">
                <th className="px-4 py-2 font-medium">Player</th>
                <th className="px-2 py-2 text-center font-medium">Kills</th>
                <th className="px-2 py-2 text-center font-medium">Deaths</th>
                <th className="px-2 py-2 text-center font-medium">Assists</th>
                <th className="px-2 py-2 text-center font-medium">Score</th>
                <th className="px-3 py-2 text-right font-medium">Ping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teamPlayers.map(p => (
                <tr key={p.id} className={`hover:bg-white/5 transition-colors ${p.isLocal ? 'bg-cyan-500/10' : ''}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.isAlive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <span className={`font-semibold ${p.isLocal ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {p.name} {p.isLocal && '(YOU)'}
                      </span>
                      {p.isBot && <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">BOT</span>}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-center font-bold text-white tabular-nums">{p.stats.kills}</td>
                  <td className="px-2 py-2.5 text-center text-slate-400 tabular-nums">{p.stats.deaths}</td>
                  <td className="px-2 py-2.5 text-center text-slate-400 tabular-nums">{p.stats.assists}</td>
                  <td className="px-2 py-2.5 text-center font-bold text-amber-400 tabular-nums">{p.stats.score}</td>
                  <td className="px-3 py-2.5 text-right text-slate-500 tabular-nums">{p.ping}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-950 border border-white/10 rounded-3xl max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-wider">TACTICAL SCOREBOARD</h2>
              <p className="text-xs font-mono text-slate-400">
                ROUND {match.currentRound} OF {match.maxRounds} · TIME: {Math.floor(match.roundTimer / 60)}:{(match.roundTimer % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Scoreboards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderTeamTable('ALPHA', 'TEAM ALPHA (VANGUARD)', match.scores.ALPHA, alphaPlayers)}
          {renderTeamTable('BRAVO', 'TEAM BRAVO (STRIKE)', match.scores.BRAVO, bravoPlayers)}
        </div>

        {/* Bottom Helper */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
          <span>Tap anywhere outside or press TAB / ESC to close</span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold rounded-xl border border-white/10 transition-colors"
          >
            RESUME COMBAT
          </button>
        </div>
      </div>
    </div>
  );
};
