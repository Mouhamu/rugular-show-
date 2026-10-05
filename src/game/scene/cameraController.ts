import * as THREE from 'three';
import { MapObstacle } from './mapBuilder';

export interface CameraControlState {
  yaw: number;
  pitch: number;
  isAiming: boolean;
  isSniper: boolean;
  recoilOffsetPitch: number;
  recoilOffsetYaw: number;
}

export class TacticalCameraController {
  public camera: THREE.PerspectiveCamera;
  private targetPosition: THREE.Vector3 = new THREE.Vector3();
  private smoothedTarget: THREE.Vector3 = new THREE.Vector3();
  private raycaster: THREE.Raycaster = new THREE.Raycaster();

  // Camera offsets relative to player shoulder
  private defaultOffset: THREE.Vector3 = new THREE.Vector3(0.55, 1.65, 2.4);
  private adsOffset: THREE.Vector3 = new THREE.Vector3(0.35, 1.55, 1.1);
  private currentOffset: THREE.Vector3 = new THREE.Vector3(0.55, 1.65, 2.4);

  // Field of View
  private defaultFov: number = 65;
  private adsFov: number = 42;
  private sniperFov: number = 18;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      this.defaultFov,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(0, 2, 4);
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public update(
    dt: number,
    playerPos: THREE.Vector3,
    state: CameraControlState,
    obstacles: MapObstacle[],
    isSpectating: boolean = false
  ) {
    // 1. Target smoothing
    this.targetPosition.copy(playerPos);
    this.smoothedTarget.lerp(this.targetPosition, Math.min(1, dt * 18));

    // 2. Aim Down Sights lerp
    const targetOffset = state.isAiming ? this.adsOffset : this.defaultOffset;
    this.currentOffset.lerp(targetOffset, dt * 14);

    const targetFov = state.isAiming
      ? state.isSniper
        ? this.sniperFov
        : this.adsFov
      : this.defaultFov;

    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 16);
      this.camera.updateProjectionMatrix();
    }

    // 3. Spherical angles with recoil
    const totalPitch = THREE.MathUtils.clamp(
      state.pitch + state.recoilOffsetPitch,
      -1.3,
      1.3
    );
    const totalYaw = state.yaw + state.recoilOffsetYaw;

    // 4. Calculate desired camera position in world space
    // Local shoulder offset rotated by yaw
    const shoulderOffset = new THREE.Vector3(
      this.currentOffset.x * Math.cos(totalYaw) + this.currentOffset.z * Math.sin(totalYaw),
      this.currentOffset.y + Math.sin(totalPitch) * -0.5,
      -this.currentOffset.x * Math.sin(totalYaw) + this.currentOffset.z * Math.cos(totalYaw)
    );

    let desiredPos = this.smoothedTarget.clone().add(shoulderOffset);

    // 5. Anti-Clip Raycast (prevent camera from clipping into walls/buildings)
    if (!isSpectating) {
      const headOrigin = this.smoothedTarget.clone().add(new THREE.Vector3(0, 1.5, 0));
      const camDir = desiredPos.clone().sub(headOrigin);
      const camDist = camDir.length();
      camDir.normalize();

      this.raycaster.set(headOrigin, camDir);
      this.raycaster.far = camDist;

      // Check collision against obstacle boxes
      let closestHitDist = camDist;
      const ray = this.raycaster.ray;

      for (let i = 0; i < obstacles.length; i++) {
        const intersectionPoint = new THREE.Vector3();
        if (ray.intersectBox(obstacles[i].box, intersectionPoint)) {
          const hitDist = headOrigin.distanceTo(intersectionPoint) - 0.25;
          if (hitDist > 0.4 && hitDist < closestHitDist) {
            closestHitDist = hitDist;
          }
        }
      }

      if (closestHitDist < camDist) {
        desiredPos = headOrigin.clone().add(camDir.multiplyScalar(closestHitDist));
      }
    }

    this.camera.position.lerp(desiredPos, Math.min(1, dt * 24));

    // 6. Camera Look-at point
    // Look along pitch and yaw from player head
    const forward = new THREE.Vector3(
      Math.sin(totalYaw) * Math.cos(totalPitch),
      -Math.sin(totalPitch),
      Math.cos(totalYaw) * Math.cos(totalPitch)
    );

    const lookTarget = this.smoothedTarget.clone().add(new THREE.Vector3(0, 1.45, 0)).sub(forward.multiplyScalar(10));
    this.camera.lookAt(lookTarget);
  }
}
