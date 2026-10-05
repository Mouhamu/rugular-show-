import * as THREE from 'three';

/**
 * Procedural Texture Generator
 * Optimized for low-end/mid-range mobile devices:
 * - 128x128 or 256x256 resolution canvases
 * - Zero network latency, instant loading, 100% offline
 */

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getCamoTexture(primaryColor: string, secondaryColor: string): THREE.CanvasTexture {
  const key = `camo_${primaryColor}_${secondaryColor}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Base primary fill
  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, 128, 128);

  // Organic camo patches
  ctx.fillStyle = secondaryColor;
  for (let i = 0; i < 8; i++) {
    const cx = (i * 37) % 128;
    const cy = (i * 53) % 128;
    const r = 18 + (i % 3) * 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 12, cy - 8, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark accent spots
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  for (let i = 0; i < 5; i++) {
    const cx = (i * 47) % 128;
    const cy = (i * 29) % 128;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set(key, texture);
  return texture;
}

export function getMetalContainerTexture(colorHex: string, label: string = 'OUTPOST-7'): THREE.CanvasTexture {
  const key = `container_${colorHex}_${label}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 256, 128);

  // Corrugated vertical ribs
  const ribWidth = 16;
  for (let x = 0; x < 256; x += ribWidth) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x, 0, ribWidth / 2, 128);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(x + ribWidth / 2, 0, ribWidth / 2, 128);
  }

  // Tactical stencil identifier
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(label, 24, 70);

  // Danger hazard border
  ctx.fillStyle = 'rgba(234, 179, 8, 0.85)';
  for (let i = 0; i < 256; i += 24) {
    ctx.fillRect(i, 0, 12, 6);
    ctx.fillRect(i, 122, 12, 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

export function getWoodCrateTexture(): THREE.CanvasTexture {
  const key = 'wood_crate';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Wood background
  ctx.fillStyle = '#92613b';
  ctx.fillRect(0, 0, 128, 128);

  // Horizontal wood planks
  for (let y = 0; y < 128; y += 32) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, y, 128, 2);
  }

  // Cross brace diagonals
  ctx.strokeStyle = '#5a3617';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 114, 114);

  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.lineTo(118, 118);
  ctx.moveTo(118, 10);
  ctx.lineTo(10, 118);
  ctx.stroke();

  // Corner bolts
  ctx.fillStyle = '#262626';
  [12, 116].forEach(x => {
    [12, 116].forEach(y => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}

export function getConcreteTexture(): THREE.CanvasTexture {
  const key = 'concrete_wall';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, 128, 128);

  // Fine concrete noise
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 128;
    const y = Math.random() * 128;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.12)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Panel division lines
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.fillRect(0, 63, 128, 2);
  ctx.fillRect(63, 0, 2, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set(key, texture);
  return texture;
}

export function getAsphaltGroundTexture(): THREE.CanvasTexture {
  const key = 'asphalt_ground';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#262d35';
  ctx.fillRect(0, 0, 256, 256);

  // Aggregate stone specks
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(200, 210, 220, 0.1)' : 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Subtle grid pavement joints
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  textureCache.set(key, texture);
  return texture;
}
