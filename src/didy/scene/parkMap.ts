import * as THREE from 'three';
import { collisionSystem } from './collisionSystem';

export interface CollectibleItem {
  id: string;
  type: 'MEDAL' | 'SODA' | 'DISC' | 'TACO';
  points: number;
  position: THREE.Vector3;
  mesh: THREE.Group;
  collected: boolean;
  respawnTimer: number;
}

export interface JumpPad {
  id: string;
  position: THREE.Vector3;
  boostForce: number;
  mesh: THREE.Group;
}

export interface ParkMapData {
  group: THREE.Group;
  collectibles: CollectibleItem[];
  jumpPads: JumpPad[];
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  getHeightAt: (x: number, z: number) => number;
  update: (dt: number) => void;
}

export function buildParkMap(): ParkMapData {
  const group = new THREE.Group();
  group.name = 'RegularShow_ThePark';

  const collectibles: CollectibleItem[] = [];
  const jumpPads: JumpPad[] = [];

  const bounds = { minX: -60, maxX: 60, minZ: -60, maxZ: 60 };

  // Materials
  const grassMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 }); // Vibrant cartoon green
  const pathMat = new THREE.MeshLambertMaterial({ color: 0xd6d3d1 }); // Stone gray path
  const houseWallMat = new THREE.MeshLambertMaterial({ color: 0xfef08a }); // Classic yellow park house
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x991b1b }); // Crimson roof tiles
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x854d0e }); // Deck / porch wood
  const lakeMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
  const treeTrunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
  const foliageMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
  const cartMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });

  // 1. ROLLING GROUND PLANE
  const groundGeo = new THREE.PlaneGeometry(130, 130, 16, 16);
  const groundMesh = new THREE.Mesh(groundGeo, grassMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // 2. WINDING CART ROADS & PATHS
  const pathGeo = new THREE.PlaneGeometry(6, 120);
  const pathMesh = new THREE.Mesh(pathGeo, pathMat);
  pathMesh.rotation.x = -Math.PI / 2;
  pathMesh.position.set(0, 0.02, 0);
  pathMesh.receiveShadow = true;
  group.add(pathMesh);

  const crossPathGeo = new THREE.PlaneGeometry(120, 6);
  const crossPathMesh = new THREE.Mesh(crossPathGeo, pathMat);
  crossPathMesh.rotation.x = -Math.PI / 2;
  crossPathMesh.position.set(0, 0.02, 0);
  group.add(crossPathMesh);

  // 3. ICONIC YELLOW PARK HOUSE (Center-North [0, 0, -28])
  const houseGroup = new THREE.Group();
  houseGroup.position.set(0, 0, -28);

  // 2-Story Main Building
  const houseBase = new THREE.Mesh(new THREE.BoxGeometry(16, 7.5, 12), houseWallMat);
  houseBase.position.y = 3.75;
  houseBase.castShadow = true;
  houseGroup.add(houseBase);

  // Roof
  const roofGeo = new THREE.ConeGeometry(12, 4.5, 4);
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.position.y = 9.5;
  roofMesh.scale.set(1.1, 1, 0.85);
  roofMesh.castShadow = true;
  houseGroup.add(roofMesh);

  // Front Porch & Steps
  const porch = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 4), woodMat);
  porch.position.set(0, 0.4, 7);
  houseGroup.add(porch);

  // Porch roof overhang
  const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 4), roofMat);
  porchRoof.position.set(0, 4.2, 7);
  houseGroup.add(porchRoof);

  // Door & Windows
  const door = new THREE.Mesh(new THREE.BoxGeometry(2, 3.2, 0.2), woodMat);
  door.position.set(0, 2.0, 6.1);
  houseGroup.add(door);

  group.add(houseGroup);

  // 4. THE PARK LAKE WITH WOODEN FISHING DOCK (South-East [28, 0, 26])
  const lake = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 0.2, 24), lakeMat);
  lake.position.set(28, 0.05, 26);
  group.add(lake);

  // Wooden dock projecting into lake
  const dock = new THREE.Mesh(new THREE.BoxGeometry(4, 0.4, 14), woodMat);
  dock.position.set(18, 0.25, 24);
  dock.castShadow = true;
  group.add(dock);

  // 5. PLAYGROUND WITH SWINGS & SLIDE (South-West [-28, 0, 24])
  const playGroup = new THREE.Group();
  playGroup.position.set(-28, 0, 24);

  // Sandbox border
  const sandMat = new THREE.MeshLambertMaterial({ color: 0xfde047 });
  const sandbox = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.3, 16), sandMat);
  sandbox.position.y = 0.15;
  playGroup.add(sandbox);

  // Swing frame
  const metalMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
  const swingTop = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 0.2), metalMat);
  swingTop.position.set(0, 4.2, 0);
  playGroup.add(swingTop);

  const swingLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.5, 6), metalMat);
  swingLeg1.position.set(-4, 2.1, 1.2);
  swingLeg1.rotation.x = 0.3;
  playGroup.add(swingLeg1);

  const swingLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.5, 6), metalMat);
  swingLeg2.position.set(4, 2.1, 1.2);
  swingLeg2.rotation.x = 0.3;
  playGroup.add(swingLeg2);

  group.add(playGroup);

  // 6. CARTOON TREES SCATTERED ACROSS THE PARK
  const createTree = (x: number, z: number, scale = 1.0) => {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2.4, 8), treeTrunkMat);
    trunk.position.y = 1.2;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliage = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8), foliageMat);
    foliage.position.y = 3.2;
    foliage.castShadow = true;
    tree.add(foliage);

    group.add(tree);
  };

  const treeLocations = [
    [-14, -14], [14, -14], [-38, -12], [38, -12],
    [-18, 8], [18, 8], [-42, 18], [42, 18],
    [-8, 38], [8, 38], [-44, -38], [44, -38]
  ];
  treeLocations.forEach(([x, z]) => createTree(x, z, 1.0 + Math.random() * 0.4));

  // 7. PARK GOLF CARTS
  const createGolfCart = (x: number, z: number, rotY: number) => {
    const cart = new THREE.Group();
    cart.position.set(x, 0, z);
    cart.rotation.y = rotY;

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 3.4), cartMat);
    base.position.y = 0.6;
    cart.add(base);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 2.8), cartMat);
    canopy.position.y = 2.0;
    cart.add(canopy);

    group.add(cart);
  };

  createGolfCart(10, -22, Math.PI / 4);
  createGolfCart(-10, -22, -Math.PI / 4);

  // 8. TRAMPOLINE JUMP PADS (Launch players soaring into the sky!)
  const createJumpPad = (id: string, x: number, z: number) => {
    const pad = new THREE.Group();
    pad.position.set(x, 0.1, z);

    // Rim
    const rimMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 0.4, 16), rimMat);
    pad.add(rim);

    // Bouncy canvas center
    const bounceMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const bounce = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.45, 16), bounceMat);
    pad.add(bounce);

    group.add(pad);

    jumpPads.push({
      id,
      position: new THREE.Vector3(x, 0.4, z),
      boostForce: 18.0,
      mesh: pad
    });
  };

  createJumpPad('pad_center', 0, 0);
  createJumpPad('pad_north', 0, -16);
  createJumpPad('pad_west', -24, 0);
  createJumpPad('pad_east', 24, 0);

  // 9. CHAOTIC CARTOON COLLECTIBLES
  const createCollectible = (
    id: string,
    type: 'MEDAL' | 'SODA' | 'DISC' | 'TACO',
    points: number,
    x: number,
    y: number,
    z: number
  ) => {
    const itemGroup = new THREE.Group();
    itemGroup.position.set(x, y, z);

    let itemMat: THREE.Material;
    let itemGeo: THREE.BufferGeometry;

    if (type === 'MEDAL') {
      // Golden DIDY Medal
      itemMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
      itemGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 12);
      const m = new THREE.Mesh(itemGeo, itemMat);
      m.rotation.x = Math.PI / 2;
      itemGroup.add(m);
    } else if (type === 'SODA') {
      // Energy Soda Can
      itemMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4 });
      itemGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.7, 8);
      const m = new THREE.Mesh(itemGeo, itemMat);
      itemGroup.add(m);
    } else if (type === 'DISC') {
      // Golden Laser Disc
      itemMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.9, roughness: 0.1 });
      itemGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.05, 16);
      const m = new THREE.Mesh(itemGeo, itemMat);
      itemGroup.add(m);
    } else {
      // Cheesy Taco
      itemMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });
      itemGeo = new THREE.ConeGeometry(0.4, 0.7, 4);
      const m = new THREE.Mesh(itemGeo, itemMat);
      m.rotation.x = Math.PI / 2;
      itemGroup.add(m);
    }

    // Sparkle halo ring
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 6, 12), ringMat);
    itemGroup.add(ring);

    group.add(itemGroup);

    collectibles.push({
      id,
      type,
      points,
      position: new THREE.Vector3(x, y, z),
      mesh: itemGroup,
      collected: false,
      respawnTimer: 0
    });
  };

  // Scatter items around The Park
  createCollectible('c_medal_center', 'MEDAL', 150, 0, 1.2, 8);
  createCollectible('c_medal_porch', 'MEDAL', 150, 0, 2.2, -21);
  createCollectible('c_disc_dock', 'DISC', 250, 22, 1.4, 24);
  createCollectible('c_soda_sandbox', 'SODA', 75, -28, 1.2, 24);
  createCollectible('c_taco_path1', 'TACO', 100, -12, 1.0, 0);
  createCollectible('c_taco_path2', 'TACO', 100, 12, 1.0, 0);
  createCollectible('c_medal_high1', 'MEDAL', 200, 0, 6.0, 0); // Above jump pad!
  createCollectible('c_disc_high2', 'DISC', 300, 0, 8.5, -16); // High above north pad!

  // 10. MOVING CARTOON CLOUDS
  const clouds: THREE.Mesh[] = [];
  const cloudMat = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85
  });

  for (let c = 0; c < 8; c++) {
    const cloudGeo = new THREE.SphereGeometry(6 + Math.random() * 4, 8, 8);
    const cloud = new THREE.Mesh(cloudGeo, cloudMat);
    cloud.scale.set(1.8, 0.6, 1.2);
    cloud.position.set(
      (Math.random() - 0.5) * 110,
      35 + Math.random() * 10,
      (Math.random() - 0.5) * 110
    );
    group.add(cloud);
    clouds.push(cloud);
  }

  // Height query for collision & park objects
  const getHeightAt = (x: number, z: number): number => {
    return collisionSystem.getGroundHeight(x, z);
  };

  // Animation update for collectibles and clouds
  let mapTime = 0;
  const update = (dt: number) => {
    mapTime += dt;

    // Spin & bob collectibles
    collectibles.forEach(col => {
      if (col.collected) {
        col.respawnTimer -= dt;
        if (col.respawnTimer <= 0) {
          col.collected = false;
          col.mesh.visible = true;
        }
      } else {
        col.mesh.rotation.y += dt * 3.5;
        col.mesh.position.y = col.position.y + Math.sin(mapTime * 4) * 0.15;
      }
    });

    // Drift clouds
    clouds.forEach(cl => {
      cl.position.x += dt * 1.5;
      if (cl.position.x > 70) cl.position.x = -70;
    });
  };

  return {
    group,
    collectibles,
    jumpPads,
    bounds,
    getHeightAt,
    update
  };
}
