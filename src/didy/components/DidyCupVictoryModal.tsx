import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { didyAudio } from '../audio/didyAudio';
import { getTranslations, SupportedLanguage } from '../i18n/translations';
import { Trophy, Award, Sparkles, RotateCcw, Home, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DidyCupVictoryModalProps {
  winnerName: string;
  characterName: string;
  petName: string;
  finalScore: number;
  medalsCollected: number;
  language?: SupportedLanguage;
  onRematch: () => void;
  onExitToMenu: () => void;
}

export const DidyCupVictoryModal: React.FC<DidyCupVictoryModalProps> = ({
  winnerName,
  characterName,
  petName,
  finalScore,
  medalsCollected,
  language = 'ar',
  onRematch,
  onExitToMenu
}) => {
  const trophyCanvasRef = useRef<HTMLDivElement | null>(null);
  const t = getTranslations(language);
  const isRtl = language === 'ar';

  useEffect(() => {
    didyAudio.playVictoryFanfare();

    // Trigger golden celebratory confetti blast!
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#facc15', '#38bdf8', '#a855f7', '#4ade80']
      });
    } catch {
      // ignore
    }

    // 3D Spinning Golden DIDY CUP Trophy
    const container = trophyCanvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 0.8, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
    dirLight.position.set(4, 5, 4);
    scene.add(dirLight);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.95,
      roughness: 0.15
    });

    // Trophy Cup Geometry
    const trophyGroup = new THREE.Group();

    // Pedestal Base
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.35, 16), baseMat);
    base.position.y = -0.6;
    trophyGroup.add(base);

    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.6, 12), goldMat);
    stem.position.y = -0.2;
    trophyGroup.add(stem);

    // Chalice Cup Bowl
    const chalice = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.3, 0.9, 20), goldMat);
    chalice.position.y = 0.45;
    trophyGroup.add(chalice);

    // Handles
    const handleGeo = new THREE.TorusGeometry(0.35, 0.06, 8, 16);
    const lh = new THREE.Mesh(handleGeo, goldMat);
    lh.position.set(-0.85, 0.5, 0);
    trophyGroup.add(lh);
    const rh = new THREE.Mesh(handleGeo, goldMat);
    rh.position.set(0.85, 0.5, 0);
    trophyGroup.add(rh);

    scene.add(trophyGroup);

    let animId: number;
    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      trophyGroup.rotation.y += 0.02;
      renderer.render(scene, camera);
    };
    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans"
    >
      <div className="bg-[#0b1320] border-2 border-amber-400/60 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col items-center text-center gap-5">
        {/* Title */}
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-950/80 px-4 py-1 rounded-full border border-amber-400/40">
            {t.victoryWinner}
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-wider text-white mt-2">
            {t.victoryTitle}
          </h2>
          <p className="text-xl font-display font-bold text-cyan-300 mt-1">
            {isRtl ? `الفائز بالبطولة: ${winnerName}` : `WINNER: ${winnerName}`}
          </p>
        </div>

        {/* 3D Spinning Golden Trophy Viewport */}
        <div
          ref={trophyCanvasRef}
          className="w-56 h-56 rounded-full border-2 border-amber-400/30 bg-radial from-amber-500/20 to-transparent shadow-xl"
        />

        {/* Match Statistics Card */}
        <div className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex items-center justify-around">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">{isRtl ? 'البطل' : 'OPERATOR'}</span>
            <span className="text-sm font-display font-black text-white">{characterName}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">{t.medalsGathered}</span>
            <span className="text-sm font-display font-black text-amber-300 tabular-nums">
              {medalsCollected}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase">{t.finalScore}</span>
            <span className="text-sm font-display font-black text-cyan-300 tabular-nums">
              {finalScore} {isRtl ? 'نقطة' : 'pts'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 italic">
          {isRtl
            ? `احتفل الرفيق ${petName} معك بالقفز والمرح لفوزك بكأس ديدي!`
            : `"${petName} happily jumped and celebrated your DIDY CUP victory!"`}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-2.5">
          <button
            onClick={onRematch}
            className="w-full py-3.5 rounded-2xl text-xs font-display font-black tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:brightness-110 shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>{t.playAgain}</span>
          </button>

          <button
            onClick={onExitToMenu}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-white/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>{t.returnToMenu}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
