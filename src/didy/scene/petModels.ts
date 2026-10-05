import * as THREE from 'three';
import { AnimalCompanion } from '../types';

export interface AnimatedPetRig {
  group: THREE.Group;
  update: (
    dt: number,
    playerPos: THREE.Vector3,
    playerRotY: number,
    playerSpeed: number,
    isVictory: boolean
  ) => void;
  dispose: () => void;
}

export function buildPetModel(petDef: AnimalCompanion): AnimatedPetRig {
  const group = new THREE.Group();
  group.name = `Pet_${petDef.id}`;
  group.scale.setScalar(petDef.scale);

  const mainMat = new THREE.MeshLambertMaterial({ color: petDef.color });
  const secMat = new THREE.MeshLambertMaterial({ color: petDef.secondaryColor });
  const blackMat = new THREE.MeshLambertMaterial({ color: 0x18181b });

  const root = new THREE.Group();
  group.add(root);

  const body = new THREE.Group();
  root.add(body);

  const head = new THREE.Group();
  body.add(head);

  let tail: THREE.Mesh | null = null;
  const legs: THREE.Mesh[] = [];

  // --- 3D ANIMAL SPECIES MESHES ---
  switch (petDef.species) {
    case 'dog': {
      // Friendly puppy
      const torsoGeo = new THREE.CapsuleGeometry(0.2, 0.4, 6, 8);
      const torsoMesh = new THREE.Mesh(torsoGeo, mainMat);
      torsoMesh.rotation.x = Math.PI / 2;
      torsoMesh.position.y = 0.28;
      body.add(torsoMesh);

      // Head & Floppy ears
      head.position.set(0, 0.48, 0.24);
      const headGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const headMesh = new THREE.Mesh(headGeo, mainMat);
      head.add(headMesh);

      // Black snout
      const snoutGeo = new THREE.ConeGeometry(0.08, 0.12, 6);
      const snout = new THREE.Mesh(snoutGeo, blackMat);
      snout.rotation.x = Math.PI / 2;
      snout.position.set(0, -0.04, 0.2);
      head.add(snout);

      // Floppy ears
      const earGeo = new THREE.BoxGeometry(0.06, 0.18, 0.08);
      const lEar = new THREE.Mesh(earGeo, secMat);
      lEar.position.set(-0.16, 0.04, 0);
      head.add(lEar);
      const rEar = new THREE.Mesh(earGeo, secMat);
      rEar.position.set(0.16, 0.04, 0);
      head.add(rEar);

      // Tail
      const tailGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.25, 6);
      tail = new THREE.Mesh(tailGeo, mainMat);
      tail.position.set(0, 0.35, -0.25);
      tail.rotation.x = -Math.PI / 4;
      body.add(tail);

      // 4 Legs
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.24, 6);
      [
        [-0.12, 0.12, 0.15],
        [0.12, 0.12, 0.15],
        [-0.12, 0.12, -0.15],
        [0.12, 0.12, -0.15]
      ].forEach(pos => {
        const leg = new THREE.Mesh(legGeo, secMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        legs.push(leg);
        body.add(leg);
      });
      break;
    }

    case 'panda': {
      // Chubby panda
      const bodyGeo = new THREE.SphereGeometry(0.28, 8, 8);
      const bodyMesh = new THREE.Mesh(bodyGeo, secMat);
      bodyMesh.position.y = 0.32;
      body.add(bodyMesh);

      head.position.set(0, 0.52, 0.16);
      const headGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const headMesh = new THREE.Mesh(headGeo, mainMat);
      head.add(headMesh);

      // Black ears
      const earGeo = new THREE.SphereGeometry(0.06, 6, 6);
      const le = new THREE.Mesh(earGeo, secMat);
      le.position.set(-0.16, 0.16, 0);
      head.add(le);
      const re = new THREE.Mesh(earGeo, secMat);
      re.position.set(0.16, 0.16, 0);
      head.add(re);

      // 4 stubby legs
      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 6);
      [
        [-0.14, 0.11, 0.12],
        [0.14, 0.11, 0.12],
        [-0.14, 0.11, -0.12],
        [0.14, 0.11, -0.12]
      ].forEach(pos => {
        const leg = new THREE.Mesh(legGeo, secMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        legs.push(leg);
        body.add(leg);
      });
      break;
    }

    case 'cat':
    case 'fox':
    case 'wolf':
    case 'rabbit':
    case 'bird':
    default: {
      // Cute generic 4-legged pet
      const torsoGeo = new THREE.CapsuleGeometry(0.18, 0.35, 6, 8);
      const torsoMesh = new THREE.Mesh(torsoGeo, mainMat);
      torsoMesh.rotation.x = Math.PI / 2;
      torsoMesh.position.y = 0.25;
      body.add(torsoMesh);

      head.position.set(0, 0.44, 0.2);
      const headGeo = new THREE.SphereGeometry(0.16, 8, 8);
      const headMesh = new THREE.Mesh(headGeo, mainMat);
      head.add(headMesh);

      const earGeo = new THREE.ConeGeometry(0.05, 0.14, 6);
      const le = new THREE.Mesh(earGeo, secMat);
      le.position.set(-0.1, 0.14, 0);
      head.add(le);
      const re = new THREE.Mesh(earGeo, secMat);
      re.position.set(0.1, 0.14, 0);
      head.add(re);

      // Tail
      const tailGeo = new THREE.CylinderGeometry(0.025, 0.05, 0.3, 6);
      tail = new THREE.Mesh(tailGeo, mainMat);
      tail.position.set(0, 0.3, -0.22);
      tail.rotation.x = -Math.PI / 3;
      body.add(tail);

      const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.22, 6);
      [
        [-0.11, 0.11, 0.12],
        [0.11, 0.11, 0.12],
        [-0.11, 0.11, -0.12],
        [0.11, 0.11, -0.12]
      ].forEach(pos => {
        const leg = new THREE.Mesh(legGeo, secMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        legs.push(leg);
        body.add(leg);
      });
      break;
    }
  }

  // --- SMART PET FOLLOW & ANIMATION LOGIC ---
  let petAnimTime = Math.random() * 5;
  const currentPos = new THREE.Vector3(0, 0, 0);

  const update = (
    dt: number,
    playerPos: THREE.Vector3,
    playerRotY: number,
    playerSpeed: number,
    isVictory: boolean
  ) => {
    petAnimTime += dt;

    // Follow offset: runs beside player (slightly to the right and back)
    const offsetX = Math.cos(playerRotY) * 1.2 + Math.sin(playerRotY) * -0.8;
    const offsetZ = -Math.sin(playerRotY) * 1.2 + Math.cos(playerRotY) * -0.8;
    const targetPos = new THREE.Vector3(
      playerPos.x + offsetX,
      playerPos.y,
      playerPos.z + offsetZ
    );

    // Smooth movement toward target
    currentPos.lerp(targetPos, Math.min(1, dt * 6.5));
    group.position.copy(currentPos);

    // Look toward player or movement direction
    const moveDist = currentPos.distanceTo(targetPos);
    if (moveDist > 0.1) {
      const angle = Math.atan2(targetPos.x - currentPos.x, targetPos.z - currentPos.z);
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, angle, dt * 8);
    } else {
      group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, playerRotY, dt * 4);
    }

    if (isVictory) {
      // Victory celebration: happy spinning & jumping!
      root.rotation.y += dt * 8;
      root.position.y = Math.abs(Math.sin(petAnimTime * 8)) * 0.4;
      if (tail) tail.rotation.z = Math.sin(petAnimTime * 20) * 0.8;
      return;
    }

    // Walking / Running leg animations
    const isMoving = moveDist > 0.15 || playerSpeed > 0.5;
    if (isMoving) {
      const stride = Math.sin(petAnimTime * 14) * 0.4;
      legs.forEach((leg, i) => {
        leg.rotation.x = i % 2 === 0 ? stride : -stride;
      });
      // Happy tail wag
      if (tail) tail.rotation.y = Math.sin(petAnimTime * 18) * 0.6;
      body.position.y = Math.abs(Math.sin(petAnimTime * 14)) * 0.04;
    } else {
      // Idle sitting / waiting pose
      legs.forEach(leg => {
        leg.rotation.x = 0;
      });
      if (tail) tail.rotation.y = Math.sin(petAnimTime * 4) * 0.2;
      body.position.y = 0;
    }
  };

  const dispose = () => {
    group.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
      }
    });
  };

  return {
    group,
    update,
    dispose
  };
}
