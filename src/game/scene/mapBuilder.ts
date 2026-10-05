import * as THREE from 'three';
import {
  getAsphaltGroundTexture,
  getConcreteTexture,
  getMetalContainerTexture,
  getWoodCrateTexture
} from './textureFactory';

export interface MapObstacle {
  id: string;
  box: THREE.Box3;
  type: 'wall' | 'crate' | 'container' | 'sandbag' | 'building' | 'rooftop' | 'ramp';
  elevation?: number;
  rampNormal?: THREE.Vector3;
}

export interface SupplyStation {
  id: string;
  position: THREE.Vector3;
  type: 'ammo' | 'armor' | 'weapon';
  weaponId?: string;
  respawnTime: number; // in seconds
  lastTakenTime: number;
  mesh: THREE.Group;
}

export interface MapData {
  group: THREE.Group;
  obstacles: MapObstacle[];
  supplies: SupplyStation[];
  spawns: {
    ALPHA: THREE.Vector3[];
    BRAVO: THREE.Vector3[];
  };
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  getHeightAt: (x: number, z: number) => number;
}

export function buildBattlefield(): MapData {
  const mapGroup = new THREE.Group();
  mapGroup.name = 'Battlefield_Outpost7';

  const obstacles: MapObstacle[] = [];
  const supplies: SupplyStation[] = [];

  const mapBounds = { minX: -32, maxX: 32, minZ: -32, maxZ: 32 };

  // Reusable materials
  const groundTex = getAsphaltGroundTexture();
  const groundMat = new THREE.MeshLambertMaterial({
    map: groundTex
  });

  const concreteTex = getConcreteTexture();
  const concreteMat = new THREE.MeshLambertMaterial({
    map: concreteTex
  });

  const woodTex = getWoodCrateTexture();
  const crateMat = new THREE.MeshLambertMaterial({
    map: woodTex
  });

  const sandbagMat = new THREE.MeshLambertMaterial({
    color: 0x9a8057
  });

  const metalDarkMat = new THREE.MeshLambertMaterial({
    color: 0x27272a
  });

  // --- 1. GROUND PLANE ---
  const groundGeo = new THREE.PlaneGeometry(64, 64);
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  mapGroup.add(groundMesh);

  // Helper to add box obstacle
  const addObstacleBox = (
    mesh: THREE.Object3D,
    type: MapObstacle['type'],
    size: [number, number, number],
    pos: [number, number, number]
  ) => {
    mesh.position.set(pos[0], pos[1], pos[2]);
    mapGroup.add(mesh);

    const halfX = size[0] / 2;
    const halfY = size[1] / 2;
    const halfZ = size[2] / 2;
    const box = new THREE.Box3(
      new THREE.Vector3(pos[0] - halfX, pos[1] - halfY, pos[2] - halfZ),
      new THREE.Vector3(pos[0] + halfX, pos[1] + halfY, pos[2] + halfZ)
    );
    obstacles.push({ id: `obs_${obstacles.length}`, box, type, elevation: pos[1] + halfY });
  };

  // --- 2. PERIMETER BOUNDARY WALLS ---
  const wallHeight = 4.5;
  const wallThickness = 1.0;
  // North Wall
  const nWall = new THREE.Mesh(new THREE.BoxGeometry(64, wallHeight, wallThickness), concreteMat);
  addObstacleBox(nWall, 'wall', [64, wallHeight, wallThickness], [0, wallHeight / 2, -32]);
  // South Wall
  const sWall = new THREE.Mesh(new THREE.BoxGeometry(64, wallHeight, wallThickness), concreteMat);
  addObstacleBox(sWall, 'wall', [64, wallHeight, wallThickness], [0, wallHeight / 2, 32]);
  // West Wall
  const wWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 64), concreteMat);
  addObstacleBox(wWall, 'wall', [wallThickness, wallHeight, 64], [-32, wallHeight / 2, 0]);
  // East Wall
  const eWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 64), concreteMat);
  addObstacleBox(eWall, 'wall', [wallThickness, wallHeight, 64], [32, wallHeight / 2, 0]);

  // --- 3. BUILDINGS WITH ACCESSIBLE ROOFTOPS ---

  // A. WEST BUILDING ("Command Outpost Alpha")
  // Dimensions: 12x4.5x10 at [-18, 2.25, 0]
  const bldg1 = new THREE.Mesh(new THREE.BoxGeometry(12, 4.0, 10), concreteMat);
  bldg1.castShadow = true;
  bldg1.receiveShadow = true;
  addObstacleBox(bldg1, 'building', [12, 4.0, 10], [-18, 2.0, 0]);

  // Parapets on rooftop for cover
  const para1 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.9, 0.4), concreteMat);
  addObstacleBox(para1, 'wall', [12, 0.9, 0.4], [-18, 4.45, -4.8]);
  const para2 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.9, 0.4), concreteMat);
  addObstacleBox(para2, 'wall', [12, 0.9, 0.4], [-18, 4.45, 4.8]);

  // Access Ramp to West Building Roof (from South alley)
  // Ramp slope: goes from Y=0 to Y=4 over length 8
  const ramp1Geo = new THREE.BoxGeometry(3.0, 0.4, 8.5);
  const ramp1Mat = new THREE.MeshLambertMaterial({ color: 0x475569 });
  const ramp1Mesh = new THREE.Mesh(ramp1Geo, ramp1Mat);
  ramp1Mesh.rotation.x = -Math.atan2(4.0, 8.0);
  ramp1Mesh.position.set(-18, 2.0, 9.2);
  mapGroup.add(ramp1Mesh);
  // Add step-wise collision for ramp
  for (let step = 0; step < 8; step++) {
    const fraction = (step + 0.5) / 8;
    const stepH = 0.5;
    const stepY = fraction * 4.0;
    const stepZ = 13.0 - fraction * 8.0;
    const dummyBox = new THREE.Box3(
      new THREE.Vector3(-19.5, 0, stepZ - 0.5),
      new THREE.Vector3(-16.5, stepY, stepZ + 0.5)
    );
    obstacles.push({ id: `ramp1_step_${step}`, box: dummyBox, type: 'ramp', elevation: stepY });
  }

  // B. EAST BUILDING ("Storage Depot Bravo")
  // Dimensions: 12x4.5x10 at [18, 2.25, 0]
  const bldg2 = new THREE.Mesh(new THREE.BoxGeometry(12, 4.0, 10), concreteMat);
  bldg2.castShadow = true;
  bldg2.receiveShadow = true;
  addObstacleBox(bldg2, 'building', [12, 4.0, 10], [18, 2.0, 0]);

  // Parapets on East rooftop
  const para3 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.9, 0.4), concreteMat);
  addObstacleBox(para3, 'wall', [12, 0.9, 0.4], [18, 4.45, -4.8]);
  const para4 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.9, 0.4), concreteMat);
  addObstacleBox(para4, 'wall', [12, 0.9, 0.4], [18, 4.45, 4.8]);

  // Access Ramp to East Building Roof (from North alley)
  const ramp2Geo = new THREE.BoxGeometry(3.0, 0.4, 8.5);
  const ramp2Mesh = new THREE.Mesh(ramp2Geo, ramp1Mat);
  ramp2Mesh.rotation.x = Math.atan2(4.0, 8.0);
  ramp2Mesh.position.set(18, 2.0, -9.2);
  mapGroup.add(ramp2Mesh);
  for (let step = 0; step < 8; step++) {
    const fraction = (step + 0.5) / 8;
    const stepY = fraction * 4.0;
    const stepZ = -13.0 + fraction * 8.0;
    const dummyBox = new THREE.Box3(
      new THREE.Vector3(16.5, 0, stepZ - 0.5),
      new THREE.Vector3(19.5, stepY, stepZ + 0.5)
    );
    obstacles.push({ id: `ramp2_step_${step}`, box: dummyBox, type: 'ramp', elevation: stepY });
  }

  // C. NORTH & SOUTH DEFENSIVE HOUSES
  // North Bunker House [0, 1.75, -20]
  const nBunker = new THREE.Mesh(new THREE.BoxGeometry(8, 3.5, 5), concreteMat);
  addObstacleBox(nBunker, 'building', [8, 3.5, 5], [0, 1.75, -20]);

  // South Bunker House [0, 1.75, 20]
  const sBunker = new THREE.Mesh(new THREE.BoxGeometry(8, 3.5, 5), concreteMat);
  addObstacleBox(sBunker, 'building', [8, 3.5, 5], [0, 1.75, 20]);

  // --- 4. CENTRAL COMBAT ARENA ---
  // Central octagonal / round raised platform with monument & sandbag perimeter
  const centerPlat = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.2, 0.5, 12), concreteMat);
  centerPlat.position.set(0, 0.25, 0);
  mapGroup.add(centerPlat);
  const centerPlatBox = new THREE.Box3(
    new THREE.Vector3(-5, 0, -5),
    new THREE.Vector3(5, 0.5, 5)
  );
  obstacles.push({ id: 'obs_center_plat', box: centerPlatBox, type: 'wall', elevation: 0.5 });

  // Center tactical monument / communications spire
  const spireBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 1.6), metalDarkMat);
  spireBase.castShadow = true;
  addObstacleBox(spireBase, 'wall', [1.6, 2.6, 1.6], [0, 1.8, 0]);

  // --- 5. METAL SHIPPING CONTAINERS ---
  const containerBlueTex = getMetalContainerTexture('#1e3a5f', 'SECTOR-A');
  const containerBlueMat = new THREE.MeshLambertMaterial({ map: containerBlueTex });

  const containerRedTex = getMetalContainerTexture('#991b1b', 'HAZARD-B');
  const containerRedMat = new THREE.MeshLambertMaterial({ map: containerRedTex });

  const containerGreenTex = getMetalContainerTexture('#2d4030', 'CARGO-7');
  const containerGreenMat = new THREE.MeshLambertMaterial({ map: containerGreenTex });

  // Container 1: Center-West [ -7, 1.3, -5 ]
  const c1 = new THREE.Mesh(new THREE.BoxGeometry(6, 2.6, 2.6), containerBlueMat);
  c1.castShadow = true;
  addObstacleBox(c1, 'container', [6, 2.6, 2.6], [-7, 1.3, -5]);

  // Container 2: Center-East [ 7, 1.3, 5 ]
  const c2 = new THREE.Mesh(new THREE.BoxGeometry(6, 2.6, 2.6), containerRedMat);
  c2.castShadow = true;
  addObstacleBox(c2, 'container', [6, 2.6, 2.6], [7, 1.3, 5]);

  // Container 3: North-West [ -14, 1.3, -16 ]
  const c3 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 6), containerGreenMat);
  c3.castShadow = true;
  addObstacleBox(c3, 'container', [2.6, 2.6, 6], [-14, 1.3, -16]);

  // Container 4: South-East [ 14, 1.3, 16 ]
  const c4 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 6), containerBlueMat);
  c4.castShadow = true;
  addObstacleBox(c4, 'container', [2.6, 2.6, 6], [14, 1.3, 16]);

  // --- 6. WOODEN CRATES (STACKED) ---
  const createCrate = (x: number, y: number, z: number, size = 1.2) => {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), crateMat);
    crate.castShadow = true;
    addObstacleBox(crate, 'crate', [size, size, size], [x, y, z]);
  };

  // Stack 1 at Center North [ -2, 0.6, -7 ]
  createCrate(-2, 0.6, -7, 1.2);
  createCrate(-0.8, 0.6, -7, 1.2);
  createCrate(-1.4, 1.8, -7, 1.2); // 2nd tier

  // Stack 2 at Center South [ 2, 0.6, 7 ]
  createCrate(2, 0.6, 7, 1.2);
  createCrate(0.8, 0.6, 7, 1.2);
  createCrate(1.4, 1.8, 7, 1.2);

  // Scattered crates in alleys
  createCrate(-8, 0.6, 12, 1.2);
  createCrate(8, 0.6, -12, 1.2);
  createCrate(-24, 0.6, -8, 1.2);
  createCrate(24, 0.6, 8, 1.2);

  // --- 7. SANDBAG BARRICADES & CONCRETE JERSEY WALLS ---
  const createSandbagRow = (x: number, z: number, rotY: number, length = 3.2) => {
    const bagGroup = new THREE.Group();
    const rows = 3;
    const cols = Math.floor(length / 0.8);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bag = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.28, 0.4), sandbagMat);
        bag.position.set((c - cols / 2 + 0.5) * 0.78, r * 0.26 + 0.14, 0);
        bag.castShadow = true;
        bagGroup.add(bag);
      }
    }
    bagGroup.position.set(x, 0, z);
    bagGroup.rotation.y = rotY;
    mapGroup.add(bagGroup);

    const halfL = length / 2;
    const box = new THREE.Box3(
      new THREE.Vector3(x - halfL, 0, z - 0.5),
      new THREE.Vector3(x + halfL, 0.85, z + 0.5)
    );
    obstacles.push({ id: `sandbag_${obstacles.length}`, box, type: 'sandbag', elevation: 0.85 });
  };

  createSandbagRow(0, -3.8, 0, 4.0);
  createSandbagRow(0, 3.8, 0, 4.0);
  createSandbagRow(-3.8, 0, Math.PI / 2, 4.0);
  createSandbagRow(3.8, 0, Math.PI / 2, 4.0);

  // Concrete barricades in narrow alleys
  const createJerseyBarrier = (x: number, z: number, rotY: number) => {
    const barrier = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.1, 0.6), concreteMat);
    barrier.rotation.y = rotY;
    barrier.castShadow = true;
    addObstacleBox(barrier, 'wall', [2.8, 1.1, 0.6], [x, 0.55, z]);
  };

  createJerseyBarrier(-10, 8, 0);
  createJerseyBarrier(10, -8, 0);
  createJerseyBarrier(-12, -8, Math.PI / 4);
  createJerseyBarrier(12, 8, Math.PI / 4);

  // --- 8. WEAPON & AMMO SUPPLY STATIONS ---
  const createSupply = (
    id: string,
    pos: [number, number, number],
    type: 'ammo' | 'armor' | 'weapon',
    weaponId?: string
  ) => {
    const supplyGroup = new THREE.Group();
    supplyGroup.position.set(pos[0], pos[1], pos[2]);

    // Base pedestal
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.8, 0.2, 8),
      metalDarkMat
    );
    supplyGroup.add(pedestal);

    // Glowing indicator beacon
    const beaconGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: type === 'ammo' ? 0x38bdf8 : type === 'armor' ? 0x22c55e : 0xf59e0b
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 0.5;
    supplyGroup.add(beacon);

    // Light beacon column
    const auraGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
    const auraMat = new THREE.MeshBasicMaterial({
      color: type === 'ammo' ? 0x38bdf8 : type === 'armor' ? 0x22c55e : 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.y = 0.7;
    supplyGroup.add(aura);

    mapGroup.add(supplyGroup);

    supplies.push({
      id,
      position: new THREE.Vector3(...pos),
      type,
      weaponId,
      respawnTime: 20,
      lastTakenTime: -100,
      mesh: supplyGroup
    });
  };

  // Center ammo station
  createSupply('sup_center_ammo', [0, 0.6, 0], 'ammo');
  // West rooftop sniper rifle pickup!
  createSupply('sup_west_sniper', [-18, 4.3, 0], 'weapon', 'wep_awm');
  // East rooftop SPAS shotgun pickup!
  createSupply('sup_east_shotgun', [18, 4.3, 0], 'weapon', 'wep_spas12');
  // North alley armor kit
  createSupply('sup_north_armor', [-10, 0.2, -18], 'armor');
  // South alley armor kit
  createSupply('sup_south_armor', [10, 0.2, 18], 'armor');

  // --- SPAWN POINTS ---
  const spawns = {
    ALPHA: [
      new THREE.Vector3(-4, 0.1, 26),
      new THREE.Vector3(0, 0.1, 27),
      new THREE.Vector3(4, 0.1, 26),
      new THREE.Vector3(0, 0.1, 24)
    ],
    BRAVO: [
      new THREE.Vector3(-4, 0.1, -26),
      new THREE.Vector3(0, 0.1, -27),
      new THREE.Vector3(4, 0.1, -26),
      new THREE.Vector3(0, 0.1, -24)
    ]
  };

  // --- HEIGHT QUERY FOR ROOFTOPS, CRATES, RAMPS ---
  const getHeightAt = (x: number, z: number): number => {
    let maxHeight = 0;
    const testPoint = new THREE.Vector3(x, 0, z);

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (
        x >= obs.box.min.x - 0.2 &&
        x <= obs.box.max.x + 0.2 &&
        z >= obs.box.min.z - 0.2 &&
        z <= obs.box.max.z + 0.2
      ) {
        if (obs.elevation && obs.elevation > maxHeight) {
          maxHeight = obs.elevation;
        }
      }
    }
    return maxHeight;
  };

  return {
    group: mapGroup,
    obstacles,
    supplies,
    spawns,
    bounds: mapBounds,
    getHeightAt
  };
}
