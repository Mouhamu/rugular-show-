import React, { useState } from 'react';
import { GameSettings, GraphicsPreset } from '../types';
import { didyAudio } from '../audio/didyAudio';
import { getTranslations, SupportedLanguage } from '../i18n/translations';
import { Settings, Sliders, Volume2, Monitor, Smartphone, Check, X, Battery, Globe } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onSaveSettings: (newSettings: GameSettings) => void;
  onOpenControlsCustomizer: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings: initialSettings,
  onSaveSettings,
  onOpenControlsCustomizer,
  onClose
}) => {
  const [settings, setSettings] = useState<GameSettings>({ ...initialSettings });
  const [activeTab, setActiveTab] = useState<'LANGUAGE' | 'GRAPHICS' | 'CONTROLS' | 'AUDIO' | 'GAMEPLAY'>('LANGUAGE');

  const t = getTranslations(settings.language);
  const isRtl = settings.language === 'ar';

  const handleSave = () => {
    didyAudio.playButtonClick();
    didyAudio.setVolumes(
      settings.masterVolume,
      settings.musicVolume,
      settings.sfxVolume,
      settings.voiceVolume,
      settings.isMuted
    );
    onSaveSettings(settings);
    onClose();
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans"
    >
      <div className="bg-[#0b1320] border-2 border-white/15 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-2xl font-display font-black text-white tracking-wider">
                {t.settingsTitle}
              </h2>
              <p className="text-xs font-mono text-cyan-300">
                {isRtl ? 'ضبط الأداء، أسلوب التحكم، اللغة والخلط الصوتي' : 'Android performance, touch calibration, and audio mixing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-white/10 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('LANGUAGE')}
            className={`flex-1 min-w-[75px] py-2 text-xs font-display font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'LANGUAGE' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            {t.tabLanguage}
          </button>
          <button
            onClick={() => setActiveTab('GRAPHICS')}
            className={`flex-1 min-w-[75px] py-2 text-xs font-display font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'GRAPHICS' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.tabGraphics}
          </button>
          <button
            onClick={() => setActiveTab('CONTROLS')}
            className={`flex-1 min-w-[75px] py-2 text-xs font-display font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'CONTROLS' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.tabControls}
          </button>
          <button
            onClick={() => setActiveTab('AUDIO')}
            className={`flex-1 min-w-[75px] py-2 text-xs font-display font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'AUDIO' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.tabAudio}
          </button>
          <button
            onClick={() => setActiveTab('GAMEPLAY')}
            className={`flex-1 min-w-[75px] py-2 text-xs font-display font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'GAMEPLAY' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            {isRtl ? 'اللعب' : 'GAMEPLAY'}
          </button>
        </div>

        {/* Tab 0: Language */}
        {activeTab === 'LANGUAGE' && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">{t.selectLanguage}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {/* Arabic */}
                <button
                  onClick={() => {
                    didyAudio.playButtonClick();
                    setSettings({ ...settings, language: 'ar' });
                  }}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                    settings.language === 'ar'
                      ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'border-white/10 bg-slate-900/60 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🇸🇦</span>
                    <div className="text-right">
                      <h4 className="text-base font-display font-bold text-white">العربية (Arabic)</h4>
                      <p className="text-xs text-cyan-300 font-mono">واجهة عربية متكاملة لجميع القوائم والأزرار</p>
                    </div>
                  </div>
                  {settings.language === 'ar' && (
                    <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold">
                      ✓
                    </div>
                  )}
                </button>

                {/* English */}
                <button
                  onClick={() => {
                    didyAudio.playButtonClick();
                    setSettings({ ...settings, language: 'en' });
                  }}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                    settings.language === 'en'
                      ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                      : 'border-white/10 bg-slate-900/60 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🇺🇸</span>
                    <div className="text-left">
                      <h4 className="text-base font-display font-bold text-white">English (US)</h4>
                      <p className="text-xs text-slate-400 font-mono">Full English menus, characters & HUD</p>
                    </div>
                  </div>
                  {settings.language === 'en' && (
                    <div className="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold">
                      ✓
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 flex items-center gap-3">
              <Globe className="w-6 h-6 text-cyan-400 shrink-0" />
              <p className="text-xs font-mono text-cyan-200">
                {isRtl
                  ? 'يتم تطبيق اللغة فوراً على القوائم الرئيسية، الشخصيات، المتجر، إعدادات البلوتوث، وأزرار التحكم أثناء اللعب.'
                  : 'Language applies immediately to the main menu, characters, shop, Bluetooth lobby, and in-game HUD.'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 1: Graphics */}
        {activeTab === 'GRAPHICS' && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Graphics Quality Preset:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1.5">
                {(['LOW', 'MEDIUM', 'HIGH', 'ULTRA', 'BATTERY_SAVER'] as GraphicsPreset[]).map(preset => (
                  <button
                    key={preset}
                    onClick={() => setSettings({ ...settings, graphicsPreset: preset })}
                    className={`py-2.5 px-2 rounded-xl text-[11px] font-display font-black border transition-all ${
                      settings.graphicsPreset === preset
                        ? 'border-cyan-400 bg-cyan-500/20 text-white'
                        : 'border-white/10 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    {preset === 'BATTERY_SAVER' ? 'BATTERY' : preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Target Frame Rate:</span>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                {[30, 60].map(fps => (
                  <button
                    key={fps}
                    onClick={() => setSettings({ ...settings, targetFps: fps as 30 | 60 })}
                    className={`py-3 rounded-2xl border text-xs font-display font-black ${
                      settings.targetFps === fps
                        ? 'border-cyan-400 bg-cyan-500/20 text-white'
                        : 'border-white/10 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    {fps} FPS {fps === 60 ? '🔥 (Ultra Smooth)' : '🔋 (Battery Saver)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-xs font-display font-bold text-white block">Dynamic Real-Time Shadows</span>
                <span className="text-[11px] text-slate-400">Soft lighting under trees and characters</span>
              </div>
              <input
                type="checkbox"
                checked={settings.shadowsEnabled}
                onChange={(e) => setSettings({ ...settings, shadowsEnabled: e.target.checked })}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Controls */}
        {activeTab === 'CONTROLS' && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs font-mono text-slate-400 uppercase">Movement Control Scheme:</span>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {[
                  { id: 'DYNAMIC_JOYSTICK', title: 'FLOATING JOYSTICK', desc: 'Appears wherever thumb touches' },
                  { id: 'FIXED_JOYSTICK', title: 'FIXED JOYSTICK', desc: 'Anchored at bottom-left corner' },
                  { id: 'SWIPE_PAD', title: 'SWIPE TOUCH PAD', desc: 'Swipe left/right/up/down directly' },
                  { id: 'DPAD_BUTTONS', title: 'D-PAD BUTTONS', desc: 'Tactile 4-way direction buttons' }
                ].map(sch => (
                  <button
                    key={sch.id}
                    onClick={() => setSettings({
                      ...settings,
                      controls: { ...settings.controls, controlScheme: sch.id as any }
                    })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      (settings.controls.controlScheme || 'DYNAMIC_JOYSTICK') === sch.id
                        ? 'border-cyan-400 bg-cyan-500/20 text-white'
                        : 'border-white/10 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-display font-black block">{sch.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">{sch.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">JOYSTICK / SWIPE SENSITIVITY</span>
                <span className="text-white font-bold">{settings.controls.joystickSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.controls.joystickSensitivity}
                onChange={(e) => setSettings({
                  ...settings,
                  controls: { ...settings.controls, joystickSensitivity: parseFloat(e.target.value) }
                })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">CAMERA LOOK SENSITIVITY</span>
                <span className="text-white font-bold">{settings.controls.cameraSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={settings.controls.cameraSensitivity}
                onChange={(e) => setSettings({
                  ...settings,
                  controls: { ...settings.controls, cameraSensitivity: parseFloat(e.target.value) }
                })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-xs font-display font-bold text-white block">Auto-Run when dragging far</span>
                <span className="text-[10px] text-slate-400">Automatically sprints when pushing past edge</span>
              </div>
              <input
                type="checkbox"
                checked={settings.controls.autoRun}
                onChange={(e) => setSettings({
                  ...settings,
                  controls: { ...settings.controls, autoRun: e.target.checked }
                })}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            <button
              onClick={() => {
                onOpenControlsCustomizer();
                onClose();
              }}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-display font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <Smartphone className="w-4 h-4" />
              <span>CUSTOMIZE BUTTON POSITIONS & SIZES</span>
            </button>
          </div>
        )}

        {/* Tab 3: Audio */}
        {activeTab === 'AUDIO' && (
          <div className="flex flex-col gap-4">
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

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">MUSIC VOLUME (HELLBLADE SOUNDTRACK)</span>
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

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">CARTOON SFX & VOICES</span>
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
          </div>
        )}

        {/* Tab 4: Gameplay */}
        {activeTab === 'GAMEPLAY' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-xs font-display font-bold text-white block">Auto-Run / Sprint Lock</span>
                <span className="text-[11px] text-slate-400">Automatically sprint when pushing joystick forward</span>
              </div>
              <input
                type="checkbox"
                checked={settings.controls.autoRun}
                onChange={(e) => setSettings({
                  ...settings,
                  controls: { ...settings.controls, autoRun: e.target.checked }
                })}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-xs font-display font-bold text-white block">Haptic Touch Vibration</span>
                <span className="text-[11px] text-slate-400">Vibrate on jump pad bounce and DIDY medal pickups</span>
              </div>
              <input
                type="checkbox"
                checked={settings.controls.vibration}
                onChange={(e) => setSettings({
                  ...settings,
                  controls: { ...settings.controls, vibration: e.target.checked }
                })}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-3">
          <button onClick={onClose} className="px-5 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer">
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-xs font-display font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            {isRtl ? 'تطبيق وحفظ الإعدادات' : 'APPLY SETTINGS'}
          </button>
        </div>
      </div>
    </div>
  );
};
