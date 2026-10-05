import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AnimalCompanion } from '../types';
import { ANIMAL_COMPANIONS } from '../data/pets';
import { buildPetModel } from '../scene/petModels';
import { didyAudio } from '../audio/didyAudio';
import { Heart, Sparkles, Check, X } from 'lucide-react';

interface PetSelectModalProps {
  selectedId: string;
  unlockedIds: string[];
  onSelect: (petId: string) => void;
  onClose: () => void;
}

export const PetSelectModal: React.FC<PetSelectModalProps> = ({
  selectedId,
  unlockedIds,
  onSelect,
  onClose
}) => {
  const [currentId, setCurrentId] = useState<string>(selectedId);
  const [isDancing, setIsDancing] = useState(false);
  const previewCanvasRef = useRef<HTMLDivElement | null>(null);

  const activePet = ANIMAL_COMPANIONS.find(p => p.id === currentId) || ANIMAL_COMPANIONS[0];

  useEffect(() => {
    const container = previewCanvasRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 0.8, 2.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.0);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    // Pedestal
    const pedMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.15, 16), pedMat);
    scene.add(ped);

    // Pet Rig
    const rig = buildPetModel(activePet);
    scene.add(rig.group);

    let animId: number;
    let lastT = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const dt = (now - lastT) / 1000;
      lastT = now;

      rig.group.rotation.y += dt * 0.8;
      rig.update(dt, new THREE.Vector3(0, 0.08, 0), 0, 0, isDancing);

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
  }, [activePet, isDancing]);

  const handleConfirm = () => {
    didyAudio.playButtonClick();
    onSelect(currentId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#0b1320] border-2 border-white/15 rounded-3xl max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-display font-black text-white tracking-wider flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              ANIMAL COMPANIONS
            </h2>
            <p className="text-xs font-mono text-cyan-300">
              Loyal companions that follow, jump, and celebrate your DIDY CUP victories
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* 3D Preview */}
          <div className="flex flex-col gap-3">
            <div
              ref={previewCanvasRef}
              className="w-full h-64 md:h-72 rounded-3xl overflow-hidden border border-white/10 bg-slate-950/60 shadow-xl"
            />
            <button
              onClick={() => {
                didyAudio.playVictoryFanfare();
                setIsDancing(prev => !prev);
              }}
              className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-white/10 text-xs font-display font-bold text-amber-400 transition-colors"
            >
              {isDancing ? '⏸ Sit / Wait' : '🎉 Test Victory Dance'}
            </button>
          </div>

          {/* Pet List */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {ANIMAL_COMPANIONS.map(pet => {
                const isSelected = pet.id === currentId;
                return (
                  <button
                    key={pet.id}
                    onClick={() => {
                      didyAudio.playButtonClick();
                      setCurrentId(pet.id);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-500/40 shadow-lg'
                        : 'border-white/10 bg-slate-900/60 hover:border-white/25'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-display font-black text-white block">
                        {pet.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {pet.species}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
              <h3 className="text-lg font-display font-black text-white">
                {activePet.name} the {activePet.species.toUpperCase()}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activePet.personality}
              </p>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-2xl text-xs font-display font-black tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:brightness-110 shadow-xl transition-all cursor-pointer"
            >
              EQUIP {activePet.name.toUpperCase()} AS COMPANION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
