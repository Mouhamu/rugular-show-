import React from 'react';
import { Play, Settings, Users, Home, X } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onOpenScoreboard: () => void;
  onOpenSettings: () => void;
  onExitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOpenScoreboard,
  onOpenSettings,
  onExitToMenu
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-950 border border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-5 text-center">
        <div>
          <h2 className="text-2xl font-display font-black text-white tracking-wider">TACTICAL OPS PAUSED</h2>
          <p className="text-xs font-mono text-slate-400 mt-1">Match state suspended</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl text-xs font-display font-bold tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>RESUME COMBAT</span>
          </button>

          <button
            onClick={onOpenScoreboard}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-850 border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>VIEW SCOREBOARD</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-850 border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>SETTINGS & CONTROLS</span>
          </button>

          <button
            onClick={onExitToMenu}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/20 border border-rose-500/20 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <Home className="w-4 h-4" />
            <span>QUIT TO MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
