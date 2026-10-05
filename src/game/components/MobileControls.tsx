import React, { useRef, useState, useEffect } from 'react';
import { TouchControlLayout, GameSettings } from '../types';
import { Crosshair, RotateCw, ArrowUp, ArrowDown, Bomb, Hand, Shield, ChevronUp } from 'lucide-react';

interface MobileControlsProps {
  layout: TouchControlLayout;
  settings: GameSettings;
  canInteract: boolean;
  onMove: (moveX: number, moveZ: number, isSprinting: boolean) => void;
  onLook: (deltaYaw: number, deltaPitch: number) => void;
  onFireStart: () => void;
  onFireEnd: () => void;
  onToggleAim: () => void;
  onReload: () => void;
  onJump: () => void;
  onToggleCrouch: () => void;
  onThrowGrenade: () => void;
  onSwitchWeapon: (slotIndex: 0 | 1 | 2 | 3) => void;
  onInteract: () => void;
  isAiming: boolean;
  isCrouching: boolean;
  activeSlot: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  layout,
  settings,
  canInteract,
  onMove,
  onLook,
  onFireStart,
  onFireEnd,
  onToggleAim,
  onReload,
  onJump,
  onToggleCrouch,
  onThrowGrenade,
  onSwitchWeapon,
  onInteract,
  isAiming,
  isCrouching,
  activeSlot
}) => {
  // Joystick State
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickCenter, setJoystickCenter] = useState({ x: 0, y: 0 });
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickTouchIdRef = useRef<number | null>(null);

  // Look Touch State
  const lookTouchIdRef = useRef<number | null>(null);
  const lastLookPosRef = useRef<{ x: number; y: number } | null>(null);

  // Auto-fire interval for hold-to-shoot
  const isFiringRef = useRef<boolean>(false);

  // Touch listener for Left Zone (Joystick) and Right Zone (Camera Look)
  const handleTouchStart = (e: React.TouchEvent) => {
    const halfWidth = window.innerWidth / 2;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Left half of screen -> Joystick
      if (touch.clientX < halfWidth && joystickTouchIdRef.current === null) {
        joystickTouchIdRef.current = touch.identifier;
        setJoystickCenter({ x: touch.clientX, y: touch.clientY });
        setJoystickPos({ x: touch.clientX, y: touch.clientY });
        setJoystickActive(true);
      }
      // Right half of screen -> Camera Look
      else if (touch.clientX >= halfWidth && lookTouchIdRef.current === null) {
        // Only if not touching an explicit action button
        const target = e.target as HTMLElement;
        if (!target.closest('button')) {
          lookTouchIdRef.current = touch.identifier;
          lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      // Joystick Movement
      if (touch.identifier === joystickTouchIdRef.current) {
        const dx = touch.clientX - joystickCenter.x;
        const dy = touch.clientY - joystickCenter.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 55;

        let clampedX = dx;
        let clampedY = dy;
        if (dist > maxDist) {
          clampedX = (dx / dist) * maxDist;
          clampedY = (dy / dist) * maxDist;
        }

        setJoystickPos({
          x: joystickCenter.x + clampedX,
          y: joystickCenter.y + clampedY
        });

        // Normalized move vector (-1 to 1)
        const moveX = clampedX / maxDist;
        const moveZ = clampedY / maxDist;
        const isSprinting = dist > maxDist * 0.85;

        onMove(moveX, moveZ, isSprinting);
      }

      // Camera Look Movement
      if (touch.identifier === lookTouchIdRef.current && lastLookPosRef.current) {
        const deltaX = touch.clientX - lastLookPosRef.current.x;
        const deltaY = touch.clientY - lastLookPosRef.current.y;

        lastLookPosRef.current = { x: touch.clientX, y: touch.clientY };

        const sens = settings.lookSensitivity * (isAiming ? settings.adsSensitivityMultiplier : 1.0);
        const yawDelta = deltaX * 0.005 * sens;
        const pitchDelta = (settings.invertY ? -deltaY : deltaY) * 0.005 * sens;

        onLook(yawDelta, pitchDelta);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setJoystickActive(false);
        onMove(0, 0, false);
      }

      if (touch.identifier === lookTouchIdRef.current) {
        lookTouchIdRef.current = null;
        lastLookPosRef.current = null;
      }
    }
  };

  return (
    <div
      className="absolute inset-0 select-none touch-none pointer-events-auto z-10"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* --- VIRTUAL JOYSTICK INDICATOR --- */}
      {joystickActive && (
        <div
          className="absolute rounded-full border-2 border-slate-400/40 bg-slate-900/30 backdrop-blur-xs pointer-events-none flex items-center justify-center transition-opacity duration-150"
          style={{
            left: `${joystickCenter.x - 60}px`,
            top: `${joystickCenter.y - 60}px`,
            width: '120px',
            height: '120px'
          }}
        >
          {/* Inner Knob */}
          <div
            className="w-12 h-12 rounded-full bg-slate-200/80 shadow-lg border border-white/50"
            style={{
              transform: `translate(${joystickPos.x - joystickCenter.x}px, ${joystickPos.y - joystickCenter.y}px)`
            }}
          />
        </div>
      )}

      {/* --- WEAPON QUICK SWITCH ROW (Top Right / Middle) --- */}
      <div
        className="absolute flex items-center gap-1.5 p-1 bg-slate-950/70 border border-white/10 rounded-xl backdrop-blur-md"
        style={{
          left: `${layout.weaponSwitch.x}%`,
          top: `${layout.weaponSwitch.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <button
          onClick={() => onSwitchWeapon(0)}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${
            activeSlot === 0 ? 'bg-cyan-500 text-slate-950 shadow-md scale-105' : 'text-slate-300 hover:text-white bg-slate-800/80'
          }`}
        >
          PRI
        </button>
        <button
          onClick={() => onSwitchWeapon(1)}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${
            activeSlot === 1 ? 'bg-cyan-500 text-slate-950 shadow-md scale-105' : 'text-slate-300 hover:text-white bg-slate-800/80'
          }`}
        >
          SEC
        </button>
        <button
          onClick={() => onSwitchWeapon(2)}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${
            activeSlot === 2 ? 'bg-cyan-500 text-slate-950 shadow-md scale-105' : 'text-slate-300 hover:text-white bg-slate-800/80'
          }`}
        >
          KNIFE
        </button>
        <button
          onClick={() => onSwitchWeapon(3)}
          className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all ${
            activeSlot === 3 ? 'bg-cyan-500 text-slate-950 shadow-md scale-105' : 'text-slate-300 hover:text-white bg-slate-800/80'
          }`}
        >
          FRAG
        </button>
      </div>

      {/* --- ACTION BUTTONS (Right Thumb Cluster) --- */}

      {/* 1. SHOOT TRIGGER BUTTON */}
      <button
        onTouchStart={(e) => {
          e.stopPropagation();
          isFiringRef.current = true;
          onFireStart();
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          isFiringRef.current = false;
          onFireEnd();
        }}
        onMouseDown={() => onFireStart()}
        onMouseUp={() => onFireEnd()}
        className="absolute rounded-full bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] border-2 border-red-300 active:scale-95 transition-transform flex items-center justify-center cursor-pointer select-none"
        style={{
          left: `${layout.fireButton.x}%`,
          top: `${layout.fireButton.y}%`,
          width: `${layout.fireButton.size}px`,
          height: `${layout.fireButton.size}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Crosshair className="w-8 h-8 pointer-events-none drop-shadow" />
      </button>

      {/* 2. AIM (ADS) BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleAim();
        }}
        className={`absolute rounded-full border-2 transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none ${
          isAiming
            ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
            : 'bg-slate-900/80 border-slate-600 text-slate-200'
        }`}
        style={{
          left: `${layout.aimButton.x}%`,
          top: `${layout.aimButton.y}%`,
          width: `${layout.aimButton.size}px`,
          height: `${layout.aimButton.size}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <span className="text-xs font-display font-black tracking-wider pointer-events-none">ADS</span>
      </button>

      {/* 3. RELOAD BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReload();
        }}
        className="absolute rounded-full bg-slate-900/80 border border-slate-600 text-slate-200 active:scale-95 transition-transform flex items-center justify-center cursor-pointer select-none shadow-lg"
        style={{
          left: `${layout.reloadButton.x}%`,
          top: `${layout.reloadButton.y}%`,
          width: `${layout.reloadButton.size}px`,
          height: `${layout.reloadButton.size}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <RotateCw className="w-5 h-5 pointer-events-none" />
      </button>

      {/* 4. JUMP BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onJump();
        }}
        className="absolute rounded-full bg-slate-900/80 border border-slate-600 text-slate-200 active:scale-95 transition-transform flex items-center justify-center cursor-pointer select-none shadow-lg"
        style={{
          left: `${layout.jumpButton.x}%`,
          top: `${layout.jumpButton.y}%`,
          width: `${layout.jumpButton.size}px`,
          height: `${layout.jumpButton.size}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <ArrowUp className="w-6 h-6 pointer-events-none" />
      </button>

      {/* 5. CROUCH BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleCrouch();
        }}
        className={`absolute rounded-full border transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none shadow-lg ${
          isCrouching
            ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-bold'
            : 'bg-slate-900/80 border-slate-600 text-slate-200'
        }`}
        style={{
          left: `${layout.crouchButton.x}%`,
          top: `${layout.crouchButton.y}%`,
          width: `${layout.crouchButton.size}px`,
          height: `${layout.crouchButton.size}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <ArrowDown className="w-5 h-5 pointer-events-none" />
      </button>

      {/* 6. GRENADE QUICK THROW BUTTON */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onThrowGrenade();
        }}
        className="absolute rounded-full bg-amber-700/80 border border-amber-400 text-white active:scale-95 transition-transform flex items-center justify-center cursor-pointer select-none shadow-lg"
        style={{
          left: `${layout.grenadeButton.x}%`,
          top: `${layout.grenadeButton.y}%`,
          width: `${layout.grenadeButton.size}px`,
          height: `${layout.grenadeButton.size}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Bomb className="w-5 h-5 pointer-events-none" />
      </button>

      {/* 7. INTERACT / LOOT SUPPLY BUTTON (shown when in range) */}
      {canInteract && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInteract();
          }}
          className="absolute rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white border border-emerald-300 px-4 py-2 shadow-xl flex items-center gap-2 animate-bounce cursor-pointer"
          style={{
            left: `${layout.interactButton.x}%`,
            top: `${layout.interactButton.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Hand className="w-4 h-4" />
          <span className="text-xs font-display font-bold uppercase tracking-wider">RESUPPLY [F]</span>
        </button>
      )}
    </div>
  );
};
