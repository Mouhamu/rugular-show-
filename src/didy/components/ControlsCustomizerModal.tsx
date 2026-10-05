import React, { useState } from 'react';
import { ControlLayout } from '../types';
import { DEFAULT_CONTROLS } from '../data/defaultSettings';
import { didyAudio } from '../audio/didyAudio';
import { Move, Check, RotateCcw, X, Sliders } from 'lucide-react';

interface ControlsCustomizerModalProps {
  layout: ControlLayout;
  onSave: (newLayout: ControlLayout) => void;
  onClose: () => void;
}

export const ControlsCustomizerModal: React.FC<ControlsCustomizerModalProps> = ({
  layout: initialLayout,
  onSave,
  onClose
}) => {
  const [layout, setLayout] = useState<ControlLayout>({ ...initialLayout });
  const [selectedKey, setSelectedKey] = useState<keyof ControlLayout['buttonPositions']>('jump');

  const handleDrag = (key: keyof ControlLayout['buttonPositions'], e: React.MouseEvent | React.TouchEvent) => {
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

    setLayout(prev => ({
      ...prev,
      buttonPositions: {
        ...prev.buttonPositions,
        [key]: {
          x: Math.max(10, Math.min(95, pctX)),
          y: Math.max(15, Math.min(90, pctY))
        }
      }
    }));
  };

  const handleReset = () => {
    didyAudio.playButtonClick();
    setLayout({ ...DEFAULT_CONTROLS });
  };

  const handleSave = () => {
    didyAudio.playButtonClick();
    onSave(layout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between p-4 select-none font-sans">
      {/* Top Banner Toolbar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-white/10 px-5 py-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <Move className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-base font-display font-black text-white tracking-wider">
              TOUCH HUD LAYOUT EDITOR
            </h2>
            <p className="text-[11px] text-slate-400">
              Drag buttons anywhere on your screen · Adjust size & transparency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-white/5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-lg transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" /> Save HUD
          </button>
        </div>
      </div>

      {/* Interactive Visual Canvas */}
      <div className="relative flex-1 my-3 border border-dashed border-cyan-500/30 rounded-3xl overflow-hidden bg-slate-950/40">
        {/* Joystick Ghost */}
        <div
          className="absolute rounded-full border-2 border-dashed border-cyan-400/40 bg-slate-900/30 flex items-center justify-center pointer-events-none"
          style={{
            left: '12%',
            top: '72%',
            width: `${layout.joystickSize}px`,
            height: `${layout.joystickSize}px`,
            transform: 'translate(-50%, -50%)',
            opacity: layout.joystickOpacity
          }}
        >
          <span className="text-[10px] font-mono text-cyan-300">JOYSTICK</span>
        </div>

        {/* Action Buttons */}
        {(Object.keys(layout.buttonPositions) as Array<keyof ControlLayout['buttonPositions']>).map(key => {
          const pos = layout.buttonPositions[key];
          const isSelected = selectedKey === key;

          return (
            <div
              key={key}
              onClick={() => setSelectedKey(key)}
              onTouchMove={(e) => handleDrag(key, e)}
              className={`absolute rounded-full flex items-center justify-center cursor-move text-xs font-display font-black transition-all shadow-xl select-none ${
                isSelected
                  ? 'border-2 border-cyan-400 bg-cyan-500/40 text-white scale-105 ring-4 ring-cyan-500/20'
                  : 'border border-white/20 bg-slate-850/80 text-slate-200'
              }`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${layout.buttonSize}px`,
                height: `${layout.buttonSize}px`,
                transform: 'translate(-50%, -50%)',
                opacity: layout.buttonOpacity
              }}
            >
              {key.toUpperCase()}
            </div>
          );
        })}
      </div>

      {/* Bottom Tuning Bar (Scale & Transparency) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-white/10 px-5 py-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 uppercase">Button Size:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLayout(prev => ({ ...prev, buttonSize: Math.max(45, prev.buttonSize - 6) }))}
              className="px-2.5 py-1 text-xs bg-slate-800 text-white rounded"
            >
              -
            </button>
            <span className="text-xs font-mono text-cyan-400 px-2">{layout.buttonSize}px</span>
            <button
              onClick={() => setLayout(prev => ({ ...prev, buttonSize: Math.min(85, prev.buttonSize + 6) }))}
              className="px-2.5 py-1 text-xs bg-slate-800 text-white rounded"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 uppercase">Button Transparency:</span>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.05"
            value={layout.buttonOpacity}
            onChange={(e) => setLayout({ ...layout, buttonOpacity: parseFloat(e.target.value) })}
            className="w-28 accent-cyan-400 cursor-pointer"
          />
          <span className="text-xs font-mono text-cyan-400">{Math.round(layout.buttonOpacity * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
