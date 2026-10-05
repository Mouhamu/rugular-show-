import * as THREE from 'three';

export interface BoxCollider {
  type: 'BOX';
  id: string;
  min: THREE.Vector3;
  max: THREE.Vector3;
  stepUpHeight?: number; // small steps player can climb over
}

export interface CylinderCollider {
  type: 'CYLINDER';
  id: string;
  center: THREE.Vector2; // x, z
  radius: number;
  minY: number;
  maxY: number;
}

export type MapCollider = BoxCollider | CylinderCollider;

export class CollisionSystem {
  private colliders: MapCollider[] = [];
  public bounds = { minX: -58, maxX: 58, minZ: -58, maxZ: 58 };

  constructor() {
    this.setupParkColliders();
  }

  private setupParkColliders() {
    // 1. PARK HOUSE (Center-North [0, 0, -28])
    // Main 2-story building body: width 16 (x -8 to +8), depth 12 (z -34 to -22)
    this.addBox('house_main_body', -8.2, 0, -34.2, 8.2, 10.0, -21.8);
    // Porch railings/walls
    this.addBox('house_porch_left', -9.2, 0, -21.8, -8.0, 3.0, -17.5);
    this.addBox('house_porch_right', 8.0, 0, -21.8, 9.2, 3.0, -17.5);

    // 2. GOLF CARTS
    // Cart 1 [10, -22]
    this.addBox('cart_1', 8.5, 0, -24.0, 11.5, 2.2, -20.0);
    // Cart 2 [-10, -22]
    this.addBox('cart_2', -11.5, 0, -24.0, -8.5, 2.2, -20.0);

    // 3. PLAYGROUND EQUIPMENT [-28, 0, 24]
    // Swing frame legs & poles
    this.addCylinder('swing_leg_left', -32, 24, 0.45, 0, 4.5);
    this.addCylinder('swing_leg_right', -24, 24, 0.45, 0, 4.5);
    // Sandbox center obstacle / slide
    this.addBox('slide_structure', -28.8, 0, 22.0, -27.2, 3.2, 26.0);

    // 4. CARTOON TREES SCATTERED ACROSS THE PARK (Sturdy trunks)
    const treeCoords: [number, number][] = [
      [-14, -14], [14, -14], [-38, -12], [38, -12],
      [-18, 8], [18, 8], [-42, 18], [42, 18],
      [-8, 38], [8, 38], [-44, -38], [44, -38]
    ];
    treeCoords.forEach(([x, z], i) => {
      this.addCylinder(`tree_trunk_${i}`, x, z, 0.65, 0, 6.0);
    });

    // 5. LAKE WATER SHORE (Prevent falling into deep water outside dock)
    // Lake is at [28, 0, 26] with radius 18.
    // Dock is at x: [16, 26], z: [22, 26], y: 0.25-0.4
  }

  public addBox(id: string, minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) {
    this.colliders.push({
      type: 'BOX',
      id,
      min: new THREE.Vector3(minX, minY, minZ),
      max: new THREE.Vector3(maxX, maxY, maxZ)
    });
  }

  public addCylinder(id: string, x: number, z: number, radius: number, minY: number, maxY: number) {
    this.colliders.push({
      type: 'CYLINDER',
      id,
      center: new THREE.Vector2(x, z),
      radius,
      minY,
      maxY
    });
  }

  /**
   * Resolves player horizontal movement with smooth wall-sliding collision response.
   * Handles multi-surface corners and step-ups without sticking or tunneling.
   */
  public resolveMovement(
    currentPos: THREE.Vector3,
    desiredPos: THREE.Vector3,
    playerRadius = 0.45,
    playerHeight = 1.8
  ): THREE.Vector3 {
    let resolved = desiredPos.clone();

    // 1. Boundary clamping
    resolved.x = THREE.MathUtils.clamp(resolved.x, this.bounds.minX + playerRadius, this.bounds.maxX - playerRadius);
    resolved.z = THREE.MathUtils.clamp(resolved.z, this.bounds.minZ + playerRadius, this.bounds.maxZ - playerRadius);

    // Lake edge blocking (keep player safe on dock or shore, prevent sinking into abyss)
    const distToLakeCenter = Math.hypot(resolved.x - 28, resolved.z - 26);
    const isOnDock = resolved.x >= 15.5 && resolved.x <= 26.5 && resolved.z >= 21.5 && resolved.z <= 26.5;
    if (distToLakeCenter < 17.5 && !isOnDock) {
      // Push back to shoreline
      const angle = Math.atan2(resolved.z - 26, resolved.x - 28);
      resolved.x = 28 + Math.cos(angle) * 17.5;
      resolved.z = 26 + Math.sin(angle) * 17.5;
    }

    // 2. Multi-pass collision resolution (handles corners and tight obstacles)
    for (let pass = 0; pass < 3; pass++) {
      let collided = false;

      for (const col of this.colliders) {
        if (col.type === 'BOX') {
          // Check vertical overlap
          if (resolved.y + playerHeight < col.min.y || resolved.y > col.max.y) {
            continue;
          }

          // Step-up support for low porches/platforms
          if (col.max.y - resolved.y <= 0.45 && resolved.y >= col.min.y) {
            continue; // Can step on top
          }

          // Find closest point on AABB to sphere center (resolved.x, resolved.z)
          const closestX = THREE.MathUtils.clamp(resolved.x, col.min.x, col.max.x);
          const closestZ = THREE.MathUtils.clamp(resolved.z, col.min.z, col.max.z);

          const distX = resolved.x - closestX;
          const distZ = resolved.z - closestZ;
          const distSq = distX * distX + distZ * distZ;

          if (distSq < playerRadius * playerRadius) {
            collided = true;
            const dist = Math.sqrt(distSq);

            if (dist > 0.0001) {
              const normalX = distX / dist;
              const normalZ = distZ / dist;
              const penetration = playerRadius - dist;

              // Push out along normal
              resolved.x += normalX * (penetration + 0.01);
              resolved.z += normalZ * (penetration + 0.01);
            } else {
              // Center is inside box -> push out to nearest edge
              const dMinX = Math.abs(resolved.x - col.min.x);
              const dMaxX = Math.abs(col.max.x - resolved.x);
              const dMinZ = Math.abs(resolved.z - col.min.z);
              const dMaxZ = Math.abs(col.max.z - resolved.z);
              const minD = Math.min(dMinX, dMaxX, dMinZ, dMaxZ);

              if (minD === dMinX) resolved.x = col.min.x - playerRadius - 0.02;
              else if (minD === dMaxX) resolved.x = col.max.x + playerRadius + 0.02;
              else if (minD === dMinZ) resolved.z = col.min.z - playerRadius - 0.02;
              else resolved.z = col.max.z + playerRadius + 0.02;
            }
          }
        } else if (col.type === 'CYLINDER') {
          // Check vertical overlap
          if (resolved.y + playerHeight < col.minY || resolved.y > col.maxY) {
            continue;
          }

          const dx = resolved.x - col.center.x;
          const dz = resolved.z - col.center.y;
          const distSq = dx * dx + dz * dz;
          const minSafeDist = col.radius + playerRadius;

          if (distSq < minSafeDist * minSafeDist) {
            collided = true;
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const nx = dx / dist;
              const nz = dz / dist;
              const penetration = minSafeDist - dist;
              resolved.x += nx * (penetration + 0.01);
              resolved.z += nz * (penetration + 0.01);
            } else {
              resolved.x += playerRadius + 0.05;
            }
          }
        }
      }

      if (!collided) break;
    }

