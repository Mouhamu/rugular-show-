import React, { useState } from 'react';
import { GameSettings } from '../types';
import { soundManager } from '../audio/soundManager';
import { Settings, Sliders, Volume2, Monitor, X, Check, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onSaveSettings: (newSettings: GameSettings) => void;
  onOpenControlsEditor: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings: initialSettings,
  onSaveSettings,
  onOpenControlsEditor,
  onClose
}) => {
  const [settings, setSettings] = useState<GameSettings>({ ...initialSettings });
  const [activeTab, setActiveTab] = useState<'GRAPHICS' | 'AUDIO' | 'CONTROLS'>('GRAPHICS');

  const handleSave = () => {
    soundManager.setVolumes(settings.masterVolume, settings.sfxVolume, settings.musicVolume);
    onSaveSettings(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-950 border border-white/10 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-wider">TACTICAL SETTINGS</h2>
              <p className="text-xs font-mono text-slate-400">Optimize for low & mid-range mobile performance</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab('GRAPHICS')}
            className={`flex-1 py-2 rounded-lg text-xs font-display font-bold transition-all ${
              activeTab === 'GRAPHICS' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            GRAPHICS & FPS
          </button>
          <button
            onClick={() => setActiveTab('AUDIO')}
            className={`flex-1 py-2 rounded-lg text-xs font-display font-bold transition-all ${
              activeTab === 'AUDIO' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            AUDIO ENGINE
          </button>
          <button
            onClick={() => setActiveTab('CONTROLS')}
            className={`flex-1 py-2 rounded-lg text-xs font-display font-bold transition-all ${
              activeTab === 'CONTROLS' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            TOUCH CONTROLS
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'GRAPHICS' && (
          <div className="flex flex-col gap-5">
            {/* Graphics Preset */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Graphics Quality:</span>
              <div className="grid grid-cols-3 gap-3">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => setSettings({ ...settings, graphicsQuality: q })}
                    className={`py-3 rounded-2xl border text-xs font-display font-bold tracking-wider transition-all ${
                      settings.graphicsQuality === q
                        ? 'border-cyan-400 bg-cyan-500/20 text-white'
                        : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {settings.graphicsQuality === 'LOW' && 'Low: Optimized for older Android phones with fast loading and no shadow overhead.'}
                {settings.graphicsQuality === 'MEDIUM' && 'Medium: Balanced for typical mid-range phones. Smooth 60 FPS with soft shading.'}
                {settings.graphicsQuality === 'HIGH' && 'High: Crisp full resolution and dynamic shadows.'}
              </p>
            </div>

            {/* Target FPS */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Frame Rate Target:</span>
              <div className="grid grid-cols-2 gap-3">
                {([30, 60] as const).map(fps => (
                  <button
                    key={fps}
                    onClick={() => setSettings({ ...settings, targetFps: fps })}
                    className={`py-3 rounded-2xl border text-xs font-display font-bold tracking-wider transition-all ${
                      settings.targetFps === fps
                        ? 'border-cyan-400 bg-cyan-500/20 text-white'
                        : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fps} FPS {fps === 30 ? '(Battery Saver)' : '(Ultra Smooth)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Shadows Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-xs font-display font-bold text-white block">Dynamic Shadows</span>
                <span className="text-[11px] text-slate-400">Cast real-time character and building shadows</span>
              </div>
              <input
                type="checkbox"
                checked={settings.dynamicShadows}
                onChange={(e) => setSettings({ ...settings, dynamicShadows: e.target.checked })}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'AUDIO' && (
          <div className="flex flex-col gap-5">
            {/* Master Volume */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">MASTER VOLUME</span>
                <span className="text-white font-bold">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => setSettings({ ...settings, masterVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* SFX Volume */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">SOUND EFFECTS (GUNSHOTS & HITS)</span>
                <span className="text-white font-bold">{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => setSettings({ ...settings, sfxVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Music Volume */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">TACTICAL AMBIENCE & MUSIC</span>
                <span className="text-white font-bold">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => setSettings({ ...settings, musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {activeTab === 'CONTROLS' && (
          <div className="flex flex-col gap-5">
            {/* Look Sensitivity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">LOOK SENSITIVITY</span>
                <span className="text-white font-bold">{settings.lookSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={settings.lookSensitivity}
                onChange={(e) => setSettings({ ...settings, lookSensitivity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* ADS Sensitivity Multiplier */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">AIM DOWN SIGHTS (ADS) MULTIPLIER</span>
                <span className="text-white font-bold">{(settings.adsSensitivityMultiplier * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={settings.adsSensitivityMultiplier}
                onChange={(e) => setSettings({ ...settings, adsSensitivityMultiplier: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Invert Y */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-xs font-display font-bold text-white block">Invert Vertical Look (Y-Axis)</span>
                <span className="text-[11px] text-slate-400">Aircraft-style camera controls</span>
              </div>
              <input
                type="checkbox"
                checked={settings.invertY}
                onChange={(e) => setSettings({ ...settings, invertY: e.target.checked })}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Launch Layout Editor */}
            <button
              onClick={() => {
                onOpenControlsEditor();
                onClose();
              }}
              className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-display font-bold text-cyan-400 border border-cyan-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>LAUNCH HUD TOUCH BUTTONS CUSTOMIZER</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-display font-bold tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>APPLY SETTINGS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
