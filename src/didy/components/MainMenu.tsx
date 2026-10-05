import React, { useState } from 'react';
import { PlayerProfile, GameMode } from '../types';
import { REGULAR_SHOW_CHARACTERS } from '../data/characters';
import { ANIMAL_COMPANIONS } from '../data/pets';
import { didyAudio } from '../audio/didyAudio';
import { getTranslations, SupportedLanguage, CHARACTER_AR_NAMES, PET_AR_NAMES } from '../i18n/translations';
import {
  Play,
  Users,
  Trophy,
  Sparkles,
  Settings,
  User,
  ShoppingBag,
  HelpCircle,
  Volume2,
  VolumeX,
  Plane,
  Flame,
  Award,
  Bluetooth,
  Radio,
  Globe
} from 'lucide-react';

interface MainMenuProps {
  profile: PlayerProfile;
  language: SupportedLanguage;
  onToggleLanguage: () => void;
  onStartGame: (mode: GameMode) => void;
  onOpenBluetooth: () => void;
  onOpenCharacters: () => void;
  onOpenPets: () => void;
  onOpenProfile: () => void;
  onOpenShop: () => void;
  onOpenSettings: () => void;
  onOpenAssistant: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  language,
  onToggleLanguage,
  onStartGame,
  onOpenBluetooth,
  onOpenCharacters,
  onOpenPets,
  onOpenProfile,
  onOpenShop,
  onOpenSettings,
  onOpenAssistant
}) => {
  const [showModeSelect, setShowModeSelect] = useState(false);
  const t = getTranslations(language);

  const selectedChar = REGULAR_SHOW_CHARACTERS.find(c => c.id === profile.selectedCharacterId) || REGULAR_SHOW_CHARACTERS[0];
  const selectedPet = ANIMAL_COMPANIONS.find(p => p.id === profile.selectedPetId) || ANIMAL_COMPANIONS[0];

  const charAr = CHARACTER_AR_NAMES[selectedChar.id];
  const petAr = PET_AR_NAMES[selectedPet.id];

  const charDisplayName = language === 'ar' && charAr ? charAr.name : selectedChar.name;
  const charDisplaySpecies = language === 'ar' && charAr ? charAr.title : selectedChar.species;
  const charDisplayQuote = language === 'ar' && charAr ? charAr.quote : selectedChar.catchphrase;

  const petDisplayName = language === 'ar' && petAr ? petAr.name : selectedPet.name;
  const petDisplaySpecies = language === 'ar' && petAr ? petAr.type : selectedPet.species;

  const isRtl = language === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`relative w-full h-full min-h-screen bg-[#0b1320] text-slate-100 flex flex-col justify-between p-4 md:p-8 select-none overflow-hidden ${
        isRtl ? 'font-sans' : 'font-sans'
      }`}
    >
      {/* Background Graphic Artwork */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/src/assets/images/didy_cup_banner_1791196853387.jpg"
          alt="DIDY CUP Cartoon Park Banner"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-40 scale-105 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1320] via-[#0b1320]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1320] via-transparent to-[#0b1320]" />
      </div>

      {/* Top Header: Brand Wordmark & Player Dossier */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/15 pb-4 gap-2">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/images/didy_cup_icon_1791196865620.jpg"
            alt="DIDY CUP Trophy"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl shadow-xl border-2 border-amber-400/50 object-cover transform hover:rotate-6 transition-transform"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 drop-shadow-md">
                {t.appName}
              </h1>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase">
                {isRtl ? 'كرتون 3D' : '3D CARTOON OPS'}
              </span>
            </div>
            <p className="text-xs font-mono text-cyan-300">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Player Profile & Quick Controls Header */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Arabic / English Language Toggle */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              onToggleLanguage();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 hover:brightness-125 border border-cyan-400/50 text-cyan-300 rounded-2xl shadow-lg transition-all cursor-pointer font-bold text-xs"
            title="تبديل اللغة / Switch Language"
          >
            <Globe className="w-4 h-4 text-cyan-300 animate-spin-slow" />
            <span>{t.toggleLangBtn}</span>
          </button>

          {/* Trophy Count Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/60 border border-amber-500/40 rounded-2xl shadow-lg">
            <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-display font-black text-amber-300 tabular-nums">
              {profile.didyCupTrophies} {isRtl ? 'كؤوس' : 'CUPS'}
            </span>
          </div>

          {/* User Profile Capsule displaying "Mouha muh" */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              onOpenProfile();
            }}
            className="flex items-center gap-2.5 bg-slate-900/85 hover:bg-slate-800 border border-white/15 px-3.5 py-1.5 rounded-2xl shadow-xl transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-display font-black text-cyan-300 text-sm">
              <User className="w-4 h-4" />
            </div>
            <div className={`hidden sm:block ${isRtl ? 'text-right' : 'text-left'}`}>
              <span className="text-xs font-display font-bold text-white block leading-tight">
                {profile.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {profile.wins} {isRtl ? 'فوز' : 'Wins'} · {profile.coins} {isRtl ? 'عملة' : 'Coins'}
              </span>
            </div>
          </button>

          {/* AI Guide Assistant */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              onOpenAssistant();
            }}
            className="p-2.5 rounded-2xl bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-400/40 text-indigo-300 transition-colors cursor-pointer"
            title={isRtl ? 'مساعد الحديقة الذكي' : "Eileen's AI Park Assistant"}
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              onOpenSettings();
            }}
            className="p-2.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={t.settings}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Center Screen: Character Preview & Primary Actions */}
      <main className="relative z-10 my-auto max-w-4xl w-full mx-auto flex flex-col gap-6 py-4">
        {/* Character & Pet Status Badge */}
        <div className="flex items-center justify-between bg-slate-900/70 border border-white/10 p-3.5 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-display font-black text-white text-base shadow-md"
              style={{ backgroundColor: selectedChar.color, borderColor: selectedChar.accentColor }}
            >
              {charDisplayName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-display font-bold text-white">{charDisplayName}</span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  {charDisplaySpecies}
                </span>
              </div>
              <p className="text-xs text-slate-400 italic">"{charDisplayQuote}"</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/5">
            <span>{isRtl ? 'الرفيق:' : 'Pet:'}</span>
            <span className="font-bold text-amber-300">{petDisplayName} ({petDisplaySpecies})</span>
          </div>
        </div>

        {/* Primary Action Buttons: PLAY & BLUETOOTH */}
        {!showModeSelect ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => {
                didyAudio.playButtonClick();
                setShowModeSelect(true);
              }}
              className="md:col-span-2 group relative p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 transition-all duration-200 shadow-[0_0_40px_rgba(245,158,11,0.4)] flex items-center justify-between cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-950/15 flex items-center justify-center">
                  <Play className="w-9 h-9 fill-slate-950" />
                </div>
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-900/80 block">
                    {isRtl ? 'الإنزال الجوي ومباريات الحديقة' : 'AIR-DROP & CHAOS MATCHES'}
                  </span>
                  <h2 className="text-2xl md:text-4xl font-display font-black tracking-wide text-slate-950">
                    {t.play}
                  </h2>
                </div>
              </div>

              <Trophy className="w-10 h-10 text-slate-950/80 group-hover:scale-110 transition-transform" />
            </button>

            {/* Dedicated BLUETOOTH Menu Option */}
            <button
              onClick={() => {
                didyAudio.playButtonClick();
                onOpenBluetooth();
              }}
              className="group relative p-6 rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 hover:brightness-110 text-white transition-all duration-200 shadow-[0_0_30px_rgba(6,182,212,0.35)] flex flex-col justify-between cursor-pointer active:scale-[0.99] border border-cyan-400/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-200 bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-400/40">
                  {isRtl ? 'لعب محلي بدون نت' : 'OFFLINE MULTIPLAYER'}
                </span>
                <Bluetooth className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>
              <div className={`mt-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                <h3 className="text-2xl font-display font-black tracking-wide text-white">
                  {t.bluetooth}
                </h3>
                <p className="text-[11px] text-cyan-100 font-mono mt-0.5">
                  {isRtl ? 'اتصل بهواتف أصدقائك القريبة مباشرة بالبلوتوث' : 'Connect nearby Android phones directly without internet'}
                </p>
              </div>
            </button>
          </div>
        ) : (
          /* Game Mode Select Card */
          <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-cyan-400/50 backdrop-blur-lg flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">{t.chooseMode}</span>
                <h3 className="text-xl font-display font-black text-white">{isRtl ? 'اختر وضع المنافسة' : 'CHOOSE YOUR MATCH'}</h3>
              </div>
              <button
                onClick={() => setShowModeSelect(false)}
                className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg cursor-pointer"
              >
                {t.back}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Drop Mode 2/2 */}
              <button
                onClick={() => {
                  didyAudio.playButtonClick();
                  onStartGame('DROP_2V2');
                }}
                className={`p-4 rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-400/40 hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between h-36 ${
                  isRtl ? 'text-right' : 'text-left'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase bg-blue-950 px-2 py-0.5 rounded">
                    2/2
                  </span>
                  <Plane className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-base font-display font-black text-white">{t.modeDrop2v2}</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">{t.modeDrop2v2Desc}</p>
                </div>
              </button>

              {/* Drop Mode 4/4 */}
              <button
                onClick={() => {
                  didyAudio.playButtonClick();
                  onStartGame('DROP_4V4');
                }}
                className={`p-4 rounded-2xl bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-400/40 hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between h-36 ${
                  isRtl ? 'text-right' : 'text-left'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase bg-amber-950 px-2 py-0.5 rounded">
                    4/4
                  </span>
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-base font-display font-black text-white">{t.modeDrop4v4}</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">{t.modeDrop4v4Desc}</p>
                </div>
              </button>

              {/* Bluetooth Multiplayer Option in Mode Select */}
              <button
                onClick={() => {
                  didyAudio.playButtonClick();
                  onOpenBluetooth();
                }}
                className={`p-4 rounded-2xl bg-gradient-to-br from-cyan-900/50 to-slate-900 border border-cyan-400/60 hover:border-cyan-400 transition-all cursor-pointer flex flex-col justify-between h-36 ${
                  isRtl ? 'text-right' : 'text-left'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase bg-cyan-950 px-2 py-0.5 rounded">
                    {isRtl ? 'بلوتوث' : 'BLUETOOTH'}
                  </span>
                  <Bluetooth className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <h4 className="text-base font-display font-black text-white">{t.modeBt2v2}</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">{t.modeBt2v2Desc}</p>
                </div>
              </button>

              {/* Free Park Explore */}
              <button
                onClick={() => {
                  didyAudio.playButtonClick();
                  onStartGame('SOLO_PARK');
                }}
                className={`p-4 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-400/40 hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between h-36 ${
                  isRtl ? 'text-right' : 'text-left'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase bg-emerald-950 px-2 py-0.5 rounded">
                    {isRtl ? 'تدريب' : 'PRACTICE'}
                  </span>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-base font-display font-black text-white">{t.modeSoloPark}</h4>
                  <p className="text-[10px] text-slate-300 mt-0.5">{t.modeSoloParkDesc}</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Grid: Characters, Pets, Bluetooth, Profile, Shop, Settings */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {/* Characters */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              onOpenCharacters();
            }}
            className={`p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between cursor-pointer ${
              isRtl ? 'text-right' : 'text-left'
            }`}
          >
            <Users className="w-5 h-5 text-cyan-400 mb-2" />
            <div>
              <span className="text-xs font-display font-black text-white block">{t.characters}</span>
              <span className="text-[10px] font-mono text-slate-400">{isRtl ? 'مورديكاي، ريغبي...' : 'Mordecai, Rigby...'}</span>
            </div>
          </button>

          {/* Pets */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              onOpenPets();
            }}
            className={`p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between cursor-pointer ${
              isRtl ? 'text-right' : 'text-left'
            }`}
          >
            <Sparkles className="w-5 h-5 text-emerald-400 mb-2" />
            <div>
              <span className="text-xs font-display font-black text-white block">{t.pets}</span>
              <span className="text-[10px] font-mono text-slate-400">{isRtl ? 'كلب، قط، ثعلب...' : 'Dog, Cat, Fox...'}</span>
            </div>
          </button>

          {/* Bluetooth Lobby */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              onOpenBluetooth();
            }}
            className={`p-3.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-400/40 hover:border-cyan-400 transition-all flex flex-col justify-between cursor-pointer ${
              isRtl ? 'text-right' : 'text-left'
            }`}
          >
            <Bluetooth className="w-5 h-5 text-cyan-300 mb-2" />
            <div>
              <span className="text-xs font-display font-black text-cyan-200 block">{t.bluetooth}</span>
              <span className="text-[10px] font-mono text-cyan-400/80">{isRtl ? 'غرفة محلية' : 'Offline Lobby'}</span>
            </div>
          </button>

          {/* Profile */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              onOpenProfile();
            }}
            className={`p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between cursor-pointer ${
              isRtl ? 'text-right' : 'text-left'
            }`}
          >
            <User className="w-5 h-5 text-amber-400 mb-2" />
            <div>
              <span className="text-xs font-display font-black text-white block">{t.profile}</span>
              <span className="text-[10px] font-mono text-slate-400">{profile.name}</span>
            </div>
          </button>

          {/* Shop */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              onOpenShop();
            }}
            className={`p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between cursor-pointer ${
              isRtl ? 'text-right' : 'text-left'
            }`}
          >
            <ShoppingBag className="w-5 h-5 text-purple-400 mb-2" />
            <div>
              <span className="text-xs font-display font-black text-white block">{t.shop}</span>
              <span className="text-[10px] font-mono text-slate-400">{isRtl ? 'مظلات وحركات' : 'Gliders & Emotes'}</span>
            </div>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              didyAudio.playButtonClick();
              onOpenSettings();
            }}
            className={`p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between cursor-pointer ${
              isRtl ? 'text-right' : 'text-left'
            }`}
          >
            <Settings className="w-5 h-5 text-slate-400 mb-2" />
            <div>
              <span className="text-xs font-display font-black text-white block">{t.settings}</span>
              <span className="text-[10px] font-mono text-slate-400">{isRtl ? 'تحكم ورسومات' : 'Controls & GFX'}</span>
            </div>
          </button>
        </div>
      </main>

      {/* Bottom Footer Info */}
      <footer className="relative z-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isRtl ? 'محرك كرتوني عالي الأداء 60 إطار/ثانية لأجهزة الأندرويد' : 'ANDROID HIGH-PERFORMANCE 60 FPS CARTOON ENGINE'}</span>
        </div>
        <span>{isRtl ? 'تنافس في الحديقة وتوّج بكأس ديدي 🏆' : 'COMPETE IN THE PARK · CLAIM THE DIDY CUP 🏆'}</span>
      </footer>
    </div>
  );
};

