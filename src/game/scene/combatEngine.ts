import * as THREE from 'three';
import { PlayerState, WeaponDef } from '../types';
import { MapObstacle } from './mapBuilder';
import { soundManager } from '../audio/soundManager';

export interface BulletTracer {
  line: THREE.Line;
  start: THREE.Vector3;
  end: THREE.Vector3;
  life: number;
  maxLife: number;
}

export interface HitParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export interface ActiveGrenade {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  fuseTime: number; // seconds left
  throwerId: string;
  damage: number;
  blastRadius: number;
}

export interface HitResult {
  hitPlayerId: string | null;
  isHeadshot: boolean;
  damageDealt: number;
  hitPoint: THREE.Vector3;
  isEliminated: boolean;
}

export class CombatEngine {
  private scene: THREE.Scene;
  private tracers: BulletTracer[] = [];
  private particles: HitParticle[] = [];
  private activeGrenades: ActiveGrenade[] = [];
  private muzzleFlashMesh: THREE.Mesh;
  private muzzleLight: THREE.PointLight;
  private flashLife: number = 0;

  // Particle reusable geometry & materials
  private sparkGeo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
  private sparkMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  private bloodMat = new THREE.MeshBasicMaterial({ color: 0x991b1b });
  private grenadeGeo = new THREE.SphereGeometry(0.12, 8, 8);
  private grenadeMat = new THREE.MeshLambertMaterial({ color: 0x365314 });

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Muzzle flash billboard
    const flashGeo = new THREE.PlaneGeometry(0.3, 0.3);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    this.muzzleFlashMesh = new THREE.Mesh(flashGeo, flashMat);
    this.muzzleFlashMesh.visible = false;
    this.scene.add(this.muzzleFlashMesh);

