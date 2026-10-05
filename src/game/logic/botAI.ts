import * as THREE from 'three';
import { PlayerState, WeaponDef } from '../types';
import { MapObstacle } from '../scene/mapBuilder';

const WAYPOINTS = [
  new THREE.Vector3(0, 0.5, 0),      // Central platform
  new THREE.Vector3(-18, 4.3, 0),   // West rooftop
  new THREE.Vector3(18, 4.3, 0),    // East rooftop
  new THREE.Vector3(-10, 0.1, -12), // North-West alley
  new THREE.Vector3(10, 0.1, -12),  // North-East alley
  new THREE.Vector3(-10, 0.1, 12),  // South-West alley
  new THREE.Vector3(10, 0.1, 12),   // South-East alley
  new THREE.Vector3(0, 0.1, -14),   // North approach
  new THREE.Vector3(0, 0.1, 14)     // South approach
];

export class BotAIController {
  private targetWaypoint: THREE.Vector3;
  private currentEnemy: PlayerState | null = null;
  private patrolTimer: number = 0;
  private strafeDir: number = 1;
  private strafeTimer: number = 0;
  private shootBurstTimer: number = 0;
  private grenadeCooldown: number = 5 + Math.random() * 8;

  constructor(private botId: string) {
    this.targetWaypoint = WAYPOINTS[Math.floor(Math.random() * WAYPOINTS.length)];
  }

