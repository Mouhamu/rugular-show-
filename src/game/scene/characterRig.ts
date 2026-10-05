import * as THREE from 'three';
import { CharacterDef, Team, WeaponDef, WeaponSkin } from '../types';
import { getCamoTexture } from './textureFactory';
import { buildWeaponMesh, WeaponMeshAttachment } from './weaponBuilder';

export interface CharacterControllerInstance {
  root: THREE.Group;
  updateAnimation: (
    dt: number,
    state: {
      speed: number;
      isSprinting: boolean;
      isCrouching: boolean;
      isJumping: boolean;
      isGrounded: boolean;
      isAiming: boolean;
      isShooting: boolean;
      isReloading: boolean;
      reloadProgress: number;
      isMeleeAttacking: boolean;
      isThrowingGrenade: boolean;
      isHurt: boolean;
      isAlive: boolean;
      isVictory: boolean;
      pitch: number;
    }
  ) => void;
  attachWeapon: (weapon: WeaponDef, skin?: WeaponSkin) => void;
  getMuzzleWorldPosition: () => THREE.Vector3;
  setTeamIndicator: (team: Team) => void;
  dispose: () => void;
}

export function createCharacterInstance(charDef: CharacterDef, team: Team): CharacterControllerInstance {
  const root = new THREE.Group();
  root.name = `Char_${charDef.id}_${team}`;

  // Color materials
  const camoTex = getCamoTexture(charDef.camoPrimary, charDef.camoSecondary);
  const uniformMat = new THREE.MeshLambertMaterial({ map: camoTex });
  const vestMat = new THREE.MeshLambertMaterial({
    color: parseInt(charDef.vestColor.replace('#', '0x'))
  });
  const skinMat = new THREE.MeshLambertMaterial({
    color: parseInt(charDef.skinTone.replace('#', '0x'))
  });
  const hairMat = new THREE.MeshLambertMaterial({
    color: parseInt(charDef.hairColor.replace('#', '0x'))
  });
  const helmetMat = new THREE.MeshLambertMaterial({
    color: parseInt(charDef.helmetColor.replace('#', '0x'))
  });
  const bootMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
  const gloveMat = new THREE.MeshLambertMaterial({ color: 0x27272a });
  const darkMetalMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46 });

  // Team identification armband
  const teamColor = team === 'ALPHA' ? 0x2563eb : 0xdc2626; // Blue Alpha vs Red Bravo
  const teamMat = new THREE.MeshLambertMaterial({ color: teamColor });

  // --- SKELETAL HIERARCHY ---
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.95;
  root.add(pelvis);

  // Pelvis / Hips mesh
  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.24), uniformMat);
  pelvis.add(hips);

  // Torso
  const torso = new THREE.Group();
  torso.position.y = 0.1;
  pelvis.add(torso);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.28), uniformMat);
  chest.position.y = 0.24;
  chest.castShadow = true;
  torso.add(chest);

  // Tactical Plate Carrier / Vest
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.38, 0.32), vestMat);
  vest.position.set(0, 0.26, 0.01);
  vest.castShadow = true;
  torso.add(vest);

  // Tactical Pouches on Vest front
  const pouch1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.08), darkMetalMat);
  pouch1.position.set(-0.12, 0.2, 0.18);
  torso.add(pouch1);
  const pouch2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.08), darkMetalMat);
  pouch2.position.set(0.12, 0.2, 0.18);
  torso.add(pouch2);

  // Team Armband on left chest/shoulder
  const armband = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.34), teamMat);
  armband.position.set(0, 0.4, 0.01);
  torso.add(armband);

  // Tactical Backpack
  if (charDef.hasBackpack) {
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.18), vestMat);
    pack.position.set(0, 0.26, -0.22);
    pack.castShadow = true;
    torso.add(pack);

    const packPocket = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.1), uniformMat);
    packPocket.position.set(0, 0.24, -0.32);
    torso.add(packPocket);
  }

  // --- HEAD & ACCESSORIES ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.52, 0);
  torso.add(headGroup);

  // Head base
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.24), skinMat);
  head.position.y = 0.14;
  head.castShadow = true;
  headGroup.add(head);

  // Eyes / Tactical Visor
  const visorMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.02), visorMat);
  eyes.position.set(0, 0.16, 0.125);
  headGroup.add(eyes);

  // Helmet vs Hair vs Tactical Cap
  if (charDef.hasHelmet) {
    const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.28), helmetMat);
    helmet.position.set(0, 0.23, 0);
    helmet.castShadow = true;
    headGroup.add(helmet);

    // NVG mount / helmet brim
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.08), darkMetalMat);
    brim.position.set(0, 0.16, 0.15);
    headGroup.add(brim);
  } else {
    // Hairstyle or Tactical Cap
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.26), hairMat);
    hair.position.set(0, 0.24, 0);
    headGroup.add(hair);

    const capBrim = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.12), vestMat);
    capBrim.position.set(0, 0.22, 0.16);
    headGroup.add(capBrim);
  }

  // Ballistic Mask / Shemagh
  if (charDef.hasMask) {
    const mask = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.14), vestMat);
    mask.position.set(0, 0.09, 0.08);
    headGroup.add(mask);
  }

  // Tactical Goggles
  if (charDef.hasGoggles) {
    const goggleMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1
    });
    const goggles = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.06), goggleMat);
    goggles.position.set(0, 0.17, 0.135);
    headGroup.add(goggles);
  }

  // --- ARMS & HANDS ---
  // Left Arm
  const leftArmUpper = new THREE.Group();
  leftArmUpper.position.set(-0.28, 0.44, 0);
  torso.add(leftArmUpper);
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.12), uniformMat);
  leftArmMesh.position.y = -0.13;
  leftArmUpper.add(leftArmMesh);

  const leftArmLower = new THREE.Group();
  leftArmLower.position.set(0, -0.26, 0);
  leftArmUpper.add(leftArmLower);
  const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.24, 0.11), uniformMat);
  leftForearm.position.y = -0.12;
  leftArmLower.add(leftForearm);

  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), gloveMat);
  leftHand.position.y = -0.26;
  leftArmLower.add(leftHand);

  // Right Arm (holds weapon)
  const rightArmUpper = new THREE.Group();
  rightArmUpper.position.set(0.28, 0.44, 0);
  torso.add(rightArmUpper);
  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.12), uniformMat);
  rightArmMesh.position.y = -0.13;
  rightArmUpper.add(rightArmMesh);

  const rightArmLower = new THREE.Group();
  rightArmLower.position.set(0, -0.26, 0);
  rightArmUpper.add(rightArmLower);
  const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.24, 0.11), uniformMat);
  rightForearm.position.y = -0.12;
  rightArmLower.add(rightForearm);

  const rightHand = new THREE.Group();
  rightHand.position.set(0, -0.26, 0);
  rightArmLower.add(rightHand);
  const rightHandGlove = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), gloveMat);
  rightHand.add(rightHandGlove);

  // Weapon mount point in right hand
  const weaponMount = new THREE.Group();
  weaponMount.position.set(0, -0.05, -0.06);
  rightHand.add(weaponMount);

  // --- LEGS & BOOTS ---
  // Left Leg
  const leftLegUpper = new THREE.Group();
  leftLegUpper.position.set(-0.14, -0.08, 0);
  pelvis.add(leftLegUpper);
  const leftThigh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.16), uniformMat);
  leftThigh.position.y = -0.2;
  leftThigh.castShadow = true;
  leftLegUpper.add(leftThigh);

  const leftLegLower = new THREE.Group();
  leftLegLower.position.set(0, -0.4, 0);
  leftLegUpper.add(leftLegLower);
  const leftShin = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.38, 0.15), uniformMat);
  leftShin.position.y = -0.19;
  leftShin.castShadow = true;
  leftLegLower.add(leftShin);

  // Kneepad
  const leftKneepad = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.05), darkMetalMat);
  leftKneepad.position.set(0, -0.05, 0.09);
  leftLegLower.add(leftKneepad);

  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.24), bootMat);
  leftBoot.position.set(0, -0.38, 0.04);
  leftLegLower.add(leftBoot);

  // Right Leg
  const rightLegUpper = new THREE.Group();
  rightLegUpper.position.set(0.14, -0.08, 0);
  pelvis.add(rightLegUpper);
  const rightThigh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.4, 0.16), uniformMat);
  rightThigh.position.y = -0.2;
  rightThigh.castShadow = true;
  rightLegUpper.add(rightThigh);

  const rightLegLower = new THREE.Group();
  rightLegLower.position.set(0, -0.4, 0);
  rightLegUpper.add(rightLegLower);
  const rightShin = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.38, 0.15), uniformMat);
  rightShin.position.y = -0.19;
  rightShin.castShadow = true;
  rightLegLower.add(rightShin);

  // Kneepad
  const rightKneepad = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.05), darkMetalMat);
  rightKneepad.position.set(0, -0.05, 0.09);
  rightLegLower.add(rightKneepad);

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.24), bootMat);
  rightBoot.position.set(0, -0.38, 0.04);
  rightLegLower.add(rightBoot);

  // Current attached weapon
  let currentWeaponAttach: WeaponMeshAttachment | null = null;

  const attachWeapon = (weapon: WeaponDef, skin?: WeaponSkin) => {
    // Clear existing weapon
    while (weaponMount.children.length > 0) {
      weaponMount.remove(weaponMount.children[0]);
    }
    currentWeaponAttach = buildWeaponMesh(weapon, skin);
    weaponMount.add(currentWeaponAttach.group);
  };

  const getMuzzleWorldPosition = (): THREE.Vector3 => {
    if (!currentWeaponAttach) {
      const p = new THREE.Vector3();
      rightHand.getWorldPosition(p);
      return p;
    }
    const worldPos = new THREE.Vector3();
    currentWeaponAttach.group.localToWorld(worldPos.copy(currentWeaponAttach.muzzlePoint));
    return worldPos;
  };

  const setTeamIndicator = (newTeam: Team) => {
    teamMat.color.setHex(newTeam === 'ALPHA' ? 0x2563eb : 0xdc2626);
  };

  // --- PROCEDURAL ANIMATION CONTROLLER ---
  let animTime = Math.random() * 10;
  let recoilKick = 0;
  let hurtFlinch = 0;
  let meleeSwing = 0;
  let grenadeSwing = 0;

  const updateAnimation = (
    dt: number,
    state: {
      speed: number;
      isSprinting: boolean;
      isCrouching: boolean;
      isJumping: boolean;
      isGrounded: boolean;
      isAiming: boolean;
      isShooting: boolean;
      isReloading: boolean;
      reloadProgress: number;
      isMeleeAttacking: boolean;
      isThrowingGrenade: boolean;
      isHurt: boolean;
      isAlive: boolean;
      isVictory: boolean;
      pitch: number;
    }
  ) => {
    animTime += dt;

    if (!state.isAlive) {
      // Eliminated death animation: fall back to ground
      root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, -Math.PI / 2, dt * 8);
      root.position.y = THREE.MathUtils.lerp(root.position.y, 0.2, dt * 8);
      pelvis.rotation.set(0, 0, 0);
      rightArmUpper.rotation.set(0, 0, 0.4);
      leftArmUpper.rotation.set(0, 0, -0.4);
      return;
    }

    // Normal standing rotation
    root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, 0, dt * 10);

    // Recoil decay
    if (state.isShooting) {
      recoilKick = THREE.MathUtils.clamp(recoilKick + 0.35, 0, 0.8);
    } else {
      recoilKick = THREE.MathUtils.lerp(recoilKick, 0, dt * 12);
    }

    // Hurt flinch decay
    if (state.isHurt) {
      hurtFlinch = 0.4;
    } else {
      hurtFlinch = THREE.MathUtils.lerp(hurtFlinch, 0, dt * 8);
    }

    // Melee attack progress
    if (state.isMeleeAttacking) {
      meleeSwing = Math.min(1, meleeSwing + dt * 5);
    } else {
      meleeSwing = THREE.MathUtils.lerp(meleeSwing, 0, dt * 6);
    }

    // Grenade throw progress
    if (state.isThrowingGrenade) {
      grenadeSwing = Math.min(1, grenadeSwing + dt * 4);
    } else {
      grenadeSwing = THREE.MathUtils.lerp(grenadeSwing, 0, dt * 5);
    }

    // 1. CROUCHING / HEIGHT
    const targetPelvisY = state.isCrouching ? 0.55 : 0.95;
    pelvis.position.y = THREE.MathUtils.lerp(pelvis.position.y, targetPelvisY, dt * 10);

    // 2. LOCOMOTION (WALKING / SPRINTING / IDLE)
    const moveFreq = state.isSprinting ? 14 : 9;
    const stride = Math.sin(animTime * moveFreq) * Math.min(1, state.speed / 3);

    if (state.isGrounded) {
      // Leg strides
      leftLegUpper.rotation.x = stride * (state.isCrouching ? 0.4 : 0.85);
      rightLegUpper.rotation.x = -stride * (state.isCrouching ? 0.4 : 0.85);

      leftLegLower.rotation.x = stride > 0 ? stride * 0.7 : (state.isCrouching ? 0.6 : 0.1);
      rightLegLower.rotation.x = stride < 0 ? -stride * 0.7 : (state.isCrouching ? 0.6 : 0.1);

      // Subtle hip bounce
      pelvis.position.y += Math.abs(stride) * 0.04;
    } else {
      // In-air jump pose
      leftLegUpper.rotation.x = -0.5;
      rightLegUpper.rotation.x = -0.3;
      leftLegLower.rotation.x = 0.8;
      rightLegLower.rotation.x = 0.7;
    }

    // 3. TORSO PITCH (aiming up/down)
    torso.rotation.x = THREE.MathUtils.clamp(-state.pitch * 0.75 - recoilKick * 0.2 + hurtFlinch * 0.15, -1.1, 1.1);
    headGroup.rotation.x = -state.pitch * 0.25;

    // 4. ARMS & WEAPON HANDLING
    if (state.isVictory) {
      // Victory celebration: raise arms high!
      rightArmUpper.rotation.set(-Math.PI * 0.75, 0, 0.3);
      leftArmUpper.rotation.set(-Math.PI * 0.75, 0, -0.3);
      rightArmLower.rotation.set(-0.2, 0, 0);
      leftArmLower.rotation.set(-0.2, 0, 0);
    } else if (grenadeSwing > 0.05) {
      // Grenade throw windup and forward release arc
      const throwArc = Math.sin(grenadeSwing * Math.PI);
      rightArmUpper.rotation.set(-Math.PI * 0.6 + throwArc * 1.4, 0, 0.2);
      rightArmLower.rotation.set(-0.4 + throwArc * 0.5, 0, 0);
      leftArmUpper.rotation.set(0.2, 0, -0.2);
    } else if (meleeSwing > 0.05) {
      // Melee slash arc
      const slashArc = Math.sin(meleeSwing * Math.PI);
      rightArmUpper.rotation.set(-Math.PI * 0.4, slashArc * 1.2, 0.4);
      rightArmLower.rotation.set(-0.6, 0, 0);
      leftArmUpper.rotation.set(0.1, 0, -0.2);
    } else if (state.isReloading) {
      // Reload sequence: bring weapon down, left hand moves to magazine
      const p = state.reloadProgress;
      const magSlap = Math.sin(p * Math.PI * 2);

      rightArmUpper.rotation.set(-Math.PI * 0.3, 0.2, 0.1);
      rightArmLower.rotation.set(-0.7, 0, 0);

      leftArmUpper.rotation.set(-Math.PI * 0.35 + magSlap * 0.2, -0.4, 0.2);
      leftArmLower.rotation.set(-0.8 + magSlap * 0.3, 0, 0);
    } else if (state.isAiming) {
      // ADS precision stance: shoulders locked tight to sight line
      rightArmUpper.rotation.set(-Math.PI * 0.48 - recoilKick * 0.15, -0.25, 0.1);
      rightArmLower.rotation.set(-0.65, 0, 0);

      leftArmUpper.rotation.set(-Math.PI * 0.45, 0.35, -0.1);
      leftArmLower.rotation.set(-0.75, 0, 0);
    } else if (state.isSprinting && state.speed > 3) {
      // High-speed sprint: weapon lowered, aggressive body lean
      rightArmUpper.rotation.set(-Math.PI * 0.2 + stride * 0.3, 0.3, 0.1);
      rightArmLower.rotation.set(-0.4, 0, 0);

      leftArmUpper.rotation.set(stride * 0.6, 0, -0.2);
      leftArmLower.rotation.set(-0.3, 0, 0);
      torso.rotation.x += 0.25; // forward lean
    } else {
      // Tactical ready stance (hip fire / idle patrol)
      const breathing = Math.sin(animTime * 2.5) * 0.02;

      rightArmUpper.rotation.set(-Math.PI * 0.38 - recoilKick * 0.2 + breathing, -0.15, 0.15);
      rightArmLower.rotation.set(-0.6, 0, 0);

      leftArmUpper.rotation.set(-Math.PI * 0.32 + breathing, 0.4, -0.2);
      leftArmLower.rotation.set(-0.7, 0, 0);
    }
  };

  const dispose = () => {
    // Traverse and dispose geometries and materials
    root.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
    });
  };

  return {
    root,
    updateAnimation,
    attachWeapon,
    getMuzzleWorldPosition,
    setTeamIndicator,
    dispose
  };
}
