import * as THREE from 'three';
import { WeaponDef, WeaponSkin } from '../types';

export interface WeaponMeshAttachment {
  group: THREE.Group;
  muzzlePoint: THREE.Vector3;
  ejectionPoint: THREE.Vector3;
  setSkin: (skin: WeaponSkin) => void;
}

export function buildWeaponMesh(weapon: WeaponDef, skin?: WeaponSkin): WeaponMeshAttachment {
  const group = new THREE.Group();
  group.name = `Weapon_${weapon.id}`;

  const primaryCol = skin ? parseInt(skin.primaryColor.replace('#', '0x')) : 0x27272a;
  const accentCol = skin ? parseInt(skin.accentColor.replace('#', '0x')) : 0x52525b;

  const bodyMat = new THREE.MeshLambertMaterial({ color: primaryCol });
  const accentMat = new THREE.MeshLambertMaterial({ color: accentCol });
  const darkMetalMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f });

  let muzzlePos = new THREE.Vector3(0, 0.05, -0.6);
  const ejectionPos = new THREE.Vector3(0.08, 0.06, -0.15);

  switch (weapon.category) {
    case 'AR': {
      // Main receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.45), bodyMat);
      group.add(receiver);

      // Barrel & Handguard
      const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.3), accentMat);
      handguard.position.set(0, 0.01, -0.32);
      group.add(handguard);

      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.35, 8), darkMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -0.5);
      group.add(barrel);

      // Curved Magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.1), darkMetalMat);
      mag.position.set(0, -0.14, -0.05);
      mag.rotation.x = 0.2;
      group.add(mag);

      // Tactical Stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.28), accentMat);
      stock.position.set(0, -0.02, 0.32);
      group.add(stock);

      // Iron Sights / Red Dot
      const sight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.08), darkMetalMat);
      sight.position.set(0, 0.08, 0.05);
      group.add(sight);

      muzzlePos = new THREE.Vector3(0, 0.02, -0.68);
      break;
    }

    case 'SMG': {
      // Compact receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.3), bodyMat);
      group.add(receiver);

      // Short barrel
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.18, 8), darkMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.01, -0.22);
      group.add(barrel);

      // Straight magazine
      const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.06), darkMetalMat);
      mag.position.set(0, -0.12, -0.02);
      group.add(mag);

      // Folding wire stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.2), accentMat);
      stock.position.set(0, -0.01, 0.22);
      group.add(stock);

      muzzlePos = new THREE.Vector3(0, 0.01, -0.32);
      break;
    }

    case 'SHOTGUN': {
      // Heavy shotgun receiver
      const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 0.38), bodyMat);
      group.add(receiver);

      // Double heavy barrel / tube magazine
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.45, 8), darkMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.03, -0.4);
      group.add(barrel);

      const magTube = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), darkMetalMat);
      magTube.rotation.x = Math.PI / 2;
      magTube.position.set(0, -0.02, -0.38);
      group.add(magTube);

      // Pump slide handle
      const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 8), accentMat);
      pump.rotation.x = Math.PI / 2;
      pump.position.set(0, -0.02, -0.35);
      group.add(pump);

      // Solid tactical stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.32), accentMat);
      stock.position.set(0, -0.04, 0.3);
      group.add(stock);

      muzzlePos = new THREE.Vector3(0, 0.03, -0.64);
      break;
    }

    case 'SNIPER': {
      // Long chassis
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.5), bodyMat);
      group.add(chassis);

      // Extended precision barrel + Muzzle brake
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8), darkMetalMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.01, -0.55);
      group.add(barrel);

      const brake = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.1), accentMat);
      brake.position.set(0, 0.01, -0.88);
      group.add(brake);

      // High-magnification Scope
      const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.28, 8), accentMat);
      scopeBody.rotation.x = Math.PI / 2;
      scopeBody.position.set(0, 0.09, -0.05);
      group.add(scopeBody);

      const scopeMount = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.08), darkMetalMat);
      scopeMount.position.set(0, 0.05, -0.05);
      group.add(scopeMount);

      // Thumbhole stock
      const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.35), bodyMat);
      stock.position.set(0, -0.04, 0.38);
      group.add(stock);

      muzzlePos = new THREE.Vector3(0, 0.01, -0.94);
      break;
    }

    case 'PISTOL': {
      // Slide
      const slide = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.22), accentMat);
      slide.position.set(0, 0.04, -0.04);
      group.add(slide);

      // Grip
      const grip = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.15, 0.08), bodyMat);
      grip.position.set(0, -0.06, 0.02);
      grip.rotation.x = 0.2;
      group.add(grip);

      muzzlePos = new THREE.Vector3(0, 0.04, -0.16);
      break;
    }

    case 'MELEE': {
      // Knife blade
      const bladeGeo = new THREE.BoxGeometry(0.015, 0.05, 0.22);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0, 0, -0.16);
      group.add(blade);

      // Guard
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.02), darkMetalMat);
      guard.position.set(0, 0, -0.05);
      group.add(guard);

      // Handle grip
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), bodyMat);
      handle.rotation.x = Math.PI / 2;
      handle.position.set(0, 0, 0.03);
      group.add(handle);

      muzzlePos = new THREE.Vector3(0, 0, -0.28);
      break;
    }

    case 'GRENADE': {
      // M67 grenade pineapple sphere/oval
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), bodyMat);
      group.add(body);

      // Top spoon & safety pin
      const fuze = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), darkMetalMat);
      fuze.position.y = 0.07;
      group.add(fuze);

      const lever = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.08, 0.01), accentMat);
      lever.position.set(0.03, 0.04, 0);
      group.add(lever);

      muzzlePos = new THREE.Vector3(0, 0.08, 0);
      break;
    }
  }

  const setSkin = (newSkin: WeaponSkin) => {
    const pCol = parseInt(newSkin.primaryColor.replace('#', '0x'));
    const aCol = parseInt(newSkin.accentColor.replace('#', '0x'));
    bodyMat.color.setHex(pCol);
    accentMat.color.setHex(aCol);
  };

  return {
    group,
    muzzlePoint: muzzlePos,
    ejectionPoint: ejectionPos,
    setSkin
  };
}
