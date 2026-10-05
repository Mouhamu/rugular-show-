import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  PlayerProfile,
  GameSettings,
  GameMode,
  DropPhase,
  InGamePlayer,
  MatchScoreboardEntry
} from '../types';
import { REGULAR_SHOW_CHARACTERS } from '../data/characters';
import { ANIMAL_COMPANIONS } from '../data/pets';
import { buildParkMap, ParkMapData } from '../scene/parkMap';
import { buildCharacterModel, AnimatedCharacterRig } from '../scene/characterModels';
import { buildPetModel, AnimatedPetRig } from '../scene/petModels';
import { DropModeManager } from '../scene/dropModeManager';
import { collisionSystem } from '../scene/collisionSystem';
import { bluetoothManager } from '../network/bluetoothManager';
import { didyAudio } from '../audio/didyAudio';
import { GameHUD } from './GameHUD';
import { DidyCupVictoryModal } from './DidyCupVictoryModal';

interface DidyGameCanvasProps {
  profile: PlayerProfile;
  settings: GameSettings;
  gameMode: GameMode;
  onExitToMenu: () => void;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
}

export const DidyGameCanvas: React.FC<DidyGameCanvasProps> = ({
  profile,
  settings,
  gameMode,
  onExitToMenu,
  onUpdateProfile
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Match State for HUD
  const [matchScore, setMatchScore] = useState(0);
  const [matchTimer, setMatchTimer] = useState(180); // 3 minutes match
  const [blueScore, setBlueScore] = useState(0);
  const [redScore, setRedScore] = useState(0);
  const [dropPhase, setDropPhase] = useState<DropPhase>(gameMode !== 'SOLO_PARK' ? 'PLANE_FLYBY' : 'LANDED');
  const [currentAltitude, setCurrentAltitude] = useState(gameMode !== 'SOLO_PARK' ? 105 : 0);
  const [isCrouching, setIsCrouching] = useState(false);
  const [playerMapPos, setPlayerMapPos] = useState({ x: 0, z: 0 });
  const [playerRotY, setPlayerRotY] = useState(0);
  const [medalsCount, setMedalsCount] = useState(0);
  const [isMatchOver, setIsMatchOver] = useState(false);
  const [winnerName, setWinnerName] = useState(profile.name);

  // Simulation Mutable Ref for 60 FPS performance
  const simRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    map: ParkMapData;
    playerPos: THREE.Vector3;
    playerRotY: number;
    playerVelY: number;
    playerSpeed: number;
    isGrounded: boolean;
    isCrouching: boolean;
    moveInput: { x: number; z: number; isSprinting: boolean };
    lookDelta: { yaw: number; pitch: number };
    camPitch: number;
    playerRig: AnimatedCharacterRig;
    petRig: AnimatedPetRig | null;
    dropManager: DropModeManager;
    npcRigs: Map<string, { rig: AnimatedCharacterRig; pos: THREE.Vector3; targetPos: THREE.Vector3; team: 'BLUE' | 'RED' | 'SOLO' }>;
    floatingNameMesh: THREE.Sprite;
  } | null>(null);

  const selectedChar = REGULAR_SHOW_CHARACTERS.find(c => c.id === profile.selectedCharacterId) || REGULAR_SHOW_CHARACTERS[0];
  const selectedPet = ANIMAL_COMPANIONS.find(p => p.id === profile.selectedPetId) || ANIMAL_COMPANIONS[0];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Start energetic electronic background music (Hellblade intensity)
    didyAudio.playTrack(gameMode !== 'SOLO_PARK' ? 'DROP' : 'MATCH');

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8); // Sunny blue cartoon sky
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.008);

    // Camera
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 250);
    camera.position.set(0, 4, 7);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: settings.graphicsPreset !== 'LOW',
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(settings.graphicsPreset === 'HIGH' ? Math.min(window.devicePixelRatio, 1.5) : 1.0);
    renderer.shadowMap.enabled = settings.shadowsEnabled && settings.graphicsPreset !== 'LOW';
    container.appendChild(renderer.domElement);

    // Lighting (Bright, vibrant cartoon park illumination)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x4ade80, 0.85);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    dirLight.position.set(30, 50, 25);
    if (renderer.shadowMap.enabled) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 120;
      dirLight.shadow.camera.left = -50;
      dirLight.shadow.camera.right = 50;
      dirLight.shadow.camera.top = 50;
      dirLight.shadow.camera.bottom = -50;
    }
    scene.add(dirLight);

    // 2. Build Park Map
    const map = buildParkMap();
    scene.add(map.group);

    // 3. Drop Mode Manager (Cargo Airplane, Skydiving, Glider Descent)
    const dropManager = new DropModeManager(scene);
    const startInDrop = gameMode !== 'SOLO_PARK';

    const playerInitialPos = startInDrop
      ? dropManager.flightStart.clone()
      : new THREE.Vector3(0, 0, 15);

    if (startInDrop) {
      dropManager.startAirDrop();
    }

    // 4. Build Player 3D Model (Mordecai / Rigby / Skips etc.)
    const playerRig = buildCharacterModel(selectedChar);
    playerRig.group.position.copy(playerInitialPos);
    scene.add(playerRig.group);

    // 5. Floating 3D Name Tag displaying "Mouha muh" directly above character!
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(10, 10, 236, 44, 12);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(profile.name, 128, 32);

    const nameTex = new THREE.CanvasTexture(canvas);
    const nameSpriteMat = new THREE.SpriteMaterial({ map: nameTex, depthTest: false });
    const floatingNameMesh = new THREE.Sprite(nameSpriteMat);
    floatingNameMesh.scale.set(2.4, 0.6, 1);
    floatingNameMesh.position.set(0, selectedChar.height + 0.45, 0);
    playerRig.group.add(floatingNameMesh);

    // 6. Animal Companion 3D Model (Buster / Whiskers etc.)
    let petRig: AnimatedPetRig | null = null;
    if (selectedPet) {
      petRig = buildPetModel(selectedPet);
      scene.add(petRig.group);
    }

    // 7. Regular Show AI NPCs & Bluetooth Room Peers
    const npcRigs = new Map<string, { rig: AnimatedCharacterRig; pos: THREE.Vector3; targetPos: THREE.Vector3; team: 'BLUE' | 'RED' | 'SOLO' }>();
    const npcPool = REGULAR_SHOW_CHARACTERS.filter(c => c.id !== selectedChar.id);

    const is4v4 = gameMode === 'DROP_4V4' || gameMode === 'BLUETOOTH_4V4';
    const is2v2 = gameMode === 'DROP_2V2' || gameMode === 'BLUETOOTH_2V2';
    const npcCount = is4v4 ? 7 : is2v2 ? 3 : 4;

    const btRoom = bluetoothManager.currentRoom;
    const btPeers = btRoom ? btRoom.players.filter(p => p.id !== bluetoothManager.localPeer.id) : [];

    for (let i = 0; i < npcCount; i++) {
      let npcDef = npcPool[i % npcPool.length];
      let team: 'BLUE' | 'RED' | 'SOLO' = gameMode === 'SOLO_PARK'
        ? 'SOLO'
        : i % 2 === 0 ? 'BLUE' : 'RED';

      // If playing in Bluetooth mode, use the real peer's character and team!
      if (i < btPeers.length) {
        const peer = btPeers[i];
        const peerChar = REGULAR_SHOW_CHARACTERS.find(c => c.id === peer.characterId);
        if (peerChar) npcDef = peerChar;
        team = peer.team;
      }

      const npcRig = buildCharacterModel(npcDef);

      const initialSpawn = startInDrop
        ? new THREE.Vector3((Math.random() - 0.5) * 40, 75, (Math.random() - 0.5) * 40)
        : new THREE.Vector3((Math.random() - 0.5) * 50, 0, (Math.random() - 0.5) * 50);

      npcRig.group.position.copy(initialSpawn);
      scene.add(npcRig.group);

      npcRigs.set(`npc_${i}`, {
        rig: npcRig,
        pos: initialSpawn,
        targetPos: new THREE.Vector3((Math.random() - 0.5) * 60, 0, (Math.random() - 0.5) * 60),
        team
      });
    }

    simRef.current = {
      scene,
      camera,
      renderer,
      map,
      playerPos: playerInitialPos,
      playerRotY: 0,
      playerVelY: 0,
      playerSpeed: 0,
      isGrounded: !startInDrop,
      isCrouching: false,
      moveInput: { x: 0, z: 0, isSprinting: false },
      lookDelta: { yaw: 0, pitch: 0 },
      camPitch: 0.25,
      playerRig,
      petRig,
      dropManager,
      npcRigs,
      floatingNameMesh
    };

    // Keyboard support for desktop testing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') handleJump();
      if (e.code === 'KeyC') handleToggleCrouch();
      if (e.code === 'KeyJ') handleDropJump();
      if (e.code === 'KeyE') handleInteract();
      if (e.code === 'KeyF') handleAction();
      if (e.code === 'Digit1') handleEmote(selectedChar.emoteName);
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 8. 60 FPS RENDER LOOP
    let animId: number;
    let lastTime = performance.now();
    let hudTimerAccum = 0;

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!simRef.current) return;
      const sim = simRef.current;

      // Update Map elements (spinning medals, drifting clouds)
      sim.map.update(dt);

      // --- A. AIR-DROP MODE OR GROUND LOCOMOTION ---
      if (sim.dropManager.dropState.phase !== 'LANDED') {
        sim.dropManager.update(dt, sim.moveInput.x, sim.moveInput.z, sim.playerPos, () => {
          sim.isGrounded = true;
          setDropPhase('LANDED');
          didyAudio.playTrack('MATCH'); // switch to high-energy match music
        });

        const curPhase = sim.dropManager.dropState.phase;
        setDropPhase(curPhase);
        setCurrentAltitude(sim.dropManager.dropState.altitude);

        const isPlane = curPhase === 'PLANE_FLYBY';
        const isFreefall = curPhase === 'FREEFALL';
        const isGliding = curPhase === 'GLIDING';

        // Keep character invisible while riding inside cargo aircraft, reveal upon jumping
        sim.playerRig.group.visible = !isPlane;
        sim.playerRig.group.position.copy(sim.playerPos);

        sim.playerRig.updateAnimation(dt, {
          speed: isFreefall ? 20.0 : isGliding ? 8.0 : 0,
          isGrounded: false,
          isGliding: isGliding,
          isFreefalling: isFreefall,
          isCrouching: false,
          isJumping: false,
          isVictory: false,
          isDefeat: false,
          isEmoting: false
        });
      } else {
        // Normal Ground Movement & Camera Update
        sim.playerRotY += sim.lookDelta.yaw;
        sim.camPitch = THREE.MathUtils.clamp(sim.camPitch + sim.lookDelta.pitch, -0.4, 0.8);
        sim.lookDelta = { yaw: 0, pitch: 0 };

        // Crouch speed reduction (tactical stealth)
        const baseSpeed = sim.isCrouching ? selectedChar.speed * 0.55 : selectedChar.speed;
        const moveSpeed = sim.moveInput.isSprinting && !sim.isCrouching ? baseSpeed * 1.35 : baseSpeed;
        const inputMag = Math.hypot(sim.moveInput.x, sim.moveInput.z);

        // Immediate responsive acceleration and instantaneous stopping friction (Zero sliding!)
        const targetSpeed = inputMag > 0.05 ? moveSpeed * Math.min(1.0, inputMag) : 0;
        const lerpRate = inputMag > 0.05 ? 14 : 32;
        sim.playerSpeed = THREE.MathUtils.lerp(sim.playerSpeed, targetSpeed, dt * lerpRate);
        if (inputMag <= 0.05 && sim.playerSpeed < 0.08) {
          sim.playerSpeed = 0;
        }

        if (sim.playerSpeed > 0.05) {
          // Camera-relative movement direction
          const moveAngle = Math.atan2(sim.moveInput.x, -sim.moveInput.z) + sim.playerRotY;

          // Natural turning with shortest angular interpolation
          let angleDiff = moveAngle - sim.playerRig.group.rotation.y;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          sim.playerRig.group.rotation.y += angleDiff * Math.min(1, dt * 16);

          // Calculate desired horizontal trajectory
          const desiredPos = new THREE.Vector3(
            sim.playerPos.x + Math.sin(moveAngle) * sim.playerSpeed * dt,
            sim.playerPos.y,
            sim.playerPos.z + Math.cos(moveAngle) * sim.playerSpeed * dt
          );

          // 1. Resolve collision against buildings, walls, trees, playground, and map bounds
          const resolvedPos = collisionSystem.resolveMovement(
            sim.playerPos,
            desiredPos,
            0.45,
            selectedChar.height
          );
          sim.playerPos.x = resolvedPos.x;
          sim.playerPos.z = resolvedPos.z;

          // 2. Soft character-to-character separation against nearby NPCs
          const otherPositions = Array.from(sim.npcRigs.values()).map(n => n.pos);
          const separatedPos = collisionSystem.resolveEntityCollisions(sim.playerPos, otherPositions, 0.6);
          sim.playerPos.x = separatedPos.x;
          sim.playerPos.z = separatedPos.z;
        }

        // Gravity & Jump Physics with precise landing alignment
        sim.playerVelY -= 24 * dt;
        sim.playerPos.y += sim.playerVelY * dt;

        // Exact Ground / Porch / Dock Elevation
        const groundH = collisionSystem.getGroundHeight(sim.playerPos.x, sim.playerPos.z);
        if (sim.playerPos.y <= groundH) {
          sim.playerPos.y = groundH;
          sim.playerVelY = 0;
          sim.isGrounded = true;
        } else {
          sim.isGrounded = false;
        }

        sim.playerRig.group.position.copy(sim.playerPos);

        // Trampoline Jump Pad Bouncing!
        sim.map.jumpPads.forEach(pad => {
          if (pad.position.distanceTo(sim.playerPos) < 2.2 && sim.isGrounded) {
            didyAudio.playBouncePad();
            sim.playerVelY = pad.boostForce;
            sim.isGrounded = false;
          }
        });

        // Collectibles Gathering
        sim.map.collectibles.forEach(col => {
          if (!col.collected && col.position.distanceTo(sim.playerPos) < 2.0) {
            col.collected = true;
            col.respawnTimer = 15;
            col.mesh.visible = false;
            didyAudio.playCollectMedal();

            setMatchScore(prev => prev + col.points);
            setMedalsCount(prev => prev + 1);
            if (gameMode !== 'SOLO_PARK') {
              setBlueScore(prev => prev + col.points);
            }
          }
        });

        // Update 3D Character Animation (Crouching, Sneaking, Running, Jumping)
        sim.playerRig.updateAnimation(dt, {
          speed: sim.playerSpeed,
          isGrounded: sim.isGrounded,
          isGliding: false,
          isFreefalling: false,
          isCrouching: sim.isCrouching,
          isJumping: !sim.isGrounded,
          isVictory: false,
          isDefeat: false,
          isEmoting: false
        });
      }

      // --- B. ANIMAL COMPANION FOLLOW LOGIC ---
      if (sim.petRig) {
        sim.petRig.update(dt, sim.playerPos, sim.playerRig.group.rotation.y, sim.playerSpeed, false);
      }

      // --- C. REGULAR SHOW AI SQUAD / OPPONENT NPCS ---
      sim.npcRigs.forEach((npc, id) => {
        // Intelligent waypoint navigation
        const dist = npc.pos.distanceTo(npc.targetPos);
        if (dist < 3.0 || Math.random() < 0.005) {
          npc.targetPos.set((Math.random() - 0.5) * 80, 0, (Math.random() - 0.5) * 80);
        }

        const dir = npc.targetPos.clone().sub(npc.pos).normalize();
        const desiredNpcPos = new THREE.Vector3(
          npc.pos.x + dir.x * 5.5 * dt,
          npc.pos.y,
          npc.pos.z + dir.z * 5.5 * dt
        );

        // NPC obstacle collision resolution (avoids walking through walls/trees!)
        const resolvedNpcPos = collisionSystem.resolveMovement(npc.pos, desiredNpcPos, 0.45, 1.8);
        npc.pos.x = resolvedNpcPos.x;
        npc.pos.z = resolvedNpcPos.z;

        // Ground following
        const gH = collisionSystem.getGroundHeight(npc.pos.x, npc.pos.z);
        npc.pos.y = gH;

        npc.rig.group.position.copy(npc.pos);

        // Smooth NPC turning
        const targetRotY = Math.atan2(dir.x, dir.z);
        let npcAngleDiff = targetRotY - npc.rig.group.rotation.y;
        while (npcAngleDiff > Math.PI) npcAngleDiff -= Math.PI * 2;
        while (npcAngleDiff < -Math.PI) npcAngleDiff += Math.PI * 2;
        npc.rig.group.rotation.y += npcAngleDiff * Math.min(1, dt * 10);

        npc.rig.updateAnimation(dt, {
          speed: 5.5,
          isGrounded: true,
          isGliding: false,
          isJumping: false,
          isVictory: false,
          isDefeat: false,
          isEmoting: false
        });

        // Collectibles pickup by NPCs
        sim.map.collectibles.forEach(col => {
          if (!col.collected && col.position.distanceTo(npc.pos) < 2.0) {
            col.collected = true;
            col.respawnTimer = 15;
            col.mesh.visible = false;
            if (npc.team === 'RED') {
              setRedScore(prev => prev + col.points);
            } else if (npc.team === 'BLUE') {
              setBlueScore(prev => prev + col.points);
            }
          }
        });
      });

      // --- D. THIRD-PERSON CARTOON BATTLE-ROYALE CHASE CAMERA WITH ANTI-CLIPPING ---
      const isPlane = sim.dropManager.dropState.phase === 'PLANE_FLYBY';
      let camFocus = new THREE.Vector3(
        sim.playerPos.x,
        sim.playerPos.y + (sim.isCrouching ? 0.9 : 1.6),
        sim.playerPos.z
      );

      const targetCamDist = isPlane ? 22.0 : sim.isCrouching ? 5.0 : 6.2;
      let desiredCamPos: THREE.Vector3;

      if (isPlane) {
        // High-altitude cinematic view behind the cargo aircraft
        const planePos = sim.dropManager.planeGroup.position;
        const planeRot = sim.dropManager.planeGroup.rotation.y;
        desiredCamPos = new THREE.Vector3(
          planePos.x - Math.sin(planeRot) * 24,
          planePos.y + 8.5,
          planePos.z - Math.cos(planeRot) * 24
        );
        camFocus = planePos.clone();
      } else {
        desiredCamPos = new THREE.Vector3(
          sim.playerPos.x - Math.sin(sim.playerRotY) * targetCamDist * Math.cos(sim.camPitch),
          sim.playerPos.y + (sim.isCrouching ? 1.6 : 2.2) + Math.sin(sim.camPitch) * targetCamDist,
          sim.playerPos.z - Math.cos(sim.playerRotY) * targetCamDist * Math.cos(sim.camPitch)
        );

        // Anti-Clipping Obstacle Raycast Check (pulls camera closer when behind walls/trees)
        if (sim.isGrounded) {
          const safeDist = collisionSystem.checkCameraDistance(camFocus, desiredCamPos, targetCamDist);
          if (safeDist < targetCamDist) {
            desiredCamPos = new THREE.Vector3(
              sim.playerPos.x - Math.sin(sim.playerRotY) * safeDist * Math.cos(sim.camPitch),
              sim.playerPos.y + (sim.isCrouching ? 1.4 : 1.8) + Math.sin(sim.camPitch) * safeDist,
              sim.playerPos.z - Math.cos(sim.playerRotY) * safeDist * Math.cos(sim.camPitch)
            );
          }
        }
      }

      sim.camera.position.lerp(desiredCamPos, Math.min(1, dt * 16));
      sim.camera.lookAt(camFocus);

      // Real-time minimap coordinates update
      setPlayerMapPos({ x: sim.playerPos.x, z: sim.playerPos.z });
      setPlayerRotY(sim.playerRotY);

      // Render
      sim.renderer.render(sim.scene, sim.camera);

      // --- E. MATCH TIMER & WIN CONDITION CHECK ---
      hudTimerAccum += dt;
      if (hudTimerAccum >= 1.0) {
        hudTimerAccum = 0;
        setMatchTimer(prev => {
          if (prev <= 1 && !isMatchOver) {
            // Match Finished -> Winner receives DIDY CUP!
            setIsMatchOver(true);
            setWinnerName(profile.name);
            onUpdateProfile(p => ({
              ...p,
              didyCupTrophies: p.didyCupTrophies + 1,
              wins: p.wins + 1,
              matchesPlayed: p.matchesPlayed + 1,
              bestScore: Math.max(p.bestScore, matchScore + 500),
              coins: p.coins + 150
            }));
            return 0;
          }
          return Math.max(0, prev - 1);
        });
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      didyAudio.stopTrack();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);

      if (simRef.current) {
        simRef.current.playerRig.dispose();
        simRef.current.petRig?.dispose();
        simRef.current.npcRigs.forEach(n => n.rig.dispose());
        simRef.current.dropManager.dispose();
        simRef.current.renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        simRef.current = null;
      }
    };
  }, [profile, settings, gameMode]);

  // Actions Callbacks
  const handleJump = useCallback(() => {
    if (simRef.current && simRef.current.isGrounded) {
      didyAudio.playJump();
      simRef.current.playerVelY = selectedChar.jumpForce;
      simRef.current.isGrounded = false;
    }
  }, [selectedChar.jumpForce]);

  const handleToggleCrouch = useCallback(() => {
    setIsCrouching(prev => {
      const next = !prev;
      if (simRef.current) simRef.current.isCrouching = next;
      return next;
    });
  }, []);

  const handleDropJump = useCallback(() => {
    if (simRef.current) {
      simRef.current.dropManager.triggerJump(simRef.current.playerPos);
      setDropPhase('FREEFALL');
    }
  }, []);

  const handleDeployGlider = useCallback(() => {
    if (simRef.current) {
      simRef.current.dropManager.deployGlider();
      setDropPhase('GLIDING');
    }
  }, []);

  const handleAction = useCallback(() => {
    didyAudio.playHighFive();
    setMatchScore(prev => prev + 25);
  }, []);

  const handleInteract = useCallback(() => {
    didyAudio.playCollectMedal();
    setMatchScore(prev => prev + 50);
  }, []);

  const handleEmote = useCallback((emoteName: string) => {
    didyAudio.playHighFive();
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden select-none touch-none font-sans">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Game HUD Overlay */}
      <GameHUD
        playerName={profile.name}
        characterName={selectedChar.name}
        gameMode={gameMode}
        score={matchScore}
        matchTimer={matchTimer}
        blueTeamScore={blueScore}
        redTeamScore={redScore}
        dropPhase={dropPhase}
        altitude={currentAltitude}
        isCrouching={isCrouching}
        playerMapPos={playerMapPos}
        playerRotY={playerRotY}
        controls={settings.controls}
        onMove={(x, z, isSprinting) => {
          if (simRef.current) simRef.current.moveInput = { x, z, isSprinting };
        }}
        onLook={(deltaYaw, deltaPitch) => {
          if (simRef.current) {
            simRef.current.lookDelta.yaw += deltaYaw;
            simRef.current.lookDelta.pitch += deltaPitch;
          }
        }}
        onJump={handleJump}
        onToggleCrouch={handleToggleCrouch}
        onDropJump={handleDropJump}
        onDeployGlider={handleDeployGlider}
        onAction={handleAction}
        onInteract={handleInteract}
        onEmote={handleEmote}
        onToggleScoreboard={() => {}}
        onTogglePause={onExitToMenu}
      />

      {/* Cinematic Golden DIDY CUP Victory Presentation */}
      {isMatchOver && (
        <DidyCupVictoryModal
          winnerName={winnerName}
          characterName={selectedChar.name}
          petName={selectedPet.name}
          finalScore={matchScore + 500}
          medalsCollected={medalsCount}
          onRematch={() => {
            setIsMatchOver(false);
            setMatchScore(0);
            setMatchTimer(180);
            if (simRef.current) {
              simRef.current.playerPos.set(0, 0, 15);
            }
          }}
          onExitToMenu={onExitToMenu}
        />
      )}
    </div>
  );
};
