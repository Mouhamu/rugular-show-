import React, { useEffect, useRef } from 'react';
import { PlayerState, MatchState, WeaponDef, Team } from '../types';
import { Shield, Crosshair, Pause, Volume2, Users, Flame, Skull, Zap } from 'lucide-react';

interface HUDProps {
  player: PlayerState;
  currentWeapon: WeaponDef;
  match: MatchState;
  allPlayers: PlayerState[];
  hitMarker: { active: boolean; isHeadshot: boolean } | null;
  damageIndicatorAngle: number | null; // angle in degrees relative to player facing
  onToggleScoreboard: () => void;
  onTogglePause: () => void;
  onSpectateNext: () => void;
  onSpectatePrev: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  currentWeapon,
  match,
  allPlayers,
  hitMarker,
  damageIndicatorAngle,
  onToggleScoreboard,
  onTogglePause,
  onSpectateNext,
  onSpectatePrev
}) => {
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- MINIMAP RADAR RENDERING ---
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 120;
    const center = size / 2;
    const mapScale = 1.6; // world units to radar pixels

    ctx.clearRect(0, 0, size, size);

    // Radar circular background
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.stroke();

    // Concentric range rings
    ctx.beginPath();
    ctx.arc(center, center, center * 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();

    // Map obstacles representation (Center platform)
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-player.rotation.yaw); // rotate map with player heading

    // Center platform indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(-5 * mapScale, -5 * mapScale, 10 * mapScale, 10 * mapScale);

    // Buildings
    ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.fillRect((-18 - player.position.x - 6) * mapScale, (0 - player.position.z - 5) * mapScale, 12 * mapScale, 10 * mapScale);
    ctx.fillRect((18 - player.position.x - 6) * mapScale, (0 - player.position.z - 5) * mapScale, 12 * mapScale, 10 * mapScale);

    // Draw other players
    allPlayers.forEach(p => {
      if (p.id === player.id || !p.isAlive) return;

      const relX = (p.position.x - player.position.x) * mapScale;
      const relZ = (p.position.z - player.position.z) * mapScale;

      // Check if within radar circle
      const dist = Math.hypot(relX, relZ);
      if (dist < center - 6) {
        ctx.beginPath();
        ctx.arc(relX, relZ, 4, 0, Math.PI * 2);

        if (p.team === player.team) {
          // Teammate (Blue / Green)
          ctx.fillStyle = '#38bdf8';
          ctx.fill();
        } else {
          // Enemy: visible if shooting or close
          if (p.isShooting || dist < 35) {
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            if (p.isShooting) {
              ctx.lineWidth = 2;
              ctx.strokeStyle = '#fef08a';
              ctx.stroke();
            }
          }
        }
      }
    });

    ctx.restore();

    // Player arrow at center
    ctx.save();
    ctx.translate(center, center);
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 4);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fillStyle = player.team === 'ALPHA' ? '#38bdf8' : '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }, [player.position, player.rotation.yaw, allPlayers, player.team, player.id]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isEliminated = !player.isAlive;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 md:p-5 overflow-hidden">
      {/* --- TOP ROW: ROUND BANNER, MATCH TIMER & MINIMAP --- */}
      <div className="flex items-start justify-between w-full">
        {/* Top Left: Minimap & Ping */}
        <div className="flex flex-col gap-1.5">
          <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border border-slate-700/60 shadow-lg backdrop-blur-md bg-slate-950/40">
            <canvas ref={radarCanvasRef} width={120} height={120} className="w-full h-full" />
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-cyan-400 font-bold tracking-wider">
              GPS-7
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-white/5 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>BT DIRECT · {player.ping}ms</span>
          </div>
        </div>

        {/* Top Center: Round & Scoreboard Bar */}
        <div className="flex flex-col items-center gap-1">
          {/* Match Score & Timer Capsule */}
          <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-xl shadow-2xl">
            {/* Team Alpha (Blue) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-display font-bold tracking-wider text-blue-400">ALPHA</span>
              <span className="text-xl font-display font-bold text-white tabular-nums">{match.scores.ALPHA}</span>
            </div>

            {/* Match Timer */}
            <div className="flex flex-col items-center px-3 border-x border-white/10 min-w-[70px]">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                RND {match.currentRound}/{match.maxRounds}
              </span>
              <span className={`text-base font-mono font-bold tabular-nums ${match.roundTimer < 30 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
                {formatTimer(match.roundTimer)}
              </span>
            </div>

            {/* Team Bravo (Red) */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-bold text-white tabular-nums">{match.scores.BRAVO}</span>
              <span className="text-xs font-display font-bold tracking-wider text-rose-400">BRAVO</span>
            </div>
          </div>

          {/* Round Countdown Overlay */}
          {match.roundState === 'COUNTDOWN' && (
            <div className="mt-8 flex flex-col items-center justify-center animate-bounce">
              <div className="text-5xl md:text-7xl font-display font-black text-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]">
                {match.countdownTimer > 0 ? match.countdownTimer : 'ENGAGE!'}
              </div>
              <span className="text-xs font-display tracking-widest text-slate-300 uppercase mt-1">
                Round {match.currentRound} Starting
              </span>
            </div>
          )}
        </div>

        {/* Top Right: Buttons & Kill Feed */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onToggleScoreboard}
              className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Tactical Scoreboard"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={onTogglePause}
              className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Pause Menu"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>

          {/* Kill Feed */}
          <div className="flex flex-col gap-1 w-52 max-h-32 overflow-hidden pointer-events-none">
            {match.killFeed.slice(-3).map(item => (
              <div
                key={item.id}
                className="flex items-center justify-end gap-1.5 text-[11px] font-mono bg-slate-950/70 border border-white/5 px-2 py-1 rounded backdrop-blur-sm shadow-md animate-fadeIn"
              >
                <span className={item.killerTeam === 'ALPHA' ? 'text-blue-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {item.killerName}
                </span>
                <span className="text-slate-500 font-sans">[{item.weaponName}]</span>
                {item.isHeadshot && <Skull className="w-3 h-3 text-amber-400" />}
                <span className={item.victimTeam === 'ALPHA' ? 'text-blue-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {item.victimName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CENTER SCREEN: CROSSHAIR, HITMARKER & DAMAGE DIRECTION --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Dynamic Crosshair (hidden during sniper ADS or when dead) */}
        {!isEliminated && (!player.isAiming || currentWeapon.category !== 'SNIPER') && (
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* Center dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-sm" />

            {/* Dynamic Spread Ticks */}
            {(() => {
              const spreadOffset = (player.isAiming ? 8 : (player.isSprinting ? 22 : player.isShooting ? 18 : 12));
              return (
                <>
                  <div
                    className="absolute w-2 h-0.5 bg-white/80 transition-all duration-75"
                    style={{ left: `calc(50% - ${spreadOffset + 8}px)` }}
                  />
                  <div
                    className="absolute w-2 h-0.5 bg-white/80 transition-all duration-75"
                    style={{ right: `calc(50% - ${spreadOffset + 8}px)` }}
                  />
                  <div
                    className="absolute w-0.5 h-2 bg-white/80 transition-all duration-75"
                    style={{ top: `calc(50% - ${spreadOffset + 8}px)` }}
                  />
                  <div
                    className="absolute w-0.5 h-2 bg-white/80 transition-all duration-75"
                    style={{ bottom: `calc(50% - ${spreadOffset + 8}px)` }}
                  />
                </>
              );
            })()}
          </div>
        )}

        {/* Sniper Scope Overlay when Aiming with AWM */}
        {!isEliminated && player.isAiming && currentWeapon.category === 'SNIPER' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            {/* Outer scope circular vignette */}
            <div className="w-[340px] h-[340px] md:w-[480px] md:h-[480px] rounded-full border-[3px] border-slate-900 shadow-[0_0_0_9999px_rgba(0,0,0,0.85)] relative flex items-center justify-center">
              {/* Scope crosshair reticle lines */}
              <div className="absolute w-full h-[1px] bg-emerald-500/70" />
              <div className="absolute h-full w-[1px] bg-emerald-500/70" />
              {/* Range gradation ticks */}
              <div className="absolute w-8 h-[1px] bg-emerald-400" style={{ top: '35%' }} />
              <div className="absolute w-12 h-[1px] bg-emerald-400" style={{ top: '42%' }} />
              <div className="absolute w-8 h-[1px] bg-emerald-400" style={{ top: '65%' }} />
              <div className="absolute w-12 h-[1px] bg-emerald-400" style={{ top: '58%' }} />
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <div className="absolute top-4 text-[10px] font-mono text-emerald-400/80">AWM PRECISION OPTICS 8X</div>
            </div>
          </div>
        )}

        {/* Hit Marker Blip */}
        {hitMarker?.active && (
          <div className="absolute flex items-center justify-center animate-ping">
            <div className={`w-7 h-7 border-2 rotate-45 ${hitMarker.isHeadshot ? 'border-amber-400' : 'border-white'}`} />
          </div>
        )}

        {/* Directional Damage Indicator Arc */}
        {damageIndicatorAngle !== null && (
          <div
            className="absolute w-64 h-64 rounded-full pointer-events-none transition-transform duration-100"
            style={{ transform: `rotate(${damageIndicatorAngle}deg)` }}
          >
            <div className="w-16 h-4 mx-auto bg-gradient-to-t from-transparent to-rose-600 rounded-t-full opacity-90 shadow-[0_0_15px_rgba(225,29,72,0.8)]" />
          </div>
        )}
      </div>

      {/* --- SPECTATOR MODE OVERLAY WHEN ELIMINATED --- */}
      {isEliminated && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-auto backdrop-blur-sm z-30">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 text-center shadow-2xl max-w-sm w-full mx-4">
            <Skull className="w-12 h-12 text-rose-500 mx-auto mb-2 animate-bounce" />
            <h2 className="text-2xl font-display font-bold text-white tracking-wider">ELIMINATED</h2>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Spectating teammate. Respawn on next round start.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onSpectatePrev}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-white/10 text-white transition-colors"
              >
                ◀ Prev Teammate
              </button>
              <button
                onClick={onSpectateNext}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-white/10 text-white transition-colors"
              >
                Next Teammate ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOTTOM ROW: HEALTH/ARMOR & AMMUNITION STATUS --- */}
      {!isEliminated && (
        <div className="flex items-end justify-between w-full">
          {/* Bottom Left: Health, Armor, and Character Info */}
          <div className="flex flex-col gap-2 bg-slate-950/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl w-60">
            {/* Health Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Zap className="w-3.5 h-3.5" /> HP
                </span>
                <span className="text-white tabular-nums">{player.health} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                  style={{ width: `${player.health}%` }}
                />
              </div>
            </div>

            {/* Armor Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-mono font-semibold">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Shield className="w-3.5 h-3.5" /> ARMOR
                </span>
                <span className="text-white tabular-nums">{player.armor} / 100</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-150"
                  style={{ width: `${player.armor}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Right: Weapon & Ammunition Info */}
          <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-xl">
            <div className="flex flex-col items-end">
              <span className="text-xs font-display font-bold tracking-wider text-slate-300 uppercase">
                {currentWeapon.name}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-3xl font-display font-black tabular-nums ${player.ammoInMag <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                  {player.ammoInMag}
                </span>
                <span className="text-sm font-mono text-slate-400">/ {player.ammoInReserve}</span>
              </div>
              {player.isReloading && (
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider animate-pulse">
                  RELOADING...
                </span>
              )}
            </div>

            {/* Circular Reload Progress */}
            {player.isReloading && (
              <div className="w-8 h-8 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
