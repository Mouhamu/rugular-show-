import React, { useState } from 'react';
import { TouchControlLayout, GameSettings } from '../types';
import { DEFAULT_CONTROLS } from '../data/gameData';
import { Check, RotateCcw, Sliders, Move } from 'lucide-react';

interface ControlsCustomizerProps {
  layout: TouchControlLayout;
  settings: GameSettings;
  onSave: (newLayout: TouchControlLayout, newSettings: GameSettings) => void;
  onClose: () => void;
}

export const ControlsCustomizer: React.FC<ControlsCustomizerProps> = ({
  layout: initialLayout,
  settings: initialSettings,
  onSave,
  onClose
}) => {
  const [currentLayout, setCurrentLayout] = useState<TouchControlLayout>({ ...initialLayout });
  const [currentSettings, setCurrentSettings] = useState<GameSettings>({ ...initialSettings });
  const [activeButtonKey, setActiveButtonKey] = useState<keyof TouchControlLayout>('fireButton');

  const handleDrag = (key: keyof TouchControlLayout, e: React.MouseEvent | React.TouchEvent) => {
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const pctX = Math.round((clientX / window.innerWidth) * 100);
    const pctY = Math.round((clientY / window.innerHeight) * 100);

    setCurrentLayout(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        x: Math.max(5, Math.min(95, pctX)),
        y: Math.max(10, Math.min(90, pctY))
      }
    }));
  };

  const handleSizeChange = (delta: number) => {
    const item = currentLayout[activeButtonKey];
    const newSize = Math.max(38, Math.min(100, item.size + delta));
    setCurrentLayout(prev => ({
      ...prev,
      [activeButtonKey]: {
        ...item,
        size: newSize
      }
    }));
  };

  const handleReset = () => {
    setCurrentLayout({ ...DEFAULT_CONTROLS });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 select-none">
      {/* Top Banner Toolbar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 px-5 py-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <Move className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-display font-bold text-white tracking-wider">HUD CONTROL LAYOUT EDITOR</h2>
            <p className="text-[11px] text-slate-400">Drag any button to position it on your mobile screen</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={() => {
              onSave(currentLayout, currentSettings);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-lg transition-colors"
          >
            <Check className="w-4 h-4" /> Save Layout
          </button>
        </div>
      </div>

      {/* Interactive Drag Canvas */}
      <div className="relative flex-1 my-3 border border-dashed border-cyan-500/30 rounded-2xl overflow-hidden bg-slate-950/40">
        {/* Buttons to drag */}
        {(Object.keys(currentLayout) as Array<keyof TouchControlLayout>).map(key => {
          const btn = currentLayout[key];
          const isSelected = activeButtonKey === key;

          return (
            <div
              key={key}
              onClick={() => setActiveButtonKey(key)}
              onTouchMove={(e) => handleDrag(key, e)}
              className={`absolute rounded-full flex items-center justify-center cursor-move text-xs font-mono font-bold transition-all shadow-xl ${
                isSelected
                  ? 'border-2 border-cyan-400 bg-cyan-500/30 text-white scale-105 ring-4 ring-cyan-500/20'
                  : 'border border-white/20 bg-slate-800/80 text-slate-300'
              }`}
              style={{
                left: `${btn.x}%`,
                top: `${btn.y}%`,
                width: `${btn.size}px`,
                height: `${btn.size}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {key === 'fireButton' ? 'FIRE' : key === 'aimButton' ? 'ADS' : key === 'reloadButton' ? 'RLD' : key === 'jumpButton' ? 'JMP' : key === 'crouchButton' ? 'CRCH' : key === 'grenadeButton' ? 'GREN' : key === 'weaponSwitch' ? 'WEAP' : 'USE'}
            </div>
          );
        })}
      </div>

      {/* Bottom Tuning Bar (Scale & Sensitivity) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-white/10 px-5 py-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 uppercase">Selected:</span>
          <span className="text-xs font-display font-bold text-cyan-400 uppercase">{activeButtonKey}</span>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => handleSizeChange(-6)}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded border border-white/10"
            >
              Smaller -
            </button>
            <span className="text-xs font-mono text-slate-300 px-2 tabular-nums">
              {currentLayout[activeButtonKey].size}px
            </span>
            <button
              onClick={() => handleSizeChange(6)}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded border border-white/10"
            >
              Larger +
            </button>
          </div>
        </div>

        {/* Sensitivity Quick Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Look Sensitivity:</span>
          <input
            type="range"
            min="0.3"
            max="2.0"
            step="0.1"
            value={currentSettings.lookSensitivity}
            onChange={(e) => setCurrentSettings({ ...currentSettings, lookSensitivity: parseFloat(e.target.value) })}
            className="w-28 accent-cyan-400 cursor-pointer"
          />
          <span className="text-xs font-mono text-cyan-400 w-8 tabular-nums">
            {currentSettings.lookSensitivity.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
};
