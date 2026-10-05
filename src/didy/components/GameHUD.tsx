import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ControlLayout, ControlScheme, GameMode } from '../types';
import { DropPhase } from '../scene/dropModeManager';
import { didyAudio } from '../audio/didyAudio';
import {
  Trophy,
  Users,
  Pause,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
  Zap,
  Hand,
  Smile,
  Plane,
  Sparkles,
  Sliders,
  ChevronUp,
  Compass,
  Shield,
  Heart,
  Crosshair,
  Radio,
  Target
} from 'lucide-react';

interface GameHUDProps {
  playerName: string;
  characterName: string;
  gameMode: GameMode;
  score: number;
  matchTimer: number;
  blueTeamScore?: number;
  redTeamScore?: number;
  dropPhase?: DropPhase;
  altitude: number;
  health?: number;
  aliveCount?: number;
  isCrouching?: boolean;
  playerRotY?: number;
  playerMapPos?: { x: number; z: number };
  controls: ControlLayout;
  onMove: (moveX: number, moveZ: number, isSprinting: boolean) => void;
  onLook: (deltaYaw: number, deltaPitch: number) => void;
  onJump: () => void;
  onToggleCrouch?: () => void;
  onDropJump?: () => void;
  onDeployGlider?: () => void;
  onAction: () => void;
  onInteract: () => void;
  onEmote: (emoteName: string) => void;
  onToggleScoreboard: () => void;
  onTogglePause: () => void;
  onChangeControlScheme?: (scheme: ControlScheme) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  playerName,
  characterName,
  gameMode,
  score,
  matchTimer,
  blueTeamScore = 0,
  redTeamScore = 0,
  dropPhase = 'LANDED',
  altitude,
  health = 100,
  aliveCount = gameMode === 'DROP_4V4' || gameMode === 'BLUETOOTH_4V4' ? 8 : 4,
  isCrouching = false,
  playerRotY = 0,
  playerMapPos = { x: 0, z: 0 },
  controls,
  onMove,
  onLook,
  onJump,
  onToggleCrouch,
  onDropJump,
  onDeployGlider,
  onAction,
  onInteract,
  onEmote,
  onToggleScoreboard,
  onTogglePause,
  onChangeControlScheme
}) => {
  // Current Control Scheme
  const [activeScheme, setActiveScheme] = useState<ControlScheme>(controls.controlScheme || 'DYNAMIC_JOYSTICK');

  // Touch tracking mutable refs for zero latency (60fps smooth response)
  const joystickTouchIdRef = useRef<number | null>(null);
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number } | null>(null);

  // Dynamic Joystick Visual State
  const [joystickVisible, setJoystickVisible] = useState(false);
  const [joystickCenter, setJoystickCenter] = useState({ x: 120, y: 300 });
  const [joystickKnob, setJoystickKnob] = useState({ x: 120, y: 300 });

  // Swipe Pad Visual State
  const [swipePadOrigin, setSwipePadOrigin] = useState<{ x: number; y: number } | null>(null);
  const [swipeVector, setSwipeVector] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // D-Pad active pressed buttons
  const dpadPressedRef = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false
  });

  // Emote Wheel Overlay
  const [showEmoteWheel, setShowEmoteWheel] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);

  // Minimap Canvas Ref
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (controls.controlScheme) {
      setActiveScheme(controls.controlScheme);
    }
  }, [controls.controlScheme]);

  const switchScheme = (newScheme: ControlScheme) => {
    setActiveScheme(newScheme);
    onMove(0, 0, false);
    if (onChangeControlScheme) {
      onChangeControlScheme(newScheme);
    }
  };

  // Draw Battle-Royale Circular Minimap
  useEffect(() => {
    const canvas = minimapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const mapScale = (w / 2) / 60; // 60 units radius

    ctx.clearRect(0, 0, w, h);

    // Dark Map Background
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = '#064e3b'; // Park grass
    ctx.fillRect(0, 0, w, h);

    // Roads
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cx - 3, 0, 6, h);
    ctx.fillRect(0, cy - 3, w, 6);

    // Lake (South-East [28, 26])
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(cx + 28 * mapScale, cy + 26 * mapScale, 18 * mapScale, 0, Math.PI * 2);
    ctx.fill();

    // Park House [0, -28]
    ctx.fillStyle = '#facc15';
    ctx.fillRect(cx - 8 * mapScale, cy - 34 * mapScale, 16 * mapScale, 12 * mapScale);

    // Safe Zone Circle (Battle-Royale style)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.arc(cx, cy, 38 * mapScale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Player position dot & heading cone
    const px = cx + playerMapPos.x * mapScale;
    const py = cy + playerMapPos.z * mapScale;

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Direction needle
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(playerRotY);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(3.5, 2);
    ctx.lineTo(-3.5, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.restore();

    // Outer Glow Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [playerMapPos, playerRotY]);

  // Compass degrees calculator
  const headingDeg = Math.round(((playerRotY * 180) / Math.PI + 360) % 360);
  const headingCardinals = [
    { deg: 0, text: 'N' },
    { deg: 45, text: 'NE' },
    { deg: 90, text: 'E' },
    { deg: 135, text: 'SE' },
    { deg: 180, text: 'S' },
    { deg: 225, text: 'SW' },
    { deg: 270, text: 'W' },
    { deg: 315, text: 'NW' }
  ];

  // --- TOUCH HANDLERS ---
  const handleTouchStart = (e: React.TouchEvent) => {
    const halfWidth = window.innerWidth / 2;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const target = e.target as HTMLElement;

      // Ignore touch if interacting with action buttons
      if (target.closest('button')) continue;

      // 1. LEFT HALF -> MOVEMENT INPUT
      if (touch.clientX < halfWidth && joystickTouchIdRef.current === null) {
        joystickTouchIdRef.current = touch.identifier;

        if (activeScheme === 'DYNAMIC_JOYSTICK') {
          setJoystickCenter({ x: touch.clientX, y: touch.clientY });
          setJoystickKnob({ x: touch.clientX, y: touch.clientY });
          setJoystickVisible(true);
        } else if (activeScheme === 'FIXED_JOYSTICK') {
          setJoystickCenter({ x: 130, y: window.innerHeight - 130 });
          setJoystickKnob({ x: touch.clientX, y: touch.clientY });
          setJoystickVisible(true);
        } else if (activeScheme === 'SWIPE_PAD') {
          setSwipePadOrigin({ x: touch.clientX, y: touch.clientY });
          setSwipeVector({ x: 0, y: 0 });
        }
      }
      // 2. RIGHT HALF -> CAMERA CONTROL
      else if (touch.clientX >= halfWidth && lookTouchIdRef.current === null) {
        lookTouchIdRef.current = touch.identifier;
        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // 1. MOVEMENT PROCESSING
      if (touch.identifier === joystickTouchIdRef.current) {
        if (activeScheme === 'DYNAMIC_JOYSTICK' || activeScheme === 'FIXED_JOYSTICK') {
          const center = activeScheme === 'FIXED_JOYSTICK'
            ? { x: 130, y: window.innerHeight - 130 }
            : joystickCenter;

          const dx = touch.clientX - center.x;
          const dy = touch.clientY - center.y;
          const dist = Math.hypot(dx, dy);
          const maxDist = controls.joystickSize * 0.45;

          let clampedX = dx;
          let clampedY = dy;
          if (dist > maxDist) {
            clampedX = (dx / dist) * maxDist;
            clampedY = (dy / dist) * maxDist;
          }

          setJoystickKnob({
            x: center.x + clampedX,
            y: center.y + clampedY
          });

          // Normalized movement vectors (-1 to 1)
          const moveX = (clampedX / maxDist) * controls.joystickSensitivity;
          const moveZ = (clampedY / maxDist) * controls.joystickSensitivity;
          const isSprinting = controls.autoRun || dist > maxDist * 0.85;

          onMove(moveX, moveZ, isSprinting);
        } else if (activeScheme === 'SWIPE_PAD' && swipePadOrigin) {
          const dx = touch.clientX - swipePadOrigin.x;
          const dy = touch.clientY - swipePadOrigin.y;
          const maxSwipe = 70;

          const clampedX = Math.max(-1, Math.min(1, dx / maxSwipe));
          const clampedY = Math.max(-1, Math.min(1, dy / maxSwipe));

          setSwipeVector({ x: clampedX, y: clampedY });
          const isSprinting = Math.hypot(clampedX, clampedY) > 0.8;
          onMove(clampedX * controls.joystickSensitivity, clampedY * controls.joystickSensitivity, isSprinting);
        }
      }

      // 2. CAMERA LOOK PROCESSING
      if (touch.identifier === lookTouchIdRef.current && lastLookPosRef.current) {
        const deltaX = touch.clientX - lastLookPosRef.current.x;
        const deltaY = touch.clientY - lastLookPosRef.current.y;
        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };

        const yawDelta = deltaX * 0.0055 * controls.cameraSensitivity;
        const pitchDelta = deltaY * 0.0055 * controls.cameraSensitivity;

        onLook(yawDelta, pitchDelta);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setJoystickVisible(false);
        setSwipePadOrigin(null);
        setSwipeVector({ x: 0, y: 0 });
        onMove(0, 0, false);
      }

      if (touch.identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        lastLookPosRef.current = null;
      }
    }
  };

  const updateDpad = (dir: 'up' | 'down' | 'left' | 'right', pressed: boolean) => {
    dpadPressedRef.current[dir] = pressed;
    const { up, down, left, right } = dpadPressedRef.current;

    let moveX = 0;
    let moveZ = 0;
    if (left) moveX -= 1;
    if (right) moveX += 1;
    if (up) moveZ -= 1;
    if (down) moveZ += 1;

    const len = Math.hypot(moveX, moveZ);
    if (len > 0) {
      moveX /= len;
      moveZ /= len;
    }

    onMove(moveX * controls.joystickSensitivity, moveZ * controls.joystickSensitivity, controls.autoRun);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isAirborne = dropPhase === 'PLANE_FLYBY' || dropPhase === 'FREEFALL' || dropPhase === 'GLIDING';

  return (
    <div
      className="absolute inset-0 select-none touch-none pointer-events-auto z-20 flex flex-col justify-between p-3 md:p-5 overflow-hidden font-sans"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* --- TOP COMPASS RIBBON (Free Fire Style) --- */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md px-6 py-1 rounded-full border border-white/15 flex items-center gap-4 text-xs font-mono z-30 pointer-events-none">
        <span className="text-amber-400 font-bold">{headingDeg}°</span>
        <div className="w-[1px] h-3 bg-white/20" />
        <div className="flex items-center gap-3 text-slate-300">
          <span className="font-bold text-white">
            {headingCardinals.find(c => Math.abs(c.deg - headingDeg) < 22.5)?.text || 'N'}
          </span>
          <span className="text-[10px] text-slate-400">THE PARK COMBAT ZONE</span>
        </div>
      </div>

      {/* --- TOP ROW: PLAYER HEALTH, BATTLE ROYALE STATS, MINIMAP --- */}
      <div className="flex items-start justify-between w-full pointer-events-none mt-7">
        {/* Top Left: Battle-Royale Player Health & Avatar Dossier */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md border border-white/15 p-2 rounded-2xl shadow-xl">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-display font-black text-cyan-300 text-sm">
              {playerName[0] || 'M'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-display font-black text-white">{playerName}</span>
                <span className="text-[9px] font-mono bg-amber-400/20 text-amber-300 px-1 rounded uppercase">
                  {characterName}
                </span>
              </div>
              {/* Battle Royale HP Bar */}
              <div className="flex items-center gap-1.5 mt-1">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">{health}</span>
              </div>
            </div>
          </div>

          {/* Active Battle Royale Challenge Badge */}
          <div className="bg-slate-950/80 backdrop-blur-md border border-amber-400/30 px-3 py-1 rounded-xl shadow-lg flex items-center gap-2 text-[10px] font-mono text-amber-300">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>CHALLENGE: Claim DIDY CUP Medals & Outlive Opponents!</span>
          </div>
        </div>

        {/* Top Center: Alive Count & Match Progress */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3 bg-slate-950/90 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl shadow-2xl">
            {/* Alive Counter */}
            <div className="flex items-center gap-1.5 pr-3 border-r border-white/15">
              <Users className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[8px] font-mono text-slate-400 uppercase">ALIVE</span>
                <span className="text-sm font-display font-black text-white">{aliveCount}/{gameMode === 'DROP_4V4' ? 8 : 4}</span>
              </div>
            </div>

            {/* Score / Mode Info */}
            <div className="flex flex-col items-center px-1">
              <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                {gameMode === 'DROP_4V4' ? '4/4 SQUAD BATTLE' : gameMode === 'DROP_2V2' ? '2/2 DUO BATTLE' : 'SOLO PARK'}
              </span>
              <span className="text-base font-mono font-bold text-amber-300 tabular-nums">
                {formatTimer(matchTimer)}
              </span>
            </div>

            {/* Team Score */}
            {gameMode !== 'SOLO_PARK' && (
              <div className="flex items-center gap-2 pl-3 border-l border-white/15">
                <span className="text-xs font-display font-bold text-blue-400">{blueTeamScore}</span>
                <span className="text-[10px] font-mono text-slate-500">vs</span>
                <span className="text-xs font-display font-bold text-rose-400">{redTeamScore}</span>
              </div>
            )}
          </div>

          {/* Altitude / Descent Meter during Drop */}
          {isAirborne && (
            <div className="mt-1 flex items-center gap-2 px-3.5 py-1 bg-cyan-950/90 border border-cyan-400/60 rounded-full shadow-lg animate-pulse">
              <Plane className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-xs font-mono font-bold text-cyan-300">
                {dropPhase === 'PLANE_FLYBY' ? 'AIRCRAFT CARGO BAY · PREPARE TO JUMP' :
                 dropPhase === 'FREEFALL' ? `FREEFALL DIVING · ALT: ${Math.round(altitude)}m` :
                 `GLIDING · ALT: ${Math.round(altitude)}m`}
              </span>
            </div>
          )}
        </div>

        {/* Top Right: Battle Royale Minimap & Buttons */}
        <div className="flex items-start gap-2.5 pointer-events-auto">
          {/* Circular Battle Royale Minimap */}
          <div className="relative shadow-2xl rounded-full overflow-hidden border-2 border-cyan-400/60 bg-slate-950">
            <canvas ref={minimapCanvasRef} width={80} height={80} className="w-20 h-20 block" />
            <div className="absolute inset-0 pointer-events-none rounded-full ring-1 ring-white/20" />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => {
                didyAudio.playButtonClick();
                setShowScoreboard(!showScoreboard);
              }}
              className="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Scoreboard"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                didyAudio.playButtonClick();
                onTogglePause();
              }}
              className="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Pause Menu"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* --- AIR-DROP SPECIAL INTERACTION OVERLAY (Battle-Royale style) --- */}
      {dropPhase === 'PLANE_FLYBY' && (
        <div className="absolute inset-x-0 bottom-28 flex flex-col items-center gap-3 z-40 pointer-events-auto">
          <button
            onClick={() => {
              didyAudio.playJump();
              if (onDropJump) onDropJump();
            }}
            className="group px-10 py-5 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-display font-black text-xl tracking-wider shadow-[0_0_50px_rgba(245,158,11,0.6)] border-2 border-white flex items-center gap-3 cursor-pointer animate-bounce"
          >
            <Plane className="w-7 h-7 fill-slate-950 group-hover:rotate-12 transition-transform" />
            <span>JUMP FROM AIRCRAFT</span>
          </button>
          <span className="text-xs font-mono text-cyan-200 bg-slate-950/70 px-4 py-1 rounded-full border border-cyan-400/40">
            Pick your landing zone over The Park!
          </span>
        </div>
      )}

      {dropPhase === 'FREEFALL' && (
        <div className="absolute inset-x-0 bottom-28 flex flex-col items-center gap-3 z-40 pointer-events-auto">
          <button
            onClick={() => {
              if (onDeployGlider) onDeployGlider();
            }}
            className="px-8 py-4 rounded-3xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:brightness-110 active:scale-95 text-slate-950 font-display font-black text-base tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.6)] border-2 border-white flex items-center gap-2 cursor-pointer"
          >
            <Plane className="w-5 h-5 fill-slate-950" />
            <span>DEPLOY GLIDER</span>
          </button>
          <span className="text-[11px] font-mono text-cyan-300 bg-slate-950/70 px-3 py-0.5 rounded-full">
            Steer left/right to aim for loot hotspots
          </span>
        </div>
      )}

      {/* --- MOVEMENT CONTROLS OVERLAYS --- */}
      {(activeScheme === 'DYNAMIC_JOYSTICK' || activeScheme === 'FIXED_JOYSTICK') && (
        <>
          {(joystickVisible || activeScheme === 'FIXED_JOYSTICK') && (
            <div
              className="absolute rounded-full border-2 border-cyan-400/50 bg-slate-900/50 backdrop-blur-xs pointer-events-none flex items-center justify-center transition-opacity duration-150"
              style={{
                left: `${activeScheme === 'FIXED_JOYSTICK' ? 130 - controls.joystickSize / 2 : joystickCenter.x - controls.joystickSize / 2}px`,
                top: `${activeScheme === 'FIXED_JOYSTICK' ? window.innerHeight - 130 - controls.joystickSize / 2 : joystickCenter.y - controls.joystickSize / 2}px`,
                width: `${controls.joystickSize}px`,
                height: `${controls.joystickSize}px`,
                opacity: controls.joystickOpacity
              }}
            >
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 shadow-[0_0_18px_rgba(6,182,212,0.8)] border-2 border-white pointer-events-none"
                style={{
                  transform: `translate(${
                    activeScheme === 'FIXED_JOYSTICK'
                      ? joystickKnob.x - 130
                      : joystickKnob.x - joystickCenter.x
                  }px, ${
                    activeScheme === 'FIXED_JOYSTICK'
                      ? joystickKnob.y - (window.innerHeight - 130)
                      : joystickKnob.y - joystickCenter.y
                  }px)`
                }}
              />
            </div>
          )}
        </>
      )}

      {/* 2. SWIPE PAD INDICATOR */}
      {activeScheme === 'SWIPE_PAD' && swipePadOrigin && (
        <div
          className="absolute w-24 h-24 rounded-full border border-cyan-400/50 bg-slate-900/40 backdrop-blur-xs pointer-events-none flex items-center justify-center"
          style={{
            left: `${swipePadOrigin.x - 48}px`,
            top: `${swipePadOrigin.y - 48}px`
          }}
        >
          <div
            className="w-8 h-8 rounded-full bg-cyan-400/90 shadow-md transition-transform"
            style={{
              transform: `translate(${swipeVector.x * 32}px, ${swipeVector.y * 32}px)`
            }}
          />
        </div>
      )}

      {/* 3. D-PAD BUTTONS (Tactile Touch 4-Way) */}
      {activeScheme === 'DPAD_BUTTONS' && (
        <div className="absolute left-6 bottom-8 pointer-events-auto z-20 flex flex-col items-center gap-1.5">
          <button
            onTouchStart={(e) => { e.stopPropagation(); updateDpad('up', true); }}
            onTouchEnd={(e) => { e.stopPropagation(); updateDpad('up', false); }}
            onMouseDown={() => updateDpad('up', true)}
            onMouseUp={() => updateDpad('up', false)}
            className="w-14 h-14 rounded-2xl bg-slate-900/85 border border-cyan-400/40 active:bg-cyan-500 active:text-slate-950 text-cyan-300 flex items-center justify-center shadow-lg cursor-pointer"
          >
            <ArrowUp className="w-6 h-6 stroke-[3]" />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onTouchStart={(e) => { e.stopPropagation(); updateDpad('left', true); }}
              onTouchEnd={(e) => { e.stopPropagation(); updateDpad('left', false); }}
              onMouseDown={() => updateDpad('left', true)}
              onMouseUp={() => updateDpad('left', false)}
              className="w-14 h-14 rounded-2xl bg-slate-900/85 border border-cyan-400/40 active:bg-cyan-500 active:text-slate-950 text-cyan-300 flex items-center justify-center shadow-lg cursor-pointer"
            >
              <ArrowLeft className="w-6 h-6 stroke-[3]" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-slate-500" />
            </div>
            <button
              onTouchStart={(e) => { e.stopPropagation(); updateDpad('right', true); }}
              onTouchEnd={(e) => { e.stopPropagation(); updateDpad('right', false); }}
              onMouseDown={() => updateDpad('right', true)}
              onMouseUp={() => updateDpad('right', false)}
              className="w-14 h-14 rounded-2xl bg-slate-900/85 border border-cyan-400/40 active:bg-cyan-500 active:text-slate-950 text-cyan-300 flex items-center justify-center shadow-lg cursor-pointer"
            >
              <ArrowRight className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
          <button
            onTouchStart={(e) => { e.stopPropagation(); updateDpad('down', true); }}
            onTouchEnd={(e) => { e.stopPropagation(); updateDpad('down', false); }}
            onMouseDown={() => updateDpad('down', true)}
            onMouseUp={() => updateDpad('down', false)}
            className="w-14 h-14 rounded-2xl bg-slate-900/85 border border-cyan-400/40 active:bg-cyan-500 active:text-slate-950 text-cyan-300 flex items-center justify-center shadow-lg cursor-pointer"
          >
            <ArrowDown className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      )}

      {/* --- RIGHT SIDE ACTION BUTTON CLUSTER (Battle Royale Layout) --- */}
      {!isAirborne && (
        <>
          {/* 1. JUMP BUTTON */}
          <button
            onClick={() => {
              didyAudio.playJump();
              onJump();
            }}
            className="absolute rounded-full bg-gradient-to-tr from-cyan-600 to-teal-400 text-slate-950 font-black border-2 border-white shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-90 transition-transform flex items-center justify-center cursor-pointer pointer-events-auto"
            style={{
              left: `${controls.buttonPositions.jump.x}%`,
              top: `${controls.buttonPositions.jump.y}%`,
              width: `${controls.buttonSize}px`,
              height: `${controls.buttonSize}px`,
              transform: 'translate(-50%, -50%)',
              opacity: controls.buttonOpacity
            }}
          >
            <ArrowUp className="w-7 h-7 stroke-[3]" />
          </button>

          {/* 2. CROUCH BUTTON (Requested in Mobile Controls) */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              if (onToggleCrouch) onToggleCrouch();
            }}
            className={`absolute rounded-full border-2 transition-all active:scale-90 flex items-center justify-center cursor-pointer pointer-events-auto shadow-xl ${
              isCrouching
                ? 'bg-amber-400 border-white text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                : 'bg-slate-900/90 border-white/30 text-white'
            }`}
            style={{
              left: `${controls.buttonPositions.crouch.x}%`,
              top: `${controls.buttonPositions.crouch.y}%`,
              width: `${controls.buttonSize - 4}px`,
              height: `${controls.buttonSize - 4}px`,
              transform: 'translate(-50%, -50%)',
              opacity: controls.buttonOpacity
            }}
            title="Crouch / Sneak"
          >
            <ArrowDown className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* 3. ACTION / WHACK BUTTON */}
          <button
            onClick={() => {
              didyAudio.playHighFive();
              onAction();
            }}
            className="absolute rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-90 transition-transform flex items-center justify-center cursor-pointer pointer-events-auto"
            style={{
              left: `${controls.buttonPositions.action.x}%`,
              top: `${controls.buttonPositions.action.y}%`,
              width: `${controls.buttonSize}px`,
              height: `${controls.buttonSize}px`,
              transform: 'translate(-50%, -50%)',
              opacity: controls.buttonOpacity
            }}
          >
            <Zap className="w-7 h-7 fill-slate-950" />
          </button>

          {/* 4. INTERACT / LOOT BUTTON */}
          <button
            onClick={() => {
              didyAudio.playCollectMedal();
              onInteract();
            }}
            className="absolute rounded-full bg-slate-900/90 border border-white/25 text-white active:scale-90 transition-transform flex items-center justify-center cursor-pointer pointer-events-auto shadow-lg"
            style={{
              left: `${controls.buttonPositions.interact.x}%`,
              top: `${controls.buttonPositions.interact.y}%`,
              width: `${controls.buttonSize - 8}px`,
              height: `${controls.buttonSize - 8}px`,
              transform: 'translate(-50%, -50%)',
              opacity: controls.buttonOpacity
            }}
            title="Interact / Loot Crate"
          >
            <Hand className="w-5 h-5 text-cyan-300" />
          </button>

          {/* 5. SPRINT BUTTON */}
          <button
            onClick={() => onMove(0, -1, true)}
            className="absolute rounded-full bg-slate-900/90 border border-white/25 text-white active:scale-90 transition-transform flex items-center justify-center cursor-pointer pointer-events-auto shadow-lg"
            style={{
              left: `${controls.buttonPositions.sprint.x}%`,
              top: `${controls.buttonPositions.sprint.y}%`,
              width: `${controls.buttonSize - 8}px`,
              height: `${controls.buttonSize - 8}px`,
              transform: 'translate(-50%, -50%)',
              opacity: controls.buttonOpacity
            }}
          >
            <Flame className="w-5 h-5 text-amber-400" />
          </button>

          {/* 6. EMOTE BUTTON */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              setShowEmoteWheel(true);
            }}
            className="absolute rounded-full bg-purple-600/90 border border-purple-300 text-white active:scale-90 transition-transform flex items-center justify-center cursor-pointer pointer-events-auto shadow-lg"
            style={{
              left: `${controls.buttonPositions.emote.x}%`,
              top: `${controls.buttonPositions.emote.y}%`,
              width: `${controls.buttonSize - 12}px`,
              height: `${controls.buttonSize - 12}px`,
              transform: 'translate(-50%, -50%)',
              opacity: controls.buttonOpacity
            }}
          >
            <Smile className="w-5 h-5" />
          </button>
        </>
      )}

      {/* --- IN-GAME SCOREBOARD MODAL --- */}
      {showScoreboard && (
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center pointer-events-auto z-40 p-4">
          <div className="bg-[#0b1320] border-2 border-cyan-400/40 rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-display font-black text-white">MATCH SCOREBOARD</h3>
              </div>
              <button
                onClick={() => setShowScoreboard(false)}
                className="text-xs font-mono text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-950/40 rounded-xl border border-blue-400/20">
              <span className="text-xs font-display font-bold text-white">{playerName} (You)</span>
              <span className="text-xs font-mono font-bold text-amber-300">{score} PTS</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 text-center">
              Compete to claim the DIDY CUP at match conclusion!
            </div>
          </div>
        </div>
      )}

      {/* --- EMOTE WHEEL POPUP --- */}
      {showEmoteWheel && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-30">
          <div className="bg-slate-950 border border-white/20 p-5 rounded-3xl shadow-2xl flex flex-col items-center gap-3">
            <h3 className="text-sm font-display font-black text-amber-400 tracking-wider">SELECT EMOTE</h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-display font-bold">
              {['Classic Oooooh!', 'Hamboning Dance', 'Mystic Yeti Hop', 'High Five!'].map(emote => (
                <button
                  key={emote}
                  onClick={() => {
                    didyAudio.playHighFive();
                    onEmote(emote);
                    setShowEmoteWheel(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 border border-white/10 text-white transition-colors cursor-pointer"
                >
                  {emote}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowEmoteWheel(false)}
              className="text-xs font-mono text-slate-400 mt-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