    return resolved;
  }

  /**
   * Resolves character-to-character soft repulsion so players/NPCs do not walk inside each other
   */
  public resolveEntityCollisions(
    playerPos: THREE.Vector3,
    otherEntities: THREE.Vector3[],
    radius = 0.7
  ): THREE.Vector3 {
    const pos = playerPos.clone();
    for (const other of otherEntities) {
      const dx = pos.x - other.x;
      const dz = pos.z - other.z;
      const distSq = dx * dx + dz * dz;
      const minDist = radius * 2;

      if (distSq < minDist * minDist && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        const nx = dx / dist;
        const nz = dz / dist;
        pos.x += nx * overlap * 0.5;
        pos.z += nz * overlap * 0.5;
      }
    }
    return pos;
  }

  /**
   * Raycasts from player center to camera position, pulling camera closer if obstructed
   * to guarantee the camera never clips through walls, the house, or trees.
   */
  public checkCameraDistance(
    playerFocus: THREE.Vector3,
    desiredCamPos: THREE.Vector3,
    maxDistance: number
  ): number {
    let closestDist = maxDistance;
    const rayDir = desiredCamPos.clone().sub(playerFocus).normalize();

    for (const col of this.colliders) {
      if (col.type === 'BOX') {
        const box = new THREE.Box3(col.min, col.max);
        const ray = new THREE.Ray(playerFocus, rayDir);
        const hitPoint = new THREE.Vector3();
        if (ray.intersectBox(box, hitPoint)) {
          const hitDist = playerFocus.distanceTo(hitPoint);
          if (hitDist > 0.4 && hitDist < closestDist) {
            closestDist = Math.max(1.5, hitDist - 0.35); // 0.35m buffer
          }
        }
      } else if (col.type === 'CYLINDER') {
        // Approximate cylinder as thin bounding box for ray testing
        const cMin = new THREE.Vector3(col.center.x - col.radius, col.minY, col.center.y - col.radius);
        const cMax = new THREE.Vector3(col.center.x + col.radius, col.maxY, col.center.y + col.radius);
        const box = new THREE.Box3(cMin, cMax);
        const ray = new THREE.Ray(playerFocus, rayDir);
        const hitPoint = new THREE.Vector3();
        if (ray.intersectBox(box, hitPoint)) {
          const hitDist = playerFocus.distanceTo(hitPoint);
          if (hitDist > 0.4 && hitDist < closestDist) {
            closestDist = Math.max(1.5, hitDist - 0.3);
          }
        }
      }
    }

    return closestDist;
  }

  /**
   * Returns exact elevation at (x, z) ensuring feet rest flush on terrain, porches, or docks
   */
  public getGroundHeight(x: number, z: number): number {
    // 1. House Porch & Steps: x in [-9, 9], z in [-28, -20]
    if (x >= -9.0 && x <= 9.0 && z >= -27.5 && z <= -20.5) {
      // Front stairs step-down
      if (z >= -21.8) return 0.4;
      return 0.8;
    }

    // 2. Lake Fishing Dock: x in [15.5, 26.5], z in [21.5, 26.5]
    if (x >= 15.5 && x <= 26.5 && z >= 21.5 && z <= 26.5) {
      return 0.35;
    }

    // 3. Playground Sandbox: [-28, 24]
    if (Math.hypot(x - (-28), z - 24) < 9.0) {
      return 0.15;
    }

    // 4. Default Ground Level
    return 0.0;
  }
}

export const collisionSystem = new CollisionSystem();