  public update(
    dt: number,
    bot: PlayerState,
    allPlayers: PlayerState[],
    obstacles: MapObstacle[],
    currentWeapon: WeaponDef,
    getHeightAt: (x: number, z: number) => number,
    onShoot: (origin: THREE.Vector3, dir: THREE.Vector3) => void,
    onThrowGrenade: (origin: THREE.Vector3, dir: THREE.Vector3) => void
  ) {
    if (!bot.isAlive) return;

    this.patrolTimer += dt;
    this.strafeTimer += dt;
    this.grenadeCooldown -= dt;

    if (this.strafeTimer > 1.2 + Math.random() * 0.8) {
      this.strafeDir *= -1;
      this.strafeTimer = 0;
    }

    // 1. Perception: scan for nearest visible opposing team player
    let closestEnemy: PlayerState | null = null;
    let closestDist = 38.0; // max engagement distance

    const botPos = new THREE.Vector3(bot.position.x, bot.position.y + 1.2, bot.position.z);

    for (let i = 0; i < allPlayers.length; i++) {
      const candidate = allPlayers[i];
      if (!candidate.isAlive || candidate.id === bot.id || candidate.team === bot.team) continue;

      const candPos = new THREE.Vector3(candidate.position.x, candidate.position.y + 1.2, candidate.position.z);
      const dist = botPos.distanceTo(candPos);

      if (dist < closestDist) {
        // Line-of-sight check against obstacles
        const rayDir = candPos.clone().sub(botPos).normalize();
        const ray = new THREE.Ray(botPos, rayDir);
        let occluded = false;

        for (let j = 0; j < obstacles.length; j++) {
          const hitPoint = new THREE.Vector3();
          if (ray.intersectBox(obstacles[j].box, hitPoint)) {
            if (botPos.distanceTo(hitPoint) < dist - 0.5) {
              occluded = true;
              break;
            }
          }
        }

        if (!occluded) {
          closestDist = dist;
          closestEnemy = candidate;
        }
      }
    }

    this.currentEnemy = closestEnemy;

    // 2. Navigation & Movement
    let targetX = this.targetWaypoint.x;
    let targetZ = this.targetWaypoint.z;

    if (this.currentEnemy) {
      // Look directly at enemy
      const enemyPos = this.currentEnemy.position;
      const dx = enemyPos.x - bot.position.x;
      const dz = enemyPos.z - bot.position.z;
      const dy = (enemyPos.y + 1.2) - (bot.position.y + 1.2);

      bot.rotation.yaw = Math.atan2(dx, dz);
      bot.rotation.pitch = -Math.atan2(dy, Math.hypot(dx, dz));

      // Tactical combat movement: if far, advance; if close, strafe left/right
      if (closestDist > 16) {
        targetX = enemyPos.x;
        targetZ = enemyPos.z;
      } else {
        // Lateral strafing
        targetX = bot.position.x + Math.cos(bot.rotation.yaw) * 4 * this.strafeDir;
        targetZ = bot.position.z - Math.sin(bot.rotation.yaw) * 4 * this.strafeDir;
      }

      // Aim Down Sights when engaged
      bot.isAiming = closestDist > 10;
      bot.isCrouching = closestDist < 12 && Math.random() > 0.4;

      // 3. Firing Logic
      this.shootBurstTimer -= dt;
      if (bot.ammoInMag > 0 && !bot.isReloading) {
        if (this.shootBurstTimer <= 0) {
          const aimSpread = 0.04;
          const aimDir = new THREE.Vector3(
            Math.sin(bot.rotation.yaw) + (Math.random() - 0.5) * aimSpread,
            -Math.sin(bot.rotation.pitch) + (Math.random() - 0.5) * aimSpread,
            Math.cos(bot.rotation.yaw) + (Math.random() - 0.5) * aimSpread
          ).normalize();

          onShoot(botPos, aimDir);
          bot.ammoInMag--;
          bot.isShooting = true;

          // Next shot interval based on weapon fire rate
          this.shootBurstTimer = 1.0 / currentWeapon.fireRate;
        } else {
          bot.isShooting = false;
        }
      } else if (bot.ammoInMag === 0 && !bot.isReloading) {
        // Trigger reload
        bot.isReloading = true;
        bot.reloadProgress = 0;
      }

      // Grenade throw decision
      if (this.grenadeCooldown <= 0 && closestDist > 12 && closestDist < 25) {
        this.grenadeCooldown = 15 + Math.random() * 10;
        const throwDir = new THREE.Vector3(
          Math.sin(bot.rotation.yaw),
          -Math.sin(bot.rotation.pitch),
          Math.cos(bot.rotation.yaw)
        ).normalize();
        onThrowGrenade(botPos, throwDir);
      }
    } else {
      // Peaceful patrol
      bot.isAiming = false;
      bot.isShooting = false;
      bot.isCrouching = false;

      // Pick next waypoint when reached
      const distToWaypoint = Math.hypot(bot.position.x - this.targetWaypoint.x, bot.position.z - this.targetWaypoint.z);
      if (distToWaypoint < 2.5 || this.patrolTimer > 12) {
        this.targetWaypoint = WAYPOINTS[Math.floor(Math.random() * WAYPOINTS.length)];
        this.patrolTimer = 0;
      }

      // Rotate toward waypoint
      const toWpX = this.targetWaypoint.x - bot.position.x;
      const toWpZ = this.targetWaypoint.z - bot.position.z;
      const targetYaw = Math.atan2(toWpX, toWpZ);
      bot.rotation.yaw = THREE.MathUtils.lerp(bot.rotation.yaw, targetYaw, dt * 6);
      bot.rotation.pitch = 0;
    }

    // 4. Position update with obstacle collision
    const moveSpeed = bot.isSprinting ? 6.5 : bot.isCrouching ? 2.5 : 4.0;
    const dirX = targetX - bot.position.x;
    const dirZ = targetZ - bot.position.z;
    const len = Math.hypot(dirX, dirZ);

    if (len > 0.5) {
      const stepX = (dirX / len) * moveSpeed * dt;
      const stepZ = (dirZ / len) * moveSpeed * dt;

      let nextX = bot.position.x + stepX;
      let nextZ = bot.position.z + stepZ;

      // Check map bounds
      nextX = THREE.MathUtils.clamp(nextX, -30, 30);
      nextZ = THREE.MathUtils.clamp(nextZ, -30, 30);

      // Check obstacle collisions
      const botRadius = 0.45;
      let blocked = false;
      for (let o = 0; o < obstacles.length; o++) {
        const obs = obstacles[o];
        if (obs.type === 'ramp') continue; // ramps are walkable
        if (
          nextX + botRadius > obs.box.min.x &&
          nextX - botRadius < obs.box.max.x &&
          nextZ + botRadius > obs.box.min.z &&
          nextZ - botRadius < obs.box.max.z
        ) {
          // If obstacle is lower than current height + 0.6, mantle/step over it
          const obsTop = obs.elevation || obs.box.max.y;
          if (obsTop > bot.position.y + 0.6) {
            blocked = true;
            break;
          }
        }
      }

      if (!blocked) {
        bot.position.x = nextX;
        bot.position.z = nextZ;
      } else {
        // If blocked, pick a new waypoint to avoid getting stuck
        this.targetWaypoint = WAYPOINTS[Math.floor(Math.random() * WAYPOINTS.length)];
      }
    }

    // Ground elevation & ramp following
    const groundH = getHeightAt(bot.position.x, bot.position.z);
    bot.position.y = THREE.MathUtils.lerp(bot.position.y, groundH, dt * 15);
    bot.isGrounded = Math.abs(bot.position.y - groundH) < 0.1;
  }
}
