import * as THREE from 'three';
import { RegularShowCharacter } from '../types';

export interface AnimatedCharacterRig {
  group: THREE.Group;
  updateAnimation: (
    dt: number,
    state: {
      speed: number;
      isGrounded: boolean;
      isGliding: boolean;
      isFreefalling?: boolean;
      isCrouching?: boolean;
      isJumping: boolean;
      isVictory: boolean;
      isDefeat: boolean;
      isEmoting: boolean;
      emoteName?: string;
    }
  ) => void;
  gliderMesh: THREE.Group;
  setGliderVisible: (visible: boolean) => void;
  dispose: () => void;
}

export function buildCharacterModel(charDef: RegularShowCharacter): AnimatedCharacterRig {
  const group = new THREE.Group();
  group.name = `Char_${charDef.id}`;

  // Common materials
  const mainMat = new THREE.MeshLambertMaterial({ color: charDef.color });
  const accentMat = new THREE.MeshLambertMaterial({ color: charDef.accentColor });
  const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const blackMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
  const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

  // Skeletal Nodes
  const root = new THREE.Group();
  group.add(root);

  const pelvis = new THREE.Group();
  root.add(pelvis);

  const torso = new THREE.Group();
  pelvis.add(torso);

  const head = new THREE.Group();
  torso.add(head);

  const leftArm = new THREE.Group();
  torso.add(leftArm);

  const rightArm = new THREE.Group();
  torso.add(rightArm);

  const leftLeg = new THREE.Group();
  pelvis.add(leftLeg);

  const rightLeg = new THREE.Group();
  pelvis.add(rightLeg);

  let tail: THREE.Group | null = null;
  let gumballGroup: THREE.Group | null = null;

  // --- CHARACTER-SPECIFIC 3D GEOMETRY ---
  switch (charDef.id) {
    case 'mordecai': {
      // Slender tall blue jay
      pelvis.position.y = 1.05;

      // Torso with white throat bib
      const bodyGeo = new THREE.CapsuleGeometry(0.24, 0.7, 8, 12);
      const bodyMesh = new THREE.Mesh(bodyGeo, mainMat);
      bodyMesh.position.y = 0.35;
      torso.add(bodyMesh);

      // White chest bib
      const bibGeo = new THREE.CapsuleGeometry(0.2, 0.45, 8, 8);
      const bibMesh = new THREE.Mesh(bibGeo, whiteMat);
      bibMesh.position.set(0, 0.38, 0.1);
      bibMesh.scale.set(0.9, 0.9, 0.4);
      torso.add(bibMesh);

      // Head & Crest Feathers
      head.position.set(0, 0.85, 0);
      const headGeo = new THREE.SphereGeometry(0.25, 12, 12);
      const headMesh = new THREE.Mesh(headGeo, mainMat);
      head.add(headMesh);

      // Distinctive back head crest
      const crestGeo = new THREE.ConeGeometry(0.14, 0.4, 8);
      const crestMesh = new THREE.Mesh(crestGeo, mainMat);
      crestMesh.rotation.x = -Math.PI / 3;
      crestMesh.position.set(0, 0.1, -0.22);
      head.add(crestMesh);

      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const leftEye = new THREE.Mesh(eyeGeo, whiteMat);
      leftEye.position.set(-0.1, 0.06, 0.19);
      head.add(leftEye);
      const rightEye = new THREE.Mesh(eyeGeo, whiteMat);
      rightEye.position.set(0.1, 0.06, 0.19);
      head.add(rightEye);

      const pupilGeo = new THREE.SphereGeometry(0.035, 6, 6);
      const lp = new THREE.Mesh(pupilGeo, eyePupilMat);
      lp.position.set(-0.1, 0.06, 0.26);
      head.add(lp);
      const rp = new THREE.Mesh(pupilGeo, eyePupilMat);
      rp.position.set(0.1, 0.06, 0.26);
      head.add(rp);

      // Curved black beak
      const beakGeo = new THREE.ConeGeometry(0.09, 0.32, 8);
      const beakMesh = new THREE.Mesh(beakGeo, blackMat);
      beakMesh.rotation.x = Math.PI / 2;
      beakMesh.position.set(0, -0.04, 0.32);
      head.add(beakMesh);

      // Arms with wrist stripes
      leftArm.position.set(-0.32, 0.6, 0);
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.65, 8);
      const lArmMesh = new THREE.Mesh(armGeo, mainMat);
      lArmMesh.position.y = -0.32;
      leftArm.add(lArmMesh);
      // Stripe
      const stripeGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.08, 8);
      const lStripe = new THREE.Mesh(stripeGeo, blackMat);
      lStripe.position.y = -0.45;
      leftArm.add(lStripe);

      rightArm.position.set(0.32, 0.6, 0);
      const rArmMesh = new THREE.Mesh(armGeo, mainMat);
      rArmMesh.position.y = -0.32;
      rightArm.add(rArmMesh);
      const rStripe = new THREE.Mesh(stripeGeo, blackMat);
      rStripe.position.y = -0.45;
      rightArm.add(rStripe);

      // Slender bird legs
      leftLeg.position.set(-0.14, 0, 0);
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8);
      const lLegMesh = new THREE.Mesh(legGeo, blackMat);
      lLegMesh.position.y = -0.42;
      leftLeg.add(lLegMesh);
      // Three-toed foot
      const footGeo = new THREE.BoxGeometry(0.12, 0.04, 0.22);
      const lFoot = new THREE.Mesh(footGeo, blackMat);
      lFoot.position.set(0, -0.85, 0.06);
      leftLeg.add(lFoot);

      rightLeg.position.set(0.14, 0, 0);
      const rLegMesh = new THREE.Mesh(legGeo, blackMat);
      rLegMesh.position.y = -0.42;
      rightLeg.add(rLegMesh);
      const rFoot = new THREE.Mesh(footGeo, blackMat);
      rFoot.position.set(0, -0.85, 0.06);
      rightLeg.add(rFoot);

      // Tail feathers
      tail = new THREE.Group();
      tail.position.set(0, 0.1, -0.22);
      const tailGeo = new THREE.BoxGeometry(0.24, 0.04, 0.45);
      const tailMesh = new THREE.Mesh(tailGeo, mainMat);
      tailMesh.position.z = -0.22;
      tailMesh.rotation.x = -0.2;
      tail.add(tailMesh);
      pelvis.add(tail);
      break;
    }

    case 'rigby': {
      // Short spunky raccoon
      pelvis.position.y = 0.65;

      // Pear-shaped brown body
      const bodyGeo = new THREE.CapsuleGeometry(0.26, 0.42, 8, 10);
      const bodyMesh = new THREE.Mesh(bodyGeo, mainMat);
      bodyMesh.position.y = 0.22;
      torso.add(bodyMesh);

      // Light belly patch
      const bellyGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const bellyMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
      const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
      bellyMesh.position.set(0, 0.2, 0.08);
      bellyMesh.scale.set(0.85, 1.1, 0.5);
      torso.add(bellyMesh);

      // Head
      head.position.set(0, 0.52, 0);
      const headGeo = new THREE.SphereGeometry(0.24, 10, 10);
      const headMesh = new THREE.Mesh(headGeo, mainMat);
      head.add(headMesh);

      // Dark bandit eye mask
      const maskGeo = new THREE.BoxGeometry(0.38, 0.12, 0.1);
      const maskMesh = new THREE.Mesh(maskGeo, blackMat);
      maskMesh.position.set(0, 0.03, 0.18);
      head.add(maskMesh);

      // Eyes & pupils
      const eyeGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const leftEye = new THREE.Mesh(eyeGeo, whiteMat);
      leftEye.position.set(-0.09, 0.03, 0.2);
      head.add(leftEye);
      const rightEye = new THREE.Mesh(eyeGeo, whiteMat);
      rightEye.position.set(0.09, 0.03, 0.2);
      head.add(rightEye);

      const pupilGeo = new THREE.SphereGeometry(0.032, 6, 6);
      const lp = new THREE.Mesh(pupilGeo, eyePupilMat);
      lp.position.set(-0.09, 0.03, 0.26);
      head.add(lp);
      const rp = new THREE.Mesh(pupilGeo, eyePupilMat);
      rp.position.set(0.09, 0.03, 0.26);
      head.add(rp);

      // Raccoon ears
      const earGeo = new THREE.SphereGeometry(0.07, 6, 6);
      const leftEar = new THREE.Mesh(earGeo, blackMat);
      leftEar.position.set(-0.16, 0.22, 0);
      head.add(leftEar);
      const rightEar = new THREE.Mesh(earGeo, blackMat);
      rightEar.position.set(0.16, 0.22, 0);
      head.add(rightEar);

      // Pointed snout
      const snoutGeo = new THREE.ConeGeometry(0.07, 0.16, 8);
      const snoutMesh = new THREE.Mesh(snoutGeo, blackMat);
      snoutMesh.rotation.x = Math.PI / 2;
      snoutMesh.position.set(0, -0.06, 0.28);
      head.add(snoutMesh);

      // Arms
      leftArm.position.set(-0.28, 0.38, 0);
      const armGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.42, 8);
      const lArm = new THREE.Mesh(armGeo, mainMat);
      lArm.position.y = -0.21;
      leftArm.add(lArm);

      rightArm.position.set(0.28, 0.38, 0);
      const rArm = new THREE.Mesh(armGeo, mainMat);
      rArm.position.y = -0.21;
      rightArm.add(rArm);

      // Short legs
      leftLeg.position.set(-0.13, 0, 0);
      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
      const lLeg = new THREE.Mesh(legGeo, mainMat);
      lLeg.position.y = -0.22;
      leftLeg.add(lLeg);

      rightLeg.position.set(0.13, 0, 0);
      const rLeg = new THREE.Mesh(legGeo, mainMat);
      rLeg.position.y = -0.22;
      rightLeg.add(rLeg);

      // Huge fluffy striped raccoon tail
      tail = new THREE.Group();
      tail.position.set(0, 0.1, -0.2);
      const tailSegmentCount = 5;
      for (let s = 0; s < tailSegmentCount; s++) {
        const segGeo = new THREE.CylinderGeometry(0.09 - s * 0.01, 0.1 - s * 0.01, 0.12, 8);
        const segMat = s % 2 === 0 ? blackMat : mainMat;
        const seg = new THREE.Mesh(segGeo, segMat);
        seg.rotation.x = -Math.PI / 2;
        seg.position.z = -s * 0.12;
        tail.add(seg);
      }
      pelvis.add(tail);
      break;
    }

    case 'skips': {
      // Muscular white yeti with denim pants
      pelvis.position.y = 0.95;

      // Heavy muscular white fur torso
      const chestGeo = new THREE.BoxGeometry(0.68, 0.55, 0.42);
      const chestMesh = new THREE.Mesh(chestGeo, whiteMat);
      chestMesh.position.y = 0.35;
      torso.add(chestMesh);

      // Head with rugged jaw
      head.position.set(0, 0.72, 0);
      const headGeo = new THREE.BoxGeometry(0.32, 0.34, 0.32);
      const headMesh = new THREE.Mesh(headGeo, whiteMat);
      head.add(headMesh);

      // Dark face plate & eyes
      const faceGeo = new THREE.BoxGeometry(0.24, 0.18, 0.04);
      const faceMesh = new THREE.Mesh(faceGeo, new THREE.MeshLambertMaterial({ color: 0x94a3b8 }));
      faceMesh.position.set(0, 0, 0.16);
      head.add(faceMesh);

      const eyeGeo = new THREE.SphereGeometry(0.045, 6, 6);
      const lEye = new THREE.Mesh(eyeGeo, blackMat);
      lEye.position.set(-0.06, 0.03, 0.185);
      head.add(lEye);
      const rEye = new THREE.Mesh(eyeGeo, blackMat);
      rEye.position.set(0.06, 0.03, 0.185);
      head.add(rEye);

      // Muscular Arms with clenched fists
      leftArm.position.set(-0.46, 0.52, 0);
      const bicepGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.6, 8);
      const lArm = new THREE.Mesh(bicepGeo, whiteMat);
      lArm.position.y = -0.3;
      leftArm.add(lArm);

      rightArm.position.set(0.46, 0.52, 0);
      const rArm = new THREE.Mesh(bicepGeo, whiteMat);
      rArm.position.y = -0.3;
      rightArm.add(rArm);

      // Denim Jeans Legs
      const pantsMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
      leftLeg.position.set(-0.18, 0, 0);
      const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.8, 8);
      const lLeg = new THREE.Mesh(legGeo, pantsMat);
      lLeg.position.y = -0.4;
      leftLeg.add(lLeg);

      rightLeg.position.set(0.18, 0, 0);
      const rLeg = new THREE.Mesh(legGeo, pantsMat);
      rLeg.position.y = -0.4;
      rightLeg.add(rLeg);
      break;
    }

    case 'muscle_man': {
      // Green squat muscular character with messy dark hair
      pelvis.position.y = 0.75;

      const skinMat = new THREE.MeshLambertMaterial({ color: 0x65a30d });
      const shirtMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
      const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });

      // Torso in gray shirt
      const bodyGeo = new THREE.SphereGeometry(0.36, 10, 10);
      const bodyMesh = new THREE.Mesh(bodyGeo, shirtMat);
      bodyMesh.scale.set(1.1, 1.2, 0.95);
      bodyMesh.position.y = 0.28;
      torso.add(bodyMesh);

      // Round green head
      head.position.set(0, 0.68, 0);
      const headGeo = new THREE.SphereGeometry(0.26, 10, 10);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      head.add(headMesh);

      // Wild messy dark hair
      const hairGeo = new THREE.SphereGeometry(0.28, 8, 8);
      const hairMesh = new THREE.Mesh(hairGeo, blackMat);
      hairMesh.position.set(0, 0.08, -0.06);
      hairMesh.scale.set(1.1, 1.2, 1.2);
      head.add(hairMesh);

      // Eyes & wild wide grin
      const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
      const lEye = new THREE.Mesh(eyeGeo, whiteMat);
      lEye.position.set(-0.08, 0.04, 0.23);
      head.add(lEye);
      const rEye = new THREE.Mesh(eyeGeo, whiteMat);
      rEye.position.set(0.08, 0.04, 0.23);
      head.add(rEye);

      // Thick green arms
      leftArm.position.set(-0.4, 0.44, 0);
      const armGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.5, 8);
      const lArm = new THREE.Mesh(armGeo, shirtMat);
      lArm.position.y = -0.25;
      leftArm.add(lArm);

      rightArm.position.set(0.4, 0.44, 0);
      const rArm = new THREE.Mesh(armGeo, shirtMat);
      rArm.position.y = -0.25;
      rightArm.add(rArm);

      // Dark blue legs
      leftLeg.position.set(-0.16, 0, 0);
      const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.55, 8);
      const lLeg = new THREE.Mesh(legGeo, pantsMat);
      lLeg.position.y = -0.27;
      leftLeg.add(lLeg);

      rightLeg.position.set(0.16, 0, 0);
      const rLeg = new THREE.Mesh(legGeo, pantsMat);
      rLeg.position.y = -0.27;
      rightLeg.add(rLeg);
      break;
    }

    case 'hifive_ghost': {
      // Translucent floating ghostly body with hand on head!
      pelvis.position.y = 1.0;

      const ghostMat = new THREE.MeshLambertMaterial({
        color: 0xa5f3fc,
        transparent: true,
        opacity: 0.82
      });

      // Smooth rounded ghost mantle
      const ghostGeo = new THREE.CapsuleGeometry(0.3, 0.6, 8, 12);
      const ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
      ghostMesh.position.y = 0.35;
      torso.add(ghostMesh);

      // Ghost Eyes & smile
      const eyeGeo = new THREE.SphereGeometry(0.05, 6, 6);
      const lEye = new THREE.Mesh(eyeGeo, blackMat);
      lEye.position.set(-0.09, 0.5, 0.28);
      torso.add(lEye);
      const rEye = new THREE.Mesh(eyeGeo, blackMat);
      rEye.position.set(0.09, 0.5, 0.28);
      torso.add(rEye);

      // Iconic High-Five Hand growing out of the head!
      const handArmGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.24, 6);
      const handArmMesh = new THREE.Mesh(handArmGeo, ghostMat);
      handArmMesh.position.set(0, 0.82, 0);
      torso.add(handArmMesh);

      // Palm and spread fingers
      const palmGeo = new THREE.BoxGeometry(0.16, 0.14, 0.05);
      const palmMesh = new THREE.Mesh(palmGeo, ghostMat);
      palmMesh.position.set(0, 0.98, 0);
      torso.add(palmMesh);

      for (let f = 0; f < 5; f++) {
        const fingerGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.1, 6);
        const finger = new THREE.Mesh(fingerGeo, ghostMat);
        finger.position.set((f - 2) * 0.038, 1.08, 0);
        torso.add(finger);
      }
      break;
    }

    case 'benson': {
      // Gumball machine! Glass globe head filled with bouncing multi-color gumballs
      pelvis.position.y = 0.85;

      const redMat = new THREE.MeshLambertMaterial({ color: 0xdc2626 });
      const metalMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        roughness: 0.1,
        transmission: 0.6
      });

      // Red metal cylindrical dispenser torso
      const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.5, 12);
      const bodyMesh = new THREE.Mesh(bodyGeo, redMat);
      bodyMesh.position.y = 0.25;
      torso.add(bodyMesh);

      // Dispenser crank knob on chest
      const knobGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8);
      const knobMesh = new THREE.Mesh(knobGeo, metalMat);
      knobMesh.rotation.x = Math.PI / 2;
      knobMesh.position.set(0, 0.22, 0.27);
      torso.add(knobMesh);

      // Transparent Glass Dome Head
      head.position.set(0, 0.72, 0);
      const domeGeo = new THREE.SphereGeometry(0.28, 12, 12);
      const domeMesh = new THREE.Mesh(domeGeo, glassMat);
      head.add(domeMesh);

      // Multi-colored gumballs inside dome!
      gumballGroup = new THREE.Group();
      const gumballColors = [0xef4444, 0x3b82f6, 0xfacc15, 0x10b981, 0xa855f7, 0xf97316];
      for (let i = 0; i < 18; i++) {
        const ballMat = new THREE.MeshLambertMaterial({
          color: gumballColors[i % gumballColors.length]
        });
        const ballGeo = new THREE.SphereGeometry(0.05, 6, 6);
        const ball = new THREE.Mesh(ballGeo, ballMat);
        ball.position.set(
          (Math.random() - 0.5) * 0.32,
          -0.12 + Math.random() * 0.2,
          (Math.random() - 0.5) * 0.32
        );
        gumballGroup.add(ball);
      }
      head.add(gumballGroup);

      // Red metal cap on top of dome
      const capGeo = new THREE.CylinderGeometry(0.16, 0.22, 0.08, 12);
      const capMesh = new THREE.Mesh(capGeo, redMat);
      capMesh.position.set(0, 0.3, 0);
      head.add(capMesh);

      // Eyes on the outside of glass dome
      const eyeGeo = new THREE.SphereGeometry(0.055, 6, 6);
      const lEye = new THREE.Mesh(eyeGeo, whiteMat);
      lEye.position.set(-0.09, 0.04, 0.26);
      head.add(lEye);
      const rEye = new THREE.Mesh(eyeGeo, whiteMat);
      rEye.position.set(0.09, 0.04, 0.26);
      head.add(rEye);

      // Angled metal arms & legs
      leftArm.position.set(-0.32, 0.42, 0);
      const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.55, 8);
      const lArm = new THREE.Mesh(armGeo, metalMat);
      lArm.position.y = -0.27;
      leftArm.add(lArm);

      rightArm.position.set(0.32, 0.42, 0);
      const rArm = new THREE.Mesh(armGeo, metalMat);
      rArm.position.y = -0.27;
      rightArm.add(rArm);

      leftLeg.position.set(-0.13, 0, 0);
      const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.65, 8);
      const lLeg = new THREE.Mesh(legGeo, redMat);
      lLeg.position.y = -0.32;
      leftLeg.add(lLeg);

      rightLeg.position.set(0.13, 0, 0);
      const rLeg = new THREE.Mesh(legGeo, redMat);
      rLeg.position.y = -0.32;
      rightLeg.add(rLeg);
      break;
    }

    case 'pops': {
      // Giant lollipop head gentleman in tuxedo and top hat
      pelvis.position.y = 0.8;

      const suitMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
      const skinMat = new THREE.MeshLambertMaterial({ color: 0xfed7aa });

      // Frail slender torso in black tuxedo
      const bodyGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.45, 8);
      const bodyMesh = new THREE.Mesh(bodyGeo, suitMat);
      bodyMesh.position.y = 0.22;
      torso.add(bodyMesh);

      // White tuxedo collar & red bowtie
      const tieMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
      const tieGeo = new THREE.BoxGeometry(0.09, 0.04, 0.04);
      const tieMesh = new THREE.Mesh(tieGeo, tieMat);
      tieMesh.position.set(0, 0.4, 0.14);
      torso.add(tieMesh);

      // Giant Round Lollipop Head!
      head.position.set(0, 0.78, 0);
      const headGeo = new THREE.SphereGeometry(0.38, 14, 14);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      head.add(headMesh);

      // Tiny curved gentleman's mustache
      const stacheMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const stacheGeo = new THREE.TorusGeometry(0.07, 0.02, 6, 8, Math.PI);
      const stacheMesh = new THREE.Mesh(stacheGeo, stacheMat);
      stacheMesh.rotation.z = Math.PI;
      stacheMesh.position.set(0, -0.06, 0.37);
      head.add(stacheMesh);

      // Tiny cartoon black eyes
      const eyeGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const lEye = new THREE.Mesh(eyeGeo, blackMat);
      lEye.position.set(-0.1, 0.08, 0.36);
      head.add(lEye);
      const rEye = new THREE.Mesh(eyeGeo, blackMat);
      rEye.position.set(0.1, 0.08, 0.36);
      head.add(rEye);

      // Small black Victorian top hat
      const brimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.02, 10);
      const brim = new THREE.Mesh(brimGeo, suitMat);
      brim.position.set(0, 0.4, 0);
      head.add(brim);

      const crownGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.22, 10);
      const crown = new THREE.Mesh(crownGeo, suitMat);
      crown.position.set(0, 0.52, 0);
      head.add(crown);

      // Thin arms
      leftArm.position.set(-0.25, 0.38, 0);
      const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6);
      const lArm = new THREE.Mesh(armGeo, suitMat);
      lArm.position.y = -0.25;
      leftArm.add(lArm);

      rightArm.position.set(0.25, 0.38, 0);
      const rArm = new THREE.Mesh(armGeo, suitMat);
      rArm.position.y = -0.25;
      rightArm.add(rArm);

      // Skinny legs
      leftLeg.position.set(-0.1, 0, 0);
      const legGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.65, 6);
      const lLeg = new THREE.Mesh(legGeo, suitMat);
      lLeg.position.y = -0.32;
      leftLeg.add(lLeg);

      rightLeg.position.set(0.1, 0, 0);
      const rLeg = new THREE.Mesh(legGeo, suitMat);
      rLeg.position.y = -0.32;
      rightLeg.add(rLeg);
      break;
    }

    default: {
      // Margaret / Eileen / Fallback
      pelvis.position.y = 0.9;
      const bGeo = new THREE.CapsuleGeometry(0.22, 0.5, 8, 8);
      const bMesh = new THREE.Mesh(bGeo, mainMat);
      bMesh.position.y = 0.3;
      torso.add(bMesh);

      head.position.set(0, 0.7, 0);
      const hGeo = new THREE.SphereGeometry(0.22, 8, 8);
      const hMesh = new THREE.Mesh(hGeo, mainMat);
      head.add(hMesh);
      break;
    }
  }

  // --- GLIDER MESH FOR AIR-DROP MODE ---
  const gliderMesh = new THREE.Group();
  const wingGeo = new THREE.BoxGeometry(2.6, 0.06, 0.9);
  const wingMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8 });
  const wing = new THREE.Mesh(wingGeo, wingMat);
  wing.position.set(0, 1.8, 0.2);
  gliderMesh.add(wing);

  // Struts
  const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6);
  const strutMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
  const ls = new THREE.Mesh(strutGeo, strutMat);
  ls.position.set(-0.6, 1.35, 0.1);
  ls.rotation.z = -0.3;
  gliderMesh.add(ls);
  const rs = new THREE.Mesh(strutGeo, strutMat);
  rs.position.set(0.6, 1.35, 0.1);
  rs.rotation.z = 0.3;
  gliderMesh.add(rs);

  gliderMesh.visible = false;
  group.add(gliderMesh);

  // --- SMOOTH ANIMATION STATE ---
  let walkCyclePhase = 0;
  let idleTime = Math.random() * 5;
  let wasInAir = false;
  let landingRecovery = 0; // 0 to 1 impact absorption
  let currentSpeedBlend = 0;

  // Target bone rotations for silky-smooth dampening
  const curRot = {
    leftLegX: 0,
    rightLegX: 0,
    leftLegZ: 0,
    rightLegZ: 0,
    leftArmX: 0,
    rightArmX: 0,
    leftArmZ: 0,
    rightArmZ: 0,
    torsoX: 0,
    pelvisYOffset: 0
  };

  const updateAnimation = (
    dt: number,
    state: {
      speed: number;
      isGrounded: boolean;
      isGliding: boolean;
      isFreefalling?: boolean;
      isCrouching?: boolean;
      isJumping: boolean;
      isVictory: boolean;
      isDefeat: boolean;
      isEmoting: boolean;
      emoteName?: string;
    }
  ) => {
    idleTime += dt;

    // Detect landing impact
    if (state.isGrounded && wasInAir) {
      landingRecovery = 0.35; // absorb impact
    }
    wasInAir = !state.isGrounded && !state.isGliding && !state.isFreefalling;
    if (landingRecovery > 0) {
      landingRecovery = Math.max(0, landingRecovery - dt * 2.5);
    }

    // Glider visibility in Drop Mode
    gliderMesh.visible = state.isGliding;

    // 1. FREEFALL DIVE POSE (High-speed sky diving before glider)
    if (state.isFreefalling) {
      const blendRate = Math.min(1, dt * 12);
      curRot.leftArmX = THREE.MathUtils.lerp(curRot.leftArmX, Math.PI * 0.45, blendRate);
      curRot.rightArmX = THREE.MathUtils.lerp(curRot.rightArmX, Math.PI * 0.45, blendRate);
      curRot.leftArmZ = THREE.MathUtils.lerp(curRot.leftArmZ, 0.4, blendRate);
      curRot.rightArmZ = THREE.MathUtils.lerp(curRot.rightArmZ, -0.4, blendRate);
      curRot.leftLegX = THREE.MathUtils.lerp(curRot.leftLegX, 0.25, blendRate);
      curRot.rightLegX = THREE.MathUtils.lerp(curRot.rightLegX, 0.25, blendRate);
      curRot.torsoX = THREE.MathUtils.lerp(curRot.torsoX, 0.55, blendRate);

      leftArm.rotation.set(curRot.leftArmX, 0, curRot.leftArmZ);
      rightArm.rotation.set(curRot.rightArmX, 0, curRot.rightArmZ);
      leftLeg.rotation.set(curRot.leftLegX, 0, 0.08);
      rightLeg.rotation.set(curRot.rightLegX, 0, -0.08);
      torso.rotation.x = curRot.torsoX;
      head.rotation.x = -0.45; // Looking ahead at the ground
      if (tail) tail.rotation.x = 0.5;
      return;
    }

    // 2. GLIDER SOARING POSE
    if (state.isGliding) {
      const blendRate = Math.min(1, dt * 10);
      curRot.leftArmX = THREE.MathUtils.lerp(curRot.leftArmX, -Math.PI * 0.72, blendRate);
      curRot.rightArmX = THREE.MathUtils.lerp(curRot.rightArmX, -Math.PI * 0.72, blendRate);
      curRot.leftArmZ = THREE.MathUtils.lerp(curRot.leftArmZ, 0.25, blendRate);
      curRot.rightArmZ = THREE.MathUtils.lerp(curRot.rightArmZ, -0.25, blendRate);
      curRot.leftLegX = THREE.MathUtils.lerp(curRot.leftLegX, 0.35, blendRate);
      curRot.rightLegX = THREE.MathUtils.lerp(curRot.rightLegX, 0.35, blendRate);
      curRot.torsoX = THREE.MathUtils.lerp(curRot.torsoX, 0.32, blendRate);

      leftArm.rotation.set(curRot.leftArmX, 0, curRot.leftArmZ);
      rightArm.rotation.set(curRot.rightArmX, 0, curRot.rightArmZ);
      leftLeg.rotation.set(curRot.leftLegX, 0, 0);
      rightLeg.rotation.set(curRot.rightLegX, 0, 0);
      torso.rotation.x = curRot.torsoX;
      if (tail) tail.rotation.x = 0.35;
      return;
    }

    if (state.isVictory) {
      // Smooth victory celebration
      const pump = Math.sin(idleTime * 10);
      curRot.leftArmX = -Math.PI * 0.78 + pump * 0.3;
      curRot.rightArmX = -Math.PI * 0.78 - pump * 0.3;
      curRot.torsoX = 0;
      leftArm.rotation.set(curRot.leftArmX, 0, -0.25);
      rightArm.rotation.set(curRot.rightArmX, 0, 0.25);
      head.rotation.y = Math.sin(idleTime * 5) * 0.25;
      pelvis.position.y = charDef.id === 'mordecai' ? 1.05 + Math.abs(Math.sin(idleTime * 8)) * 0.08 : 0.8;
      return;
    }

    if (state.isDefeat) {
      curRot.leftArmX = 0.15;
      curRot.rightArmX = 0.15;
      curRot.torsoX = 0.22;
      leftArm.rotation.set(curRot.leftArmX, 0, 0.15);
      rightArm.rotation.set(curRot.rightArmX, 0, -0.15);
      head.rotation.x = 0.35;
      torso.rotation.x = curRot.torsoX;
      return;
    }

    // Normal Locomotion & Ground Kinematics
    currentSpeedBlend = THREE.MathUtils.lerp(currentSpeedBlend, Math.min(state.speed / 7.0, 1.4), dt * 14);

    // Stride phase advances strictly proportional to distance moved (ZERO feet sliding!)
    if (state.isGrounded && state.speed > 0.05) {
      walkCyclePhase += dt * state.speed * (state.isCrouching ? 1.5 : 2.2);
    }

    let targetLeftLegX = 0;
    let targetRightLegX = 0;
    let targetLeftArmX = 0;
    let targetRightArmX = 0;
    let targetTorsoX = 0;
    let targetPelvisOffset = -landingRecovery * 0.12;

    // 3. CROUCHING MECHANIC
    if (state.isCrouching && state.isGrounded) {
      targetPelvisOffset -= 0.32; // Lower body
      targetTorsoX = 0.32;        // Hunched sneaking posture

      if (currentSpeedBlend > 0.04) {
        // Sneak crouch-walk
        const sneakSwing = Math.min(currentSpeedBlend * 0.45, 0.5);
        targetLeftLegX = -0.25 + Math.sin(walkCyclePhase) * sneakSwing;
        targetRightLegX = -0.25 - Math.sin(walkCyclePhase) * sneakSwing;
        targetLeftArmX = 0.25 - Math.sin(walkCyclePhase) * 0.3;
        targetRightArmX = 0.25 + Math.sin(walkCyclePhase) * 0.3;
      } else {
        // Crouch idle
        targetLeftLegX = -0.3;
        targetRightLegX = -0.3;
        targetLeftArmX = 0.2;
        targetRightArmX = 0.2;
      }
    } else if (!state.isGrounded) {
      // In-air airborne jump pose
      targetLeftLegX = -0.35;
      targetRightLegX = -0.2;
      targetLeftArmX = -Math.PI * 0.55;
      targetRightArmX = -Math.PI * 0.55;
      targetTorsoX = -0.08;
    } else if (currentSpeedBlend > 0.04) {
      // Stride sinusoidal swing
      const swingMagnitude = Math.min(currentSpeedBlend * 0.72, 0.85);
      const armSwingMag = Math.min(currentSpeedBlend * 0.65, 0.75);

      targetLeftLegX = Math.sin(walkCyclePhase) * swingMagnitude;
      targetRightLegX = -Math.sin(walkCyclePhase) * swingMagnitude;

      targetLeftArmX = -Math.sin(walkCyclePhase) * armSwingMag;
      targetRightArmX = Math.sin(walkCyclePhase) * armSwingMag;

      targetTorsoX = 0.08 * currentSpeedBlend;
      // Natural walking hip dip
      targetPelvisOffset += Math.abs(Math.sin(walkCyclePhase)) * 0.03 * currentSpeedBlend;
    } else {
      // Natural Idle breathing
      const breath = Math.sin(idleTime * 2.5);
      targetTorsoX = breath * 0.02;
      targetLeftArmX = breath * 0.04;
      targetRightArmX = -breath * 0.04;
      targetPelvisOffset += breath * 0.008;
    }

    // Silky smooth dampening across frames
    const dampSpeed = dt * 18;
    curRot.leftLegX = THREE.MathUtils.lerp(curRot.leftLegX, targetLeftLegX, dampSpeed);
    curRot.rightLegX = THREE.MathUtils.lerp(curRot.rightLegX, targetRightLegX, dampSpeed);
    curRot.leftArmX = THREE.MathUtils.lerp(curRot.leftArmX, targetLeftArmX, dampSpeed);
    curRot.rightArmX = THREE.MathUtils.lerp(curRot.rightArmX, targetRightArmX, dampSpeed);
    curRot.torsoX = THREE.MathUtils.lerp(curRot.torsoX, targetTorsoX, dampSpeed);
    curRot.pelvisYOffset = THREE.MathUtils.lerp(curRot.pelvisYOffset, targetPelvisOffset, dampSpeed);

    // Apply smoothly
    leftLeg.rotation.set(curRot.leftLegX, 0, 0);
    rightLeg.rotation.set(curRot.rightLegX, 0, 0);
    leftArm.rotation.set(curRot.leftArmX, 0, 0.08);
    rightArm.rotation.set(curRot.rightArmX, 0, -0.08);
    torso.rotation.x = curRot.torsoX;

    // Pelvis base height preservation
    const basePelvisY = charDef.id === 'mordecai' ? 1.05 : 0.8;
    pelvis.position.y = basePelvisY + curRot.pelvisYOffset;

    // Gentle head natural stabilization
    head.rotation.x = -curRot.torsoX * 0.5;

    // Tail swing
    if (tail) {
      const tailSwing = Math.sin(idleTime * (currentSpeedBlend > 0.1 ? 12 : 3)) * (currentSpeedBlend > 0.1 ? 0.35 : 0.15);
      tail.rotation.y = tailSwing;
    }

    // Benson gumballs subtle rumble
    if (gumballGroup && currentSpeedBlend > 0.1) {
      gumballGroup.rotation.y += dt * 3.5;
    }
  };

  const setGliderVisible = (vis: boolean) => {
    gliderMesh.visible = vis;
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
    updateAnimation,
    gliderMesh,
    setGliderVisible,
    dispose
  };
}