    this.muzzleLight = new THREE.PointLight(0xfef08a, 0, 8);
    this.scene.add(this.muzzleLight);
  }

  public fireBullet(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    weapon: WeaponDef,
    isADS: boolean,
    shooterId: string,
    players: PlayerState[],
    obstacles: MapObstacle[],
    onHit?: (res: HitResult) => void
  ) {
    const isShotgun = weapon.category === 'SHOTGUN';
    const pelletCount = isShotgun ? 8 : 1;
    const baseSpread = isADS ? weapon.spread * weapon.adsSpreadMultiplier : weapon.spread;

    // Trigger muzzle flash at gun origin
    this.triggerMuzzleFlash(origin);

    const shooter = players.find(p => p.id === shooterId);
    if (!shooter) return;

    for (let p = 0; p < pelletCount; p++) {
      // Calculate spread angle
      const spreadX = (Math.random() - 0.5) * baseSpread * 2;
      const spreadY = (Math.random() - 0.5) * baseSpread * 2;
      const bulletDir = direction.clone();
      bulletDir.x += spreadX;
      bulletDir.y += spreadY;
      bulletDir.normalize();

      // Raycast against obstacles
      const ray = new THREE.Ray(origin, bulletDir);
      let closestDistance = weapon.rangeFalloff * 1.5;
      let hitPoint = origin.clone().add(bulletDir.clone().multiplyScalar(closestDistance));
      let hitPlayer: PlayerState | null = null;
      let isHeadshot = false;

      // 1. Check obstacles
      for (let i = 0; i < obstacles.length; i++) {
        const intersection = new THREE.Vector3();
        if (ray.intersectBox(obstacles[i].box, intersection)) {
          const dist = origin.distanceTo(intersection);
          if (dist < closestDistance) {
            closestDistance = dist;
            hitPoint.copy(intersection);
          }
        }
      }

      // 2. Check opposing team players
      for (let j = 0; j < players.length; j++) {
        const target = players[j];
        if (!target.isAlive || target.id === shooterId || target.team === shooter.team) continue;

        // Player bounding cylinder/box approximation
        const targetPos = target.position;
        const playerMinY = targetPos.y;
        const playerMaxY = targetPos.y + (target.isCrouching ? 1.2 : 1.8);
        const playerRadius = 0.45;

        const playerBox = new THREE.Box3(
          new THREE.Vector3(targetPos.x - playerRadius, playerMinY, targetPos.z - playerRadius),
          new THREE.Vector3(targetPos.x + playerRadius, playerMaxY, targetPos.z + playerRadius)
        );

        const intersection = new THREE.Vector3();
        if (ray.intersectBox(playerBox, intersection)) {
          const dist = origin.distanceTo(intersection);
          if (dist < closestDistance) {
            closestDistance = dist;
            hitPoint.copy(intersection);
            hitPlayer = target;
            // Check if headshot (upper 25% of height)
            const headHeight = playerMaxY - 0.35;
            isHeadshot = intersection.y >= headHeight;
          }
        }
      }

      // 3. Register damage if player hit
      if (hitPlayer) {
        let damage = weapon.damage;
        if (isHeadshot) damage *= weapon.headshotMultiplier;

        // Range falloff
        if (closestDistance > weapon.rangeFalloff) {
          const falloffRatio = Math.max(0.4, 1 - (closestDistance - weapon.rangeFalloff) / (weapon.rangeFalloff * 1.5));
          damage = Math.round(damage * falloffRatio);
        }

        // Apply armor damage reduction
        let finalDamage = Math.round(damage);
        if (hitPlayer.armor > 0) {
          const absorbed = Math.min(hitPlayer.armor, finalDamage * 0.5);
          hitPlayer.armor = Math.max(0, hitPlayer.armor - absorbed);
          finalDamage = Math.round(finalDamage - absorbed * 0.5);
        }

        hitPlayer.health = Math.max(0, hitPlayer.health - finalDamage);
        hitPlayer.hurtCooldown = 0.4;
        const isEliminated = hitPlayer.health <= 0;
        if (isEliminated) {
          hitPlayer.isAlive = false;
        }

        this.spawnHitParticles(hitPoint, true);

        if (onHit) {
          onHit({
            hitPlayerId: hitPlayer.id,
            isHeadshot,
            damageDealt: finalDamage,
            hitPoint,
            isEliminated
          });
        }
      } else {
        // Hit environment obstacle
        this.spawnHitParticles(hitPoint, false);
      }

      // Add visual tracer
      this.createTracer(origin, hitPoint);
    }
  }

  public throwGrenade(origin: THREE.Vector3, forwardDir: THREE.Vector3, throwerId: string) {
    const mesh = new THREE.Mesh(this.grenadeGeo, this.grenadeMat);
    mesh.position.copy(origin);
    mesh.castShadow = true;
    this.scene.add(mesh);

    // Initial throw velocity: forward + upward boost
    const throwVel = forwardDir.clone().multiplyScalar(16);
    throwVel.y += 5.5;

    this.activeGrenades.push({
      mesh,
      position: origin.clone(),
      velocity: throwVel,
      fuseTime: 2.8,
      throwerId,
      damage: 120,
      blastRadius: 8.5
    });
  }

  private triggerMuzzleFlash(pos: THREE.Vector3) {
    this.muzzleFlashMesh.position.copy(pos);
    this.muzzleFlashMesh.rotation.z = Math.random() * Math.PI * 2;
    this.muzzleFlashMesh.visible = true;
    this.muzzleLight.position.copy(pos);
    this.muzzleLight.intensity = 2.5;
    this.flashLife = 0.05;
  }

  private createTracer(start: THREE.Vector3, end: THREE.Vector3) {
    const points = [start, end];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.85
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);

    this.tracers.push({
      line,
      start: start.clone(),
      end: end.clone(),
      life: 0.08,
      maxLife: 0.08
    });
  }

  private spawnHitParticles(pos: THREE.Vector3, isBlood: boolean) {
    const count = isBlood ? 6 : 4;
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.sparkGeo, isBlood ? this.bloodMat : this.sparkMat);
      mesh.position.copy(pos);
      this.scene.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 2.5 + 0.5,
        (Math.random() - 0.5) * 3
      );

      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.25,
        maxLife: 0.25
      });
    }
  }

  public update(
    dt: number,
    obstacles: MapObstacle[],
    players: PlayerState[],
    onExplosionDamage?: (throwerId: string, victimId: string, dmg: number, isDead: boolean) => void
  ) {
    // 1. Muzzle flash decay
    if (this.flashLife > 0) {
      this.flashLife -= dt;
      if (this.flashLife <= 0) {
        this.muzzleFlashMesh.visible = false;
        this.muzzleLight.intensity = 0;
      }
    }

    // 2. Tracers decay
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.scene.remove(t.line);
        t.line.geometry.dispose();
        (t.line.material as THREE.Material).dispose();
        this.tracers.splice(i, 1);
      } else {
        (t.line.material as THREE.LineBasicMaterial).opacity = t.life / t.maxLife;
      }
    }

    // 3. Hit particles update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      } else {
        p.velocity.y -= 9.8 * dt;
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.mesh.scale.setScalar(p.life / p.maxLife);
      }
    }

    // 4. Active grenades physics & detonation
    for (let i = this.activeGrenades.length - 1; i >= 0; i--) {
      const g = this.activeGrenades[i];
      g.fuseTime -= dt;

      // Apply gravity
      g.velocity.y -= 12 * dt;
      g.position.addScaledVector(g.velocity, dt);

      // Bounce on ground
      if (g.position.y <= 0.12) {
        g.position.y = 0.12;
        g.velocity.y = -g.velocity.y * 0.45; // restitution
        g.velocity.x *= 0.75; // ground friction
        g.velocity.z *= 0.75;
      }

      // Check obstacle bounce
      for (let j = 0; j < obstacles.length; j++) {
        if (obstacles[j].box.containsPoint(g.position)) {
          g.velocity.x = -g.velocity.x * 0.5;
          g.velocity.z = -g.velocity.z * 0.5;
          g.position.addScaledVector(g.velocity, dt * 2);
          break;
        }
      }

      g.mesh.position.copy(g.position);
      g.mesh.rotation.x += dt * 8;
      g.mesh.rotation.y += dt * 6;

      // Detonation
      if (g.fuseTime <= 0) {
        this.detonateGrenade(g, players, onExplosionDamage);
        this.scene.remove(g.mesh);
        this.activeGrenades.splice(i, 1);
      }
    }
  }

  private detonateGrenade(
    g: ActiveGrenade,
    players: PlayerState[],
    onDamage?: (throwerId: string, victimId: string, dmg: number, isDead: boolean) => void
  ) {
    soundManager.playExplosion();

    // Spawn massive explosion fireball flash & debris
    for (let i = 0; i < 20; i++) {
      const mesh = new THREE.Mesh(this.sparkGeo, this.sparkMat);
      mesh.position.copy(g.position);
      this.scene.add(mesh);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        Math.random() * 8 + 2,
        (Math.random() - 0.5) * 12
      );
      this.particles.push({
        mesh,
        velocity: vel,
        life: 0.6,
        maxLife: 0.6
      });
    }

    // Blast damage calculation
    players.forEach(p => {
      if (!p.isAlive) return;
      const dist = g.position.distanceTo(new THREE.Vector3(p.position.x, p.position.y + 0.8, p.position.z));
      if (dist <= g.blastRadius) {
        const falloff = 1 - dist / g.blastRadius;
        const blastDmg = Math.round(g.damage * falloff);

        if (blastDmg > 0) {
          p.health = Math.max(0, p.health - blastDmg);
          p.hurtCooldown = 0.5;
          const isDead = p.health <= 0;
          if (isDead) p.isAlive = false;

          if (onDamage) {
            onDamage(g.throwerId, p.id, blastDmg, isDead);
          }
        }
      }
    });
  }

  public dispose() {
    this.tracers.forEach(t => {
      this.scene.remove(t.line);
    });
    this.particles.forEach(p => {
      this.scene.remove(p.mesh);
    });
    this.activeGrenades.forEach(g => {
      this.scene.remove(g.mesh);
    });
    this.scene.remove(this.muzzleFlashMesh);
    this.scene.remove(this.muzzleLight);
  }
}
