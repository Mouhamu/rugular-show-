import * as THREE from 'three';
import { didyAudio } from '../audio/didyAudio';

export type DropPhase = 'PLANE_FLYBY' | 'FREEFALL' | 'GLIDING' | 'LANDED';

export interface DropState {
  phase: DropPhase;
  altitude: number;
  descentSpeed: number;
  horizontalVelocity: { x: number; z: number };
  planeProgress: number; // 0 to 1 along flight path
  canJump: boolean;
  hasJumped: boolean;
  isLanded: boolean;
}

export class DropModeManager {
  public dropState: DropState = {
    phase: 'PLANE_FLYBY',
    altitude: 105.0,
    descentSpeed: 0,
    horizontalVelocity: { x: 0, z: 0 },
    planeProgress: 0,
    canJump: true,
    hasJumped: false,
    isLanded: false
  };

  public planeGroup: THREE.Group = new THREE.Group();
  private windTrailGroup: THREE.Group = new THREE.Group();
  private propellers: THREE.Mesh[] = [];

  // Aircraft Flight Trajectory (South-West to North-East across The Park)
  public readonly flightStart = new THREE.Vector3(-55, 105, -55);
  public readonly flightEnd = new THREE.Vector3(55, 105, 55);

  constructor(private scene: THREE.Scene) {
    this.buildAirplane();
    this.buildWindTrails();
    this.scene.add(this.planeGroup);
    this.scene.add(this.windTrailGroup);
  }

