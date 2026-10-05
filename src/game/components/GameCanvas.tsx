import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  PlayerState,
  MatchState,
  Team,
  PlayerProfile,
  WeaponDef,
  KillFeedItem
} from '../types';
import { WEAPONS, CHARACTERS } from '../data/gameData';
import { buildBattlefield, MapData } from '../scene/mapBuilder';
import { createCharacterInstance, CharacterControllerInstance } from '../scene/characterRig';
import { TacticalCameraController } from '../scene/cameraController';
import { CombatEngine, HitResult } from '../scene/combatEngine';
import { BotAIController } from '../logic/botAI';
import { soundManager } from '../audio/soundManager';
import { bluetoothManager } from '../network/bluetoothManager';
import { HUD } from './HUD';
import { MobileControls } from './MobileControls';
import { ScoreboardModal } from './ScoreboardModal';
import { PauseModal } from './PauseModal';
import { RoundOverModal } from './RoundOverModal';
import { SettingsModal } from './SettingsModal';
import { ControlsCustomizer } from './ControlsCustomizer';

interface GameCanvasProps {
  profile: PlayerProfile;
  isBluetoothMatch: boolean;
  isHost: boolean;
  selectedTeam: Team;
  selectedCharacterId: string;
  botCount: number;
  onExitToMenu: () => void;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  profile,
  isBluetoothMatch,
  isHost,
  selectedTeam,
  selectedCharacterId,
  botCount,
  onExitToMenu,
  onUpdateProfile
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Modals state
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showControlsEditor, setShowControlsEditor] = useState(false);

  // HUD Realtime Feedback
  const [hitMarker, setHitMarker] = useState<{ active: boolean; isHeadshot: boolean } | null>(null);
  const [damageAngle, setDamageAngle] = useState<number | null>(null);
  const [canInteractSupply, setCanInteractSupply] = useState(false);

  // Spectator Index
  const [spectatorIndex, setSpectatorIndex] = useState(0);

  // Synchronized Game State in React (refreshed periodically for HUD)
  const [localPlayerState, setLocalPlayerState] = useState<PlayerState>(() => createInitialPlayer(profile, selectedTeam, selectedCharacterId));
  const [currentWeapon, setCurrentWeapon] = useState<WeaponDef>(() => WEAPONS.find(w => w.id === profile.loadout.primaryWeaponId) || WEAPONS[0]);
  const [matchState, setMatchState] = useState<MatchState>({
    roundState: 'COUNTDOWN',
    currentRound: 1,
    maxRounds: 5,
    roundTimer: 180,
    countdownTimer: 3,
    scores: { ALPHA: 0, BRAVO: 0 },
    winnerTeam: null,
    killFeed: []
  });
  const [allPlayersState, setAllPlayersState] = useState<PlayerState[]>([]);

  // Internal mutable simulation refs (so 60fps loop runs without React re-render lag)
  const simRef = useRef<{
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camController: TacticalCameraController;
    combat: CombatEngine;
    mapData: MapData;
    players: PlayerState[];
    charRigs: Map<string, CharacterControllerInstance>;
    botAIs: Map<string, BotAIController>;
    localMove: { x: number; z: number; isSprinting: boolean };
    localLookDelta: { yaw: number; pitch: number };
    recoilPitch: number;
    recoilYaw: number;
    keysDown: Set<string>;
    isPointerLocked: boolean;
    isFiring: boolean;
    match: MatchState;
    profile: PlayerProfile;
  } | null>(null);

  // 1. INITIALIZE SCENE AND 60FPS ENGINE
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    soundManager.startAmbientTrack();

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f18);
    scene.fog = new THREE.FogExp2(0x0a0f18, 0.012);

    // Renderer (optimized for mobile 30-60 FPS)
    const renderer = new THREE.WebGLRenderer({
      antialias: profile.settings.graphicsQuality !== 'LOW',
      powerPreference: 'high-performance'
    });
    const pixelRatio = profile.settings.graphicsQuality === 'HIGH' ? Math.min(window.devicePixelRatio, 2) : 1.0;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = profile.settings.dynamicShadows && profile.settings.graphicsQuality !== 'LOW';
    renderer.shadowMap.type = THREE.BasicShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 0.7);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    dirLight.position.set(20, 35, 20);
    if (renderer.shadowMap.enabled) {
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 80;
      dirLight.shadow.camera.left = -25;
      dirLight.shadow.camera.right = 25;
      dirLight.shadow.camera.top = 25;
      dirLight.shadow.camera.bottom = -25;
    }
    scene.add(dirLight);

    // Build Battlefield
    const mapData = buildBattlefield();
    scene.add(mapData.group);

    // Camera & Combat
    const camController = new TacticalCameraController();
    camController.resize(window.innerWidth, window.innerHeight);

    const combat = new CombatEngine(scene);

    // Build Initial Roster (Local Player + Bots / Peers)
    const initialPlayers: PlayerState[] = [];
    const charRigs = new Map<string, CharacterControllerInstance>();
    const botAIs = new Map<string, BotAIController>();

    // Local Player
    const local = createInitialPlayer(profile, selectedTeam, selectedCharacterId);
    const spawnPt = selectedTeam === 'ALPHA' ? mapData.spawns.ALPHA[0] : mapData.spawns.BRAVO[0];
    local.position = { x: spawnPt.x, y: spawnPt.y, z: spawnPt.z };
    initialPlayers.push(local);

    const localCharDef = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];
    const localRig = createCharacterInstance(localCharDef, selectedTeam);
    const localWep = getWeaponBySlot(local, 0);
    localRig.attachWeapon(localWep);
    scene.add(localRig.root);
    charRigs.set(local.id, localRig);

    // Spawn Squad / Enemy Bots
    const botNames = ['Ghost', 'Recon', 'Striker', 'Shadow', 'Hawk'];
    const botChars = ['char_dune', 'char_ghost', 'char_cobalt', 'char_pyro', 'char_phantom'];

    let spawnAlphaIdx = selectedTeam === 'ALPHA' ? 1 : 0;
    let spawnBravoIdx = selectedTeam === 'BRAVO' ? 1 : 0;

    for (let b = 0; b < botCount; b++) {
      const isTeammate = b === 0 && botCount > 1; // 1 bot on player team, rest on opposing team
      const botTeam: Team = isTeammate ? selectedTeam : (selectedTeam === 'ALPHA' ? 'BRAVO' : 'ALPHA');
      const botId = `bot_${b + 1}`;
      const charId = botChars[b % botChars.length];
      const botSpawn = botTeam === 'ALPHA'
        ? mapData.spawns.ALPHA[spawnAlphaIdx++ % mapData.spawns.ALPHA.length]
        : mapData.spawns.BRAVO[spawnBravoIdx++ % mapData.spawns.BRAVO.length];

      const botPlayer: PlayerState = {
        id: botId,
        name: `${botNames[b % botNames.length]} [BOT]`,
        isLocal: false,
        isBot: true,
        isHost: false,
        team: botTeam,
        characterId: charId,
        loadout: { ...profile.loadout },
        stats: { kills: 0, deaths: 0, assists: 0, damageDealt: 0, score: 0, headshots: 0 },
        health: 100,
        armor: 100,
        isAlive: true,
        position: { x: botSpawn.x, y: botSpawn.y, z: botSpawn.z },
        rotation: { yaw: botTeam === 'ALPHA' ? Math.PI : 0, pitch: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        currentSlot: 0,
        ammoInMag: 30,
        ammoInReserve: 120,
        isShooting: false,
        isAiming: false,
        isReloading: false,
        isCrouching: false,
        isSprinting: false,
        isJumping: false,
        isGrounded: true,
        isMeleeAttacking: false,
        isThrowingGrenade: false,
        reloadProgress: 0,
        shootCooldown: 0,
        hurtCooldown: 0,
        ping: Math.floor(15 + Math.random() * 12)
      };

      initialPlayers.push(botPlayer);

      const botCharDef = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
      const botRig = createCharacterInstance(botCharDef, botTeam);
      botRig.attachWeapon(WEAPONS[0]);
      scene.add(botRig.root);
      charRigs.set(botId, botRig);

      botAIs.set(botId, new BotAIController(botId));
    }

    const initialMatch: MatchState = {
      roundState: 'COUNTDOWN',
      currentRound: 1,
      maxRounds: 5,
      roundTimer: 180,
      countdownTimer: 3,
      scores: { ALPHA: 0, BRAVO: 0 },
      winnerTeam: null,
      killFeed: []
    };

    simRef.current = {
      scene,
      renderer,
      camController,
      combat,
      mapData,
      players: initialPlayers,
      charRigs,
      botAIs,
      localMove: { x: 0, z: 0, isSprinting: false },
      localLookDelta: { yaw: 0, pitch: 0 },
      recoilPitch: 0,
      recoilYaw: 0,
      keysDown: new Set<string>(),
      isPointerLocked: false,
      isFiring: false,
      match: initialMatch,
      profile
    };

    setAllPlayersState([...initialPlayers]);
    setLocalPlayerState({ ...local });

    // 2. NETWORK SUBSCRIPTIONS
    bluetoothManager.onMove(packet => {
      const p = simRef.current?.players.find(x => x.id === packet.id);
      if (p) {
        p.position.x = packet.x;
        p.position.y = packet.y;
        p.position.z = packet.z;
        p.rotation.yaw = packet.yaw;
        p.rotation.pitch = packet.pitch;
        p.isCrouching = packet.crouch;
        p.isSprinting = packet.sprint;
        p.isJumping = packet.jump;
      }
    });

    bluetoothManager.onShoot(packet => {
      const shooter = simRef.current?.players.find(x => x.id === packet.id);
      const wep = WEAPONS.find(w => w.id === packet.weaponId) || WEAPONS[0];
      if (shooter && simRef.current) {
        soundManager.playWeaponShot(wep.soundType);
        simRef.current.combat.fireBullet(
          new THREE.Vector3(...packet.origin),
          new THREE.Vector3(...packet.dir),
          wep,
          packet.isADS,
          shooter.id,
          simRef.current.players,
          simRef.current.mapData.obstacles
        );
      }
    });

    bluetoothManager.onHit(packet => {
      const target = simRef.current?.players.find(x => x.id === packet.targetId);
      if (target) {
        target.health = Math.max(0, target.health - packet.damage);
        target.hurtCooldown = 0.4;
        if (target.health <= 0) target.isAlive = false;
      }
    });

    bluetoothManager.onKillFeed(item => {
      setMatchState(prev => ({
        ...prev,
        killFeed: [...prev.killFeed.slice(-5), item]
      }));
    });

    // 3. DESKTOP KEYBOARD & MOUSE LISTENER
    const handleKeyDown = (e: KeyboardEvent) => {
      simRef.current?.keysDown.add(e.code);

      if (e.code === 'KeyR') handleReload();
      if (e.code === 'KeyC') handleToggleCrouch();
      if (e.code === 'Space') handleJump();
      if (e.code === 'KeyG') handleThrowGrenade();
      if (e.code === 'Digit1') handleSwitchWeapon(0);
      if (e.code === 'Digit2') handleSwitchWeapon(1);
      if (e.code === 'Digit3') handleSwitchWeapon(2);
      if (e.code === 'Digit4') handleSwitchWeapon(3);
      if (e.code === 'KeyF' || e.code === 'KeyE') handleInteract();
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowScoreboard(prev => !prev);
      }
      if (e.code === 'Escape') {
        setShowPause(prev => !prev);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      simRef.current?.keysDown.delete(e.code);
    };

    const handlePointerLockChange = () => {
      if (simRef.current) {
        simRef.current.isPointerLocked = document.pointerLockElement === renderer.domElement;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (simRef.current && simRef.current.isPointerLocked) {
        const sens = profile.settings.lookSensitivity * (localPlayerState.isAiming ? profile.settings.adsSensitivityMultiplier : 1.0);
        const yawDelta = e.movementX * 0.0022 * sens;
        const pitchDelta = (profile.settings.invertY ? -e.movementY : e.movementY) * 0.0022 * sens;

        simRef.current.localLookDelta.yaw += yawDelta;
        simRef.current.localLookDelta.pitch += pitchDelta;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!simRef.current?.isPointerLocked && e.target === renderer.domElement) {
        renderer.domElement.requestPointerLock?.();
      }
      if (e.button === 0) {
        // Left click shoot
        handleFireStart();
      } else if (e.button === 2) {
        // Right click ADS
        e.preventDefault();
        handleToggleAim();
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        handleFireEnd();
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);

    // Resize handler
    const handleResize = () => {
      camController.resize(window.innerWidth, window.innerHeight);
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 4. ANIMATION FRAME RENDER LOOP (60 FPS)
    let lastTime = performance.now();
    let animId: number;
    let hudUpdateTimer = 0;

    const gameLoop = (now: number) => {
      animId = requestAnimationFrame(gameLoop);
      const dt = Math.min((now - lastTime) / 1000, 0.05); // clamp delta time
      lastTime = now;

      if (!simRef.current) return;
      const sim = simRef.current;
      const local = sim.players[0];

      // --- A. MATCH LOGIC & TIMERS ---
      if (sim.match.roundState === 'COUNTDOWN') {
        sim.match.countdownTimer -= dt;
        if (sim.match.countdownTimer <= 0) {
          sim.match.roundState = 'ACTIVE';
          sim.match.roundTimer = 180;
          soundManager.playCountdownBeep(true);
        }
      } else if (sim.match.roundState === 'ACTIVE') {
        sim.match.roundTimer -= dt;

        // Check Round Elimination Win Conditions
        const alphaAlive = sim.players.some(p => p.team === 'ALPHA' && p.isAlive);
        const bravoAlive = sim.players.some(p => p.team === 'BRAVO' && p.isAlive);

        if (!alphaAlive || !bravoAlive || sim.match.roundTimer <= 0) {
          const roundWinner: Team = !alphaAlive ? 'BRAVO' : 'ALPHA';
          sim.match.roundState = 'ROUND_OVER';
          sim.match.winnerTeam = roundWinner;
          sim.match.scores[roundWinner]++;

          if (roundWinner === local.team) {
            soundManager.playVictoryFanfare();
          } else {
            soundManager.playDefeatCue();
          }

          // Check if match won (best of 5 = first to 3)
          if (sim.match.scores[roundWinner] >= Math.ceil(sim.match.maxRounds / 2)) {
            sim.match.roundState = 'MATCH_OVER';
          }

          setMatchState({ ...sim.match });
        }
      }

      // --- B. LOCAL PLAYER INPUT & MOVEMENT ---
      if (local.isAlive && sim.match.roundState === 'ACTIVE') {
        // Desktop WASD movement merge with Touch Joystick
        let moveX = sim.localMove.x;
        let moveZ = sim.localMove.z;

        if (sim.keysDown.has('KeyW') || sim.keysDown.has('ArrowUp')) moveZ -= 1;
        if (sim.keysDown.has('KeyS') || sim.keysDown.has('ArrowDown')) moveZ += 1;
        if (sim.keysDown.has('KeyA') || sim.keysDown.has('ArrowLeft')) moveX -= 1;
        if (sim.keysDown.has('KeyD') || sim.keysDown.has('ArrowRight')) moveX += 1;

        const isMoving = Math.hypot(moveX, moveZ) > 0.1;
        if (isMoving) {
          const len = Math.hypot(moveX, moveZ);
          moveX /= len;
          moveZ /= len;
        }

        const isSprinting = (sim.localMove.isSprinting || sim.keysDown.has('ShiftLeft')) && moveZ < -0.5 && !local.isCrouching && !local.isAiming;
        local.isSprinting = isSprinting;

        // Apply camera yaw & pitch
        local.rotation.yaw += sim.localLookDelta.yaw;
        local.rotation.pitch = THREE.MathUtils.clamp(
          local.rotation.pitch - sim.localLookDelta.pitch,
          -1.2,
          1.2
        );
        sim.localLookDelta = { yaw: 0, pitch: 0 };

        // Recoil Decay
        sim.recoilPitch = THREE.MathUtils.lerp(sim.recoilPitch, 0, dt * 10);
        sim.recoilYaw = THREE.MathUtils.lerp(sim.recoilYaw, 0, dt * 10);

        // Move Vector in world space
        const speed = isSprinting ? 7.0 : local.isCrouching ? 2.8 : 4.6;
        const forward = new THREE.Vector3(Math.sin(local.rotation.yaw), 0, Math.cos(local.rotation.yaw));
        const right = new THREE.Vector3(Math.cos(local.rotation.yaw), 0, -Math.sin(local.rotation.yaw));

        const moveDir = forward.multiplyScalar(-moveZ).add(right.multiplyScalar(moveX));
        if (isMoving) {
          const stepX = moveDir.x * speed * dt;
          const stepZ = moveDir.z * speed * dt;

          let targetX = THREE.MathUtils.clamp(local.position.x + stepX, sim.mapData.bounds.minX + 0.5, sim.mapData.bounds.maxX - 0.5);
          let targetZ = THREE.MathUtils.clamp(local.position.z + stepZ, sim.mapData.bounds.minZ + 0.5, sim.mapData.bounds.maxZ - 0.5);

          // Obstacle collision
          const radius = 0.45;
          let blocked = false;
          for (let o = 0; o < sim.mapData.obstacles.length; o++) {
            const obs = sim.mapData.obstacles[o];
            if (obs.type === 'ramp') continue; // ramps are walkable slopes
            if (
              targetX + radius > obs.box.min.x &&
              targetX - radius < obs.box.max.x &&
              targetZ + radius > obs.box.min.z &&
              targetZ - radius < obs.box.max.z
            ) {
              const obsTop = obs.elevation || obs.box.max.y;
              if (obsTop > local.position.y + 0.65) {
                blocked = true;
                break;
              }
            }
          }

          if (!blocked) {
            local.position.x = targetX;
            local.position.z = targetZ;
          }

          // Footstep audio
          soundManager.playFootstep(isSprinting);
        }

        // Height & Rooftop following
        const groundH = sim.mapData.getHeightAt(local.position.x, local.position.z);
        local.position.y = THREE.MathUtils.lerp(local.position.y, groundH, dt * 20);
        local.isGrounded = Math.abs(local.position.y - groundH) < 0.1;

        // Auto-fire while holding fire trigger
        const activeWep = getWeaponBySlot(local, local.currentSlot);
        local.shootCooldown -= dt;

        if (sim.isFiring && local.shootCooldown <= 0 && local.ammoInMag > 0 && !local.isReloading) {
          executePlayerShot(local, activeWep, sim);
        }

        // Reload progress
        if (local.isReloading) {
          local.reloadProgress += dt / activeWep.reloadTime;
          if (local.reloadProgress >= 1.0) {
            const needed = activeWep.magazineSize - local.ammoInMag;
            const toTake = Math.min(needed, local.ammoInReserve);
            local.ammoInMag += toTake;
            local.ammoInReserve -= toTake;
            local.isReloading = false;
            local.reloadProgress = 0;
            soundManager.playReload('cock');
          }
        }

        // Check nearby Supply Station
        let nearbySupply = false;
        sim.mapData.supplies.forEach(s => {
          if (s.position.distanceTo(new THREE.Vector3(local.position.x, local.position.y, local.position.z)) < 2.5) {
            nearbySupply = true;
          }
        });
        setCanInteractSupply(nearbySupply);

        // Send local network position
        if (isBluetoothMatch) {
          bluetoothManager.sendMovement(local);
        }
      }

      // --- C. BOT AI UPDATE ---
      if (sim.match.roundState === 'ACTIVE') {
        sim.botAIs.forEach((botAI, botId) => {
          const botPlayer = sim.players.find(p => p.id === botId);
          if (!botPlayer || !botPlayer.isAlive) return;

          const botWep = WEAPONS[0];
          botAI.update(
            dt,
            botPlayer,
            sim.players,
            sim.mapData.obstacles,
            botWep,
            sim.mapData.getHeightAt,
            (origin, dir) => {
              // Bot fired bullet
              soundManager.playWeaponShot(botWep.soundType);
              sim.combat.fireBullet(origin, dir, botWep, botPlayer.isAiming, botId, sim.players, sim.mapData.obstacles, res => {
                if (res.hitPlayerId === local.id) {
                  soundManager.playDamageReceived();
                  // Calculate hit angle
                  const dx = botPlayer.position.x - local.position.x;
                  const dz = botPlayer.position.z - local.position.z;
                  const angle = (Math.atan2(dx, dz) - local.rotation.yaw) * (180 / Math.PI);
                  setDamageAngle(angle);
                  setTimeout(() => setDamageAngle(null), 400);
                }
                if (res.isEliminated) {
                  registerElimination(botPlayer, sim.players.find(p => p.id === res.hitPlayerId)!, botWep.name, res.isHeadshot);
                }
              });
            },
            (origin, dir) => {
              // Bot threw grenade
              soundManager.playWeaponShot('grenade');
              sim.combat.throwGrenade(origin, dir, botId);
            }
          );
        });
      }

      // --- D. COMBAT ENGINE & PROJECTILE PHYSICS ---
      sim.combat.update(dt, sim.mapData.obstacles, sim.players, (throwerId, victimId, dmg, isDead) => {
        const thrower = sim.players.find(p => p.id === throwerId);
        const victim = sim.players.find(p => p.id === victimId);
        if (victim && isDead) {
          registerElimination(thrower || local, victim, 'M67 Frag Grenade', false);
        }
      });

      // --- E. UPDATE 3D CHARACTER RIGS & PROCEDURAL ANIMATIONS ---
      sim.players.forEach(p => {
        const rig = sim.charRigs.get(p.id);
        if (rig) {
          rig.root.position.set(p.position.x, p.position.y, p.position.z);
          rig.root.rotation.y = p.rotation.yaw;

          rig.updateAnimation(dt, {
            speed: p.isSprinting ? 6.5 : (p.isCrouching ? 2.5 : 4.5),
            isSprinting: p.isSprinting,
            isCrouching: p.isCrouching,
            isJumping: p.isJumping,
            isGrounded: p.isGrounded,
            isAiming: p.isAiming,
            isShooting: p.isShooting,
            isReloading: p.isReloading,
            reloadProgress: p.reloadProgress,
            isMeleeAttacking: p.isMeleeAttacking,
            isThrowingGrenade: p.isThrowingGrenade,
            isHurt: p.hurtCooldown > 0,
            isAlive: p.isAlive,
            isVictory: sim.match.roundState === 'ROUND_OVER' && sim.match.winnerTeam === p.team,
            pitch: p.rotation.pitch
          });
        }
      });

      // --- F. CAMERA UPDATE ---
      const activeCamTarget = local.isAlive
        ? new THREE.Vector3(local.position.x, local.position.y, local.position.z)
        : getSpectatorTarget(sim.players, local.team, spectatorIndex);

      sim.camController.update(
        dt,
        activeCamTarget,
        {
          yaw: local.rotation.yaw,
          pitch: local.rotation.pitch,
          isAiming: local.isAiming,
          isSniper: getWeaponBySlot(local, local.currentSlot).category === 'SNIPER',
          recoilOffsetPitch: sim.recoilPitch,
          recoilOffsetYaw: sim.recoilYaw
        },
        sim.mapData.obstacles,
        !local.isAlive
      );

      // --- G. RENDER THREE.JS SCENE ---
      sim.renderer.render(sim.scene, sim.camController.camera);

      // --- H. REFRESH HUD REACT STATE AT 10HZ ---
      hudUpdateTimer += dt;
      if (hudUpdateTimer > 0.1) {
        hudUpdateTimer = 0;
        setLocalPlayerState({ ...local });
        setMatchState({ ...sim.match });
        setAllPlayersState([...sim.players]);
      }
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      soundManager.stopAmbientTrack();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);

      if (simRef.current) {
        simRef.current.charRigs.forEach(r => r.dispose());
        simRef.current.combat.dispose();
        simRef.current.renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        simRef.current = null;
      }
    };
  }, [profile, isBluetoothMatch, isHost, selectedTeam, selectedCharacterId, botCount]);

  // Helpers
  const executePlayerShot = (local: PlayerState, activeWep: WeaponDef, sim: NonNullable<typeof simRef.current>) => {
    local.ammoInMag--;
    local.shootCooldown = 1.0 / activeWep.fireRate;
    local.isShooting = true;

    // Recoil Impulse
    sim.recoilPitch = THREE.MathUtils.clamp(sim.recoilPitch + activeWep.recoilVertical, 0, 0.25);
    sim.recoilYaw += (Math.random() - 0.5) * activeWep.recoilHorizontal;

    // Trigger Gunshot Audio
    soundManager.playWeaponShot(activeWep.soundType);

    // Muzzle origin
    const rig = sim.charRigs.get(local.id);
    const muzzlePos = rig ? rig.getMuzzleWorldPosition() : new THREE.Vector3(local.position.x, local.position.y + 1.2, local.position.z);

    // Bullet direction along camera heading
    const aimDir = new THREE.Vector3(
      Math.sin(local.rotation.yaw),
      -Math.sin(local.rotation.pitch),
      Math.cos(local.rotation.yaw)
    ).normalize();

    sim.combat.fireBullet(
      muzzlePos,
      aimDir,
      activeWep,
      local.isAiming,
      local.id,
      sim.players,
      sim.mapData.obstacles,
      (hitRes: HitResult) => {
        // Hit marker
        soundManager.playHitMarker(hitRes.isHeadshot);
        setHitMarker({ active: true, isHeadshot: hitRes.isHeadshot });
        setTimeout(() => setHitMarker(null), 120);

        local.stats.damageDealt += hitRes.damageDealt;
        local.stats.score += hitRes.damageDealt;

        const victim = sim.players.find(p => p.id === hitRes.hitPlayerId);
        if (victim && hitRes.isEliminated) {
          registerElimination(local, victim, activeWep.name, hitRes.isHeadshot);
        }
      }
    );

    // Broadcast over Bluetooth
    if (isBluetoothMatch) {
      bluetoothManager.sendShoot(
        [muzzlePos.x, muzzlePos.y, muzzlePos.z],
        [aimDir.x, aimDir.y, aimDir.z],
        activeWep.id,
        local.isAiming
      );
    }
  };

  const registerElimination = (killer: PlayerState, victim: PlayerState, weaponName: string, isHeadshot: boolean) => {
    killer.stats.kills++;
    killer.stats.score += isHeadshot ? 250 : 150;
    if (isHeadshot) killer.stats.headshots++;
    victim.stats.deaths++;

    const item: KillFeedItem = {
      id: `kill_${Date.now()}_${Math.random()}`,
      killerName: killer.name,
      killerTeam: killer.team,
      victimName: victim.name,
      victimTeam: victim.team,
      weaponName,
      isHeadshot,
      timestamp: Date.now()
    };

    if (simRef.current) {
      simRef.current.match.killFeed.push(item);
    }

    setMatchState(prev => ({
      ...prev,
      killFeed: [...prev.killFeed.slice(-5), item]
    }));

    if (isBluetoothMatch) {
      bluetoothManager.broadcastKill(item);
    }

    // Award local progression if killer is local player
    if (killer.isLocal) {
      onUpdateProfile(prev => {
        let updated = { ...prev, kills: prev.kills + 1 };
        if (isHeadshot) updated.headshots++;
        return updated;
      });
    }
  };

  // User Actions from Touch or Desktop
  const handleFireStart = useCallback(() => {
    if (simRef.current) {
      simRef.current.isFiring = true;
    }
  }, []);

  const handleFireEnd = useCallback(() => {
    if (simRef.current) {
      simRef.current.isFiring = false;
      simRef.current.players[0].isShooting = false;
    }
  }, []);

  const handleToggleAim = useCallback(() => {
    if (simRef.current) {
      const local = simRef.current.players[0];
      local.isAiming = !local.isAiming;
      setLocalPlayerState({ ...local });
    }
  }, []);

  const handleReload = useCallback(() => {
    if (simRef.current) {
      const local = simRef.current.players[0];
      const activeWep = getWeaponBySlot(local, local.currentSlot);
      if (local.ammoInMag < activeWep.magazineSize && local.ammoInReserve > 0 && !local.isReloading) {
        local.isReloading = true;
        local.reloadProgress = 0;
        soundManager.playReload('start');
        setLocalPlayerState({ ...local });
      }
    }
  }, []);

  const handleJump = useCallback(() => {
    if (simRef.current) {
      const local = simRef.current.players[0];
      if (local.isGrounded && !local.isJumping) {
        local.isJumping = true;
        local.position.y += 0.8;
        setTimeout(() => {
          if (simRef.current) simRef.current.players[0].isJumping = false;
        }, 400);
      }
    }
  }, []);

  const handleToggleCrouch = useCallback(() => {
    if (simRef.current) {
      const local = simRef.current.players[0];
      local.isCrouching = !local.isCrouching;
      setLocalPlayerState({ ...local });
    }
  }, []);

  const handleThrowGrenade = useCallback(() => {
    if (simRef.current) {
      const local = simRef.current.players[0];
      if (local.isAlive && !local.isReloading) {
        soundManager.playWeaponShot('grenade');
        local.isThrowingGrenade = true;
        setTimeout(() => {
          if (simRef.current) {
            const loc = simRef.current.players[0];
            loc.isThrowingGrenade = false;
            const throwOrigin = new THREE.Vector3(loc.position.x, loc.position.y + 1.4, loc.position.z);
            const throwDir = new THREE.Vector3(
              Math.sin(loc.rotation.yaw),
              -Math.sin(loc.rotation.pitch),
              Math.cos(loc.rotation.yaw)
            ).normalize();
            simRef.current.combat.throwGrenade(throwOrigin, throwDir, loc.id);
          }
        }, 220);
      }
    }
  }, []);

  const handleSwitchWeapon = useCallback((slotIndex: 0 | 1 | 2 | 3) => {
    if (simRef.current) {
      const local = simRef.current.players[0];
      local.currentSlot = slotIndex;
      local.isReloading = false;
      const wep = getWeaponBySlot(local, slotIndex);
      local.ammoInMag = wep.magazineSize;
      local.ammoInReserve = wep.maxReserveAmmo;

      const rig = simRef.current.charRigs.get(local.id);
      rig?.attachWeapon(wep);

      setCurrentWeapon(wep);
      setLocalPlayerState({ ...local });
    }
  }, []);

  const handleInteract = useCallback(() => {
    if (simRef.current) {
      const local = simRef.current.players[0];
      const activeWep = getWeaponBySlot(local, local.currentSlot);
      // Resupply ammo & armor
      local.ammoInReserve = activeWep.maxReserveAmmo;
      local.armor = Math.min(100, local.armor + 50);
      soundManager.playReload('insert');
      setLocalPlayerState({ ...local });
    }
  }, []);

  const handleNextRound = () => {
    if (!simRef.current) return;
    const sim = simRef.current;

    // Reset round state
    sim.match.currentRound++;
    sim.match.roundState = 'COUNTDOWN';
    sim.match.countdownTimer = 3;
    sim.match.roundTimer = 180;
    sim.match.winnerTeam = null;

    // Respawn all players
    let alphaIdx = 0;
    let bravoIdx = 0;
    sim.players.forEach(p => {
      p.health = 100;
      p.armor = 100;
      p.isAlive = true;
      p.isReloading = false;
      const wep = getWeaponBySlot(p, p.currentSlot);
      p.ammoInMag = wep.magazineSize;
      p.ammoInReserve = wep.maxReserveAmmo;

      const spawn = p.team === 'ALPHA'
        ? sim.mapData.spawns.ALPHA[alphaIdx++ % sim.mapData.spawns.ALPHA.length]
        : sim.mapData.spawns.BRAVO[bravoIdx++ % sim.mapData.spawns.BRAVO.length];
      p.position = { x: spawn.x, y: spawn.y, z: spawn.z };
      p.rotation.yaw = p.team === 'ALPHA' ? 0 : Math.PI;
    });

    setMatchState({ ...sim.match });
    setLocalPlayerState({ ...sim.players[0] });
    setAllPlayersState([...sim.players]);
  };

  const handleRematch = () => {
    if (!simRef.current) return;
    simRef.current.match.scores = { ALPHA: 0, BRAVO: 0 };
    simRef.current.match.currentRound = 0;
    handleNextRound();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden select-none touch-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full cursor-crosshair" />

      {/* In-Game HUD Overlay */}
      <HUD
        player={localPlayerState}
        currentWeapon={currentWeapon}
        match={matchState}
        allPlayers={allPlayersState}
        hitMarker={hitMarker}
        damageIndicatorAngle={damageAngle}
        onToggleScoreboard={() => setShowScoreboard(prev => !prev)}
        onTogglePause={() => setShowPause(true)}
        onSpectateNext={() => setSpectatorIndex(prev => prev + 1)}
        onSpectatePrev={() => setSpectatorIndex(prev => Math.max(0, prev - 1))}
      />

      {/* Responsive Virtual Touch Controls */}
      <MobileControls
        layout={profile.controlLayout}
        settings={profile.settings}
        canInteract={canInteractSupply}
        onMove={(x, z, isSprinting) => {
          if (simRef.current) simRef.current.localMove = { x, z, isSprinting };
        }}
        onLook={(deltaYaw, deltaPitch) => {
          if (simRef.current) {
            simRef.current.localLookDelta.yaw += deltaYaw;
            simRef.current.localLookDelta.pitch += deltaPitch;
          }
        }}
        onFireStart={handleFireStart}
        onFireEnd={handleFireEnd}
        onToggleAim={handleToggleAim}
        onReload={handleReload}
        onJump={handleJump}
        onToggleCrouch={handleToggleCrouch}
        onThrowGrenade={handleThrowGrenade}
        onSwitchWeapon={handleSwitchWeapon}
        onInteract={handleInteract}
        isAiming={localPlayerState.isAiming}
        isCrouching={localPlayerState.isCrouching}
        activeSlot={localPlayerState.currentSlot}
      />

      {/* Scoreboard Modal */}
      {showScoreboard && (
        <ScoreboardModal
          match={matchState}
          players={allPlayersState}
          onClose={() => setShowScoreboard(false)}
        />
      )}

      {/* Pause Menu */}
      {showPause && (
        <PauseModal
          onResume={() => setShowPause(false)}
          onOpenScoreboard={() => {
            setShowPause(false);
            setShowScoreboard(true);
          }}
          onOpenSettings={() => {
            setShowPause(false);
            setShowSettings(true);
          }}
          onExitToMenu={onExitToMenu}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={profile.settings}
          onSaveSettings={(newSettings) => {
            onUpdateProfile(prev => ({ ...prev, settings: newSettings }));
          }}
          onOpenControlsEditor={() => {
            setShowSettings(false);
            setShowControlsEditor(true);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Touch HUD Controls Customizer */}
      {showControlsEditor && (
        <ControlsCustomizer
          layout={profile.controlLayout}
          settings={profile.settings}
          onSave={(newLayout, newSettings) => {
            onUpdateProfile(prev => ({
              ...prev,
              controlLayout: newLayout,
              settings: newSettings
            }));
          }}
          onClose={() => setShowControlsEditor(false)}
        />
      )}

      {/* Round End & Match Over Celebration / Defeat Screen */}
      {(matchState.roundState === 'ROUND_OVER' || matchState.roundState === 'MATCH_OVER') && (
        <RoundOverModal
          match={matchState}
          localPlayer={localPlayerState}
          allPlayers={allPlayersState}
          onNextRound={handleNextRound}
          onRematch={handleRematch}
          onExitToMenu={onExitToMenu}
        />
      )}
    </div>
  );
};

// Helper methods
function createInitialPlayer(profile: PlayerProfile, team: Team, characterId: string): PlayerState {
  const primaryWep = WEAPONS.find(w => w.id === profile.loadout.primaryWeaponId) || WEAPONS[0];
  return {
    id: 'local_player',
    name: profile.name,
    isLocal: true,
    isBot: false,
    isHost: true,
    team,
    characterId,
    loadout: { ...profile.loadout },
    stats: { kills: 0, deaths: 0, assists: 0, damageDealt: 0, score: 0, headshots: 0 },
    health: 100,
    armor: 100,
    isAlive: true,
    position: { x: 0, y: 0.1, z: 25 },
    rotation: { yaw: 0, pitch: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    currentSlot: 0,
    ammoInMag: primaryWep.magazineSize,
    ammoInReserve: primaryWep.maxReserveAmmo,
    isShooting: false,
    isAiming: false,
    isReloading: false,
    isCrouching: false,
    isSprinting: false,
    isJumping: false,
    isGrounded: true,
    isMeleeAttacking: false,
    isThrowingGrenade: false,
    reloadProgress: 0,
    shootCooldown: 0,
    hurtCooldown: 0,
    ping: 18
  };
}

function getWeaponBySlot(player: PlayerState, slot: number): WeaponDef {
  if (slot === 1) {
    return WEAPONS.find(w => w.id === player.loadout.secondaryWeaponId) || WEAPONS[5];
  }
  if (slot === 2) {
    return WEAPONS.find(w => w.id === player.loadout.meleeWeaponId) || WEAPONS[6];
  }
  if (slot === 3) {
    return WEAPONS.find(w => w.category === 'GRENADE') || WEAPONS[7];
  }
  return WEAPONS.find(w => w.id === player.loadout.primaryWeaponId) || WEAPONS[0];
}

function getSpectatorTarget(players: PlayerState[], team: Team, index: number): THREE.Vector3 {
  const teammates = players.filter(p => p.team === team && p.isAlive);
  if (teammates.length > 0) {
    const target = teammates[index % teammates.length];
    return new THREE.Vector3(target.position.x, target.position.y, target.position.z);
  }
  return new THREE.Vector3(0, 1.5, 0); // fallback center
}
