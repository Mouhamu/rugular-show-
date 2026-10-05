import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RegularShowCharacter } from '../types';
import { REGULAR_SHOW_CHARACTERS } from '../data/characters';
import { buildCharacterModel } from '../scene/characterModels';
import { didyAudio } from '../audio/didyAudio';
import { getTranslations, SupportedLanguage, CHARACTER_AR_NAMES } from '../i18n/translations';
import { Check, Lock, Sparkles, X, ChevronRight, Play } from 'lucide-react';

interface CharacterSelectModalProps {
  selectedId: string;
  unlockedIds: string[];
  language?: SupportedLanguage;
  onSelect: (characterId: string) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  selectedId,
  unlockedIds,
  language = 'ar',
  onSelect,
  onClose
}) => {
  const [currentId, setCurrentId] = useState<string>(selectedId);
  const [activeAnim, setActiveAnim] = useState<'IDLE' | 'VICTORY' | 'EMOTE'>('IDLE');
  const previewCanvasRef = useRef<HTMLDivElement | null>(null);

  const t = getTranslations(language);
  const isRtl = language === 'ar';

  const activeChar = REGULAR_SHOW_CHARACTERS.find(c => c.id === currentId) || REGULAR_SHOW_CHARACTERS[0];
  const charAr = CHARACTER_AR_NAMES[activeChar.id];

  const activeCharDisplayName = language === 'ar' && charAr ? charAr.name : activeChar.name;
  const activeCharDisplayTitle = language === 'ar' && charAr ? charAr.title : activeChar.species;
  const activeCharDisplayQuote = language === 'ar' && charAr ? charAr.quote : activeChar.catchphrase;

  // --- 3D MINI PREVIEW CANVAS ---
  useEffect(() => {
    const container = previewCanvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 1.3, 3.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.0);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    // Circular pedestal
    const pedMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const pedGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.2, 24);
    const ped = new THREE.Mesh(pedGeo, pedMat);
    scene.add(ped);

    // Build 3D Model
    const rig = buildCharacterModel(activeChar);
    scene.add(rig.group);

    let animId: number;
    let lastT = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const dt = (now - lastT) / 1000;
      lastT = now;

      // Gentle pedestal rotation
      rig.group.rotation.y += dt * 0.8;

      rig.updateAnimation(dt, {
        speed: 0,
        isGrounded: true,
        isGliding: false,
        isJumping: false,
        isVictory: activeAnim === 'VICTORY',
        isDefeat: false,
        isEmoting: activeAnim === 'EMOTE',
        emoteName: activeChar.emoteName
      });

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      rig.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeChar, activeAnim]);

  const handleConfirm = () => {
    didyAudio.playButtonClick();
    onSelect(currentId);
    onClose();
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans"
    >
      <div className="bg-[#0b1320] border-2 border-white/15 rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-display font-black text-white tracking-wider">
              {t.charSelectTitle}
            </h2>
            <p className="text-xs font-mono text-cyan-300">
              {t.charSelectSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left: 3D Preview Box & Animation Triggers */}
          <div className="flex flex-col gap-3">
            <div
              ref={previewCanvasRef}
              className="w-full h-72 md:h-80 rounded-3xl overflow-hidden border border-white/10 bg-slate-950/60 shadow-xl relative"
            >
              {/* Emote Floating Tag */}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Emote: {activeChar.emoteName}</span>
              </div>
            </div>

            {/* Animation Toggle Buttons */}
            <div className="flex items-center gap-2 p-1 bg-slate-900/90 border border-white/10 rounded-2xl">
              <button
                onClick={() => {
                  didyAudio.playButtonClick();
                  setActiveAnim('IDLE');
                }}
                className={`flex-1 py-2 text-xs font-display font-bold rounded-xl transition-colors ${
                  activeAnim === 'IDLE' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                IDLE
              </button>
              <button
                onClick={() => {
                  didyAudio.playVictoryFanfare();
                  setActiveAnim('VICTORY');
                }}
                className={`flex-1 py-2 text-xs font-display font-bold rounded-xl transition-colors ${
                  activeAnim === 'VICTORY' ? 'bg-amber-400 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                VICTORY DANCE
              </button>
              <button
                onClick={() => {
                  didyAudio.playHighFive();
                  setActiveAnim('EMOTE');
                }}
                className={`flex-1 py-2 text-xs font-display font-bold rounded-xl transition-colors ${
                  activeAnim === 'EMOTE' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                EMOTE ({activeChar.emoteName})
              </button>
            </div>
          </div>

          {/* Right: Character Roster Grid & Details */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {REGULAR_SHOW_CHARACTERS.map(c => {
                const isSelected = c.id === currentId;
                const isUnlocked = c.unlocked || unlockedIds.includes(c.id);

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      didyAudio.playButtonClick();
                      setCurrentId(c.id);
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/20 ring-2 ring-cyan-500/40 shadow-lg'
                        : 'border-white/10 bg-slate-900/60 hover:border-white/25'
                    }`}
                  >
                    <div>
                      <div
                        className="w-7 h-7 rounded-xl border flex items-center justify-center font-display font-black text-white text-xs mb-1.5 shadow"
                        style={{ backgroundColor: c.color, borderColor: c.accentColor }}
                      >
                        {c.name[0]}
                      </div>
                      <span className="text-xs font-display font-black text-white block truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {c.species}
                      </span>
                    </div>

                    {!isUnlocked && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-amber-400">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Character Bio */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-black text-white">{activeCharDisplayName}</h3>
                <span className="text-xs font-mono font-bold text-amber-400">"{activeCharDisplayQuote}"</span>
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {isRtl ? `${activeCharDisplayTitle} - يتميز بحركات خاصة وقفزات مرنة في أرجاء حديقة ريجولار شو.` : activeChar.description}
              </p>

              {/* Stats Bars */}
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/5 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">{t.statSpeed}</span>
                  <div className="w-full h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${(activeChar.speed / 8.5) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t.statJump}</span>
                  <div className="w-full h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${(activeChar.jumpForce / 10) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Select Button */}
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-2xl text-xs font-display font-black tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:brightness-110 shadow-xl transition-all cursor-pointer"
            >
              {isRtl ? `العب بشخصية ${activeCharDisplayName}` : `DEPLOY AS ${activeChar.name.toUpperCase()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
