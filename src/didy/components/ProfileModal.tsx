import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { REGULAR_SHOW_CHARACTERS } from '../data/characters';
import { ANIMAL_COMPANIONS } from '../data/pets';
import { didyAudio } from '../audio/didyAudio';
import { getTranslations, SupportedLanguage, CHARACTER_AR_NAMES, PET_AR_NAMES } from '../i18n/translations';
import { Trophy, Award, User, Edit3, Check, X, Shield, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  profile: PlayerProfile;
  language?: SupportedLanguage;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  language = 'ar',
  onUpdateProfile,
  onClose
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);

  const t = getTranslations(language);
  const isRtl = language === 'ar';

  const favChar = REGULAR_SHOW_CHARACTERS.find(c => c.id === profile.favoriteCharacterId) || REGULAR_SHOW_CHARACTERS[0];
  const favPet = ANIMAL_COMPANIONS.find(p => p.id === profile.favoritePetId) || ANIMAL_COMPANIONS[0];

  const charAr = CHARACTER_AR_NAMES[favChar.id];
  const petAr = PET_AR_NAMES[favPet.id];

  const charNameDisplay = language === 'ar' && charAr ? charAr.name : favChar.name;
  const charSpeciesDisplay = language === 'ar' && charAr ? charAr.title : favChar.species;
  const petNameDisplay = language === 'ar' && petAr ? petAr.name : favPet.name;
  const petSpeciesDisplay = language === 'ar' && petAr ? petAr.type : favPet.species;

  const handleSaveName = () => {
    didyAudio.playButtonClick();
    if (editedName.trim()) {
      onUpdateProfile(prev => ({ ...prev, name: editedName.trim() }));
      setIsEditingName(false);
    }
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans"
    >
      <div className="bg-[#0b1320] border-2 border-white/15 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white tracking-wider">
                {t.profileTitle}
              </h2>
              <p className="text-xs font-mono text-cyan-300">
                {isRtl ? 'الملف الرياضي الرسمي لبطولة كأس ديدي' : 'Official DIDY CUP Athlete Profile'}
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

        {/* Player Name Display Card */}
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 flex flex-col gap-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            {t.playerName}:
          </span>

          <div className="flex items-center justify-between">
            {!isEditingName ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl font-display font-black text-white tracking-wide">
                  {profile.name}
                </span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors cursor-pointer"
                  title={t.editName}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-950 border border-cyan-400 rounded-xl text-lg font-display font-bold text-white focus:outline-hidden"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" /> {t.save}
                </button>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {isRtl
              ? 'يظهر اسمك في شارات اللاعبين، لوحة الصدارة، فوق رأس الشخصية ثلاثية الأبعاد، وفي نتائج كأس ديدي.'
              : 'Displayed on your player tag, scoreboard, floating 3D avatar label, and DIDY CUP results.'}
          </p>
        </div>

        {/* Career Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Trophies */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex flex-col items-center text-center">
            <Trophy className="w-7 h-7 text-amber-400 mb-1" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">{t.didyCupTrophies}</span>
            <span className="text-2xl font-display font-black text-amber-300 tabular-nums">
              {profile.didyCupTrophies}
            </span>
          </div>

          {/* Wins */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col items-center text-center">
            <Award className="w-7 h-7 text-cyan-400 mb-1" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">{t.wins}</span>
            <span className="text-2xl font-display font-black text-white tabular-nums">
              {profile.wins}
            </span>
          </div>

          {/* Matches Played */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col items-center text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">{t.matchesPlayed}</span>
            <span className="text-2xl font-display font-black text-slate-200 mt-1 tabular-nums">
              {profile.matchesPlayed}
            </span>
          </div>

          {/* Best Score */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col items-center text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">{t.bestScore}</span>
            <span className="text-2xl font-display font-black text-purple-300 mt-1 tabular-nums">
              {profile.bestScore} {isRtl ? 'نقطة' : 'pts'}
            </span>
          </div>
        </div>

        {/* Favorite Regular Show Character & Animal Companion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <span className="text-[10px] text-slate-400 uppercase block">{t.favoriteChar}</span>
              <span className="text-base font-display font-black text-white">{charNameDisplay}</span>
            </div>
            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2 py-1 rounded">
              {charSpeciesDisplay}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <span className="text-[10px] text-slate-400 uppercase block">{t.favoriteCompanion}</span>
              <span className="text-base font-display font-black text-white">{petNameDisplay}</span>
            </div>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-1 rounded uppercase">
              {petSpeciesDisplay}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-white/10 pt-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-display font-bold text-white transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