  /**
   * Procedural Cartoon Battle-Royale Cargo Aircraft (Regular Show Park Ranger Flight)
   */
  private buildAirplane() {
    this.planeGroup.name = 'Didy_AirDrop_CargoPlane';

    // Fuselage
    const fuselageMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 }); // Bright sky cyan-blue
    const whiteTrimMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });

    // Main Body
    const bodyGeo = new THREE.CylinderGeometry(2.4, 2.0, 18, 12);
    const bodyMesh = new THREE.Mesh(bodyGeo, fuselageMat);
    bodyMesh.rotation.x = Math.PI / 2;
    this.planeGroup.add(bodyMesh);

    // Nose Cone
    const noseGeo = new THREE.ConeGeometry(2.4, 4.5, 12);
    const noseMesh = new THREE.Mesh(noseGeo, whiteTrimMat);
    noseMesh.rotation.x = -Math.PI / 2;
    noseMesh.position.set(0, 0, 10.5);
    this.planeGroup.add(noseMesh);

    // Cockpit Windows
    const cockpitGeo = new THREE.SphereGeometry(1.6, 8, 8);
    const cockpitMesh = new THREE.Mesh(cockpitGeo, glassMat);
    cockpitMesh.position.set(0, 1.2, 7.5);
    cockpitMesh.scale.set(1.1, 0.7, 1.4);
    this.planeGroup.add(cockpitMesh);

    // Main Wings (Wide wingspan)
    const wingGeo = new THREE.BoxGeometry(28, 0.4, 4.5);
    const wingMesh = new THREE.Mesh(wingGeo, whiteTrimMat);
    wingMesh.position.set(0, 0.6, 1.5);
    this.planeGroup.add(wingMesh);

    // Tail Fins
    const vTailGeo = new THREE.BoxGeometry(0.3, 5.0, 3.5);
    const vTail = new THREE.Mesh(vTailGeo, fuselageMat);
    vTail.position.set(0, 3.2, -8.0);
    this.planeGroup.add(vTail);

    const hTailGeo = new THREE.BoxGeometry(10, 0.3, 2.5);
    const hTail = new THREE.Mesh(hTailGeo, whiteTrimMat);
    hTail.position.set(0, 1.2, -8.2);
    this.planeGroup.add(hTail);

    // Twin Turboprop Engines
    const engineGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.5, 8);
    const engLeft = new THREE.Mesh(engineGeo, darkMat);
    engLeft.rotation.x = Math.PI / 2;
    engLeft.position.set(-6.5, 0.2, 2.5);
    this.planeGroup.add(engLeft);

    const engRight = new THREE.Mesh(engineGeo, darkMat);
    engRight.rotation.x = Math.PI / 2;
    engRight.position.set(6.5, 0.2, 2.5);
    this.planeGroup.add(engRight);

    // Propeller Blades
    const propGeo = new THREE.BoxGeometry(2.8, 0.15, 0.3);
    const propLeft = new THREE.Mesh(propGeo, whiteTrimMat);
    propLeft.position.set(-6.5, 0.2, 4.3);
    this.planeGroup.add(propLeft);
    this.propellers.push(propLeft);

    const propRight = new THREE.Mesh(propGeo, whiteTrimMat);
    propRight.position.set(6.5, 0.2, 4.3);
    this.planeGroup.add(propRight);
    this.propellers.push(propRight);

    // Open Rear Cargo Ramp (Where players jump from!)
    const rampGeo = new THREE.BoxGeometry(2.4, 0.2, 3.0);
    const rampMesh = new THREE.Mesh(rampGeo, darkMat);
    rampMesh.position.set(0, -1.0, -9.5);
    rampMesh.rotation.x = 0.3;
    this.planeGroup.add(rampMesh);

    // Orient aircraft along flight trajectory
    const flightDir = this.flightEnd.clone().sub(this.flightStart).normalize();
    this.planeGroup.rotation.y = Math.atan2(flightDir.x, flightDir.z);
    this.planeGroup.position.copy(this.flightStart);
  }

  private buildWindTrails() {
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65
    });

    for (let i = 0; i < 16; i++) {
      const pts = [
        new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 8, (Math.random() - 0.5) * 5),
        new THREE.Vector3((Math.random() - 0.5) * 5, -Math.random() * 8, (Math.random() - 0.5) * 5)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, lineMat);
      this.windTrailGroup.add(line);
    }
    this.windTrailGroup.visible = false;
  }

  public startAirDrop() {
    this.dropState = {
      phase: 'PLANE_FLYBY',
      altitude: 105.0,
      descentSpeed: 0,
      horizontalVelocity: { x: 0, z: 0 },
      planeProgress: 0.05,
      canJump: true,
      hasJumped: false,
      isLanded: false
    };
    this.planeGroup.visible = true;
    this.windTrailGroup.visible = false;
    this.planeGroup.position.copy(this.flightStart);
  }

  /**
   * Called when player taps JUMP or plane reaches auto-eject limit
   */
  public triggerJump(playerPos: THREE.Vector3) {
    if (this.dropState.hasJumped) return;

    this.dropState.hasJumped = true;
    this.dropState.phase = 'FREEFALL';
    this.dropState.descentSpeed = 22.0; // Fast freefall diving

    // Inherit plane position at jump moment
    playerPos.copy(this.planeGroup.position);
    playerPos.y = 102.0;
    this.dropState.altitude = 102.0;

    this.windTrailGroup.visible = true;
    didyAudio.playJump();
  }

  /**
   * Called when player deploys glider or hits auto-deploy altitude (45m)
   */
  public deployGlider() {
    if (this.dropState.phase === 'FREEFALL') {
      this.dropState.phase = 'GLIDING';
      this.dropState.descentSpeed = 9.2; // Slow graceful glide
      didyAudio.playGliderDeploy();
    }
  }

  public update(
    dt: number,
    joystickX: number,
    joystickZ: number,
    playerPos: THREE.Vector3,
    onLanded: () => void
  ) {
    // Spin turboprop blades
    this.propellers.forEach(p => (p.rotation.z += dt * 35));

    // 1. PLANE FLYBY PHASE
    if (this.dropState.phase === 'PLANE_FLYBY') {
      // Progress aircraft across sky
      this.dropState.planeProgress += dt * 0.09; // ~11 seconds flight across map
      this.planeGroup.position.lerpVectors(this.flightStart, this.flightEnd, this.dropState.planeProgress);

      // Keep player inside aircraft cargo bay before jumping
      playerPos.copy(this.planeGroup.position);
      playerPos.y = 104.0;
      this.dropState.altitude = 104.0;

      // Auto-eject player before plane exits map
      if (this.dropState.planeProgress >= 0.88 && !this.dropState.hasJumped) {
        this.triggerJump(playerPos);
      }
      return;
    }

    // 2. FREEFALL & GLIDING PHASES
    if (this.dropState.phase === 'FREEFALL' || this.dropState.phase === 'GLIDING') {
      // Keep aircraft continuing along its route in the distance
      this.dropState.planeProgress += dt * 0.09;
      this.planeGroup.position.lerpVectors(this.flightStart, this.flightEnd, Math.min(1.5, this.dropState.planeProgress));

      // Auto-deploy glider if player descends past 42m
      if (this.dropState.phase === 'FREEFALL' && this.dropState.altitude <= 45.0) {
        this.deployGlider();
      }

      // Horizontal steer control (Pitch forward/back, roll left/right)
      const maxSteerSpeed = this.dropState.phase === 'FREEFALL' ? 22.0 : 16.0;
      this.dropState.horizontalVelocity.x = THREE.MathUtils.lerp(
        this.dropState.horizontalVelocity.x,
        joystickX * maxSteerSpeed,
        dt * 6
      );
      this.dropState.horizontalVelocity.z = THREE.MathUtils.lerp(
        this.dropState.horizontalVelocity.z,
        joystickZ * maxSteerSpeed,
        dt * 6
      );

      // Apply descent speed
      this.dropState.altitude = Math.max(0, this.dropState.altitude - this.dropState.descentSpeed * dt);
      playerPos.x += this.dropState.horizontalVelocity.x * dt;
      playerPos.z += this.dropState.horizontalVelocity.z * dt;
      playerPos.y = this.dropState.altitude;

      // Position wind trails around descending player
      this.windTrailGroup.position.set(playerPos.x, playerPos.y + 4, playerPos.z);
      this.windTrailGroup.rotation.y += dt * 5;

      // Touchdown landing check
      if (this.dropState.altitude <= 0.3 && !this.dropState.isLanded) {
        this.dropState.isLanded = true;
        this.dropState.phase = 'LANDED';
        this.windTrailGroup.visible = false;
        didyAudio.playLanding();
        onLanded();
      }
    }
  }

  public dispose() {
    this.scene.remove(this.planeGroup);
    this.scene.remove(this.windTrailGroup);
  }
}
