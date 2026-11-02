import * as THREE from 'three';

/**
 * Procedural Texture Generator
 * Generates high quality, realistic horror textures via HTML5 2D Canvas.
 * Zero external asset dependencies.
 */

class TextureFactory {
  private cache = new Map<string, THREE.Texture>();

  // Distressed Dirty Hospital Tile Floor
  public getHospitalTileTexture(): THREE.CanvasTexture {
    const key = 'hospital_tiles';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base dirty porcelain color
    ctx.fillStyle = '#222629';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        // Subtle tile color variation
        const shade = Math.floor(35 + Math.random() * 15);
        ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 2})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        // Cracks and scratches
        if (Math.random() > 0.6) {
          ctx.strokeStyle = '#0e1012';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + Math.random() * tileSize, y + Math.random() * tileSize);
          ctx.lineTo(x + Math.random() * tileSize, y + Math.random() * tileSize);
          ctx.stroke();
        }

        // Grime stains
        if (Math.random() > 0.75) {
          ctx.fillStyle = 'rgba(15, 12, 10, 0.4)';
          ctx.beginPath();
          ctx.arc(x + tileSize / 2, y + tileSize / 2, Math.random() * 20 + 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Grout lines
    ctx.strokeStyle = '#101214';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 512; i += tileSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  // Peeling Moldy Sanatorium Wall
  public getGrungeWallTexture(): THREE.CanvasTexture {
    const key = 'grunge_wall';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Distressed medical mint/grey-green wall paint
    ctx.fillStyle = '#2b3430';
    ctx.fillRect(0, 0, 512, 512);

    // Splatters, mold and water drips
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 35;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Peeling paint flakes / brown water seep streaks
    ctx.strokeStyle = 'rgba(20, 18, 12, 0.6)';
    for (let i = 0; i < 25; i++) {
      const startX = Math.random() * 512;
      const startY = Math.random() * 300;
      ctx.lineWidth = Math.random() * 8 + 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + Math.random() * 10 - 5,
        startY + 80,
        startX + Math.random() * 15 - 7,
        startY + 160,
        startX + Math.random() * 10 - 5,
        512
      );
      ctx.stroke();
    }

    // Lower wall dark wainscot border
    ctx.fillStyle = 'rgba(12, 14, 15, 0.85)';
    ctx.fillRect(0, 360, 512, 152);
    ctx.strokeStyle = '#3d4b45';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.lineTo(512, 360);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  // Rusted Metal Texture (Lockers, Doors, Hospital Beds)
  public getRustedMetalTexture(): THREE.CanvasTexture {
    const key = 'rusted_metal';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base gunmetal
    ctx.fillStyle = '#282b30';
    ctx.fillRect(0, 0, 512, 512);

    // Rust patches
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const radius = Math.random() * 45 + 10;
      const grad = ctx.createRadialGradient(rx, ry, 2, rx, ry, radius);
      grad.addColorStop(0, 'rgba(110, 45, 15, 0.85)');
      grad.addColorStop(0.6, 'rgba(75, 30, 10, 0.55)');
      grad.addColorStop(1, 'rgba(40, 43, 48, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  // Bloody Handprint / Smear Decal
  public getBloodSmearTexture(): THREE.CanvasTexture {
    const key = 'blood_smear';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 256);

    // Dark dried coagulated blood
    ctx.fillStyle = 'rgba(110, 8, 8, 0.85)';

    // Palm imprint
    ctx.beginPath();
    ctx.ellipse(128, 140, 36, 48, 0, 0, Math.PI * 2);
    ctx.fill();

    // Finger drag marks
    const fingerAngles = [-0.35, -0.15, 0.05, 0.25, 0.5];
    fingerAngles.forEach((ang, i) => {
      ctx.beginPath();
      const fx = 128 + (i - 2) * 16;
      ctx.moveTo(fx, 110);
      ctx.lineTo(fx + Math.sin(ang) * 15, 40);
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(95, 5, 5, 0.8)';
      ctx.stroke();
    });

    // Drips dripping down
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      const dx = 100 + i * 20;
      ctx.moveTo(dx, 160);
      ctx.lineTo(dx, 220 + Math.random() * 25);
      ctx.strokeStyle = 'rgba(75, 4, 4, 0.75)';
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  // Sanatorium Door Sign (Ward 4 / Morgue / Electrical)
  public createSignTexture(title: string, subtitle: string, warningColor: string = '#d97706'): THREE.CanvasTexture {
    const key = `sign_${title}`;
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Distressed metal plate
    ctx.fillStyle = '#1c1e22';
    ctx.fillRect(0, 0, 512, 256);

    // Border
    ctx.strokeStyle = warningColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, 488, 232);

    // Warning stripe at top
    ctx.fillStyle = warningColor;
    ctx.fillRect(16, 16, 480, 24);

    // Screws at corners
    ctx.fillStyle = '#6b7280';
    [
      [24, 24],
      [488, 24],
      [24, 232],
      [488, 232],
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Sign text
    ctx.fillStyle = '#f3f4f6';
    ctx.font = 'bold 38px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 256, 115);

    ctx.fillStyle = warningColor;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(subtitle, 256, 175);

    // Grime over sign
    ctx.fillStyle = 'rgba(20, 15, 10, 0.4)';
    ctx.fillRect(0, 0, 512, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  // Exit Sign Glowing Texture
  public getExitSignTexture(): THREE.CanvasTexture {
    const key = 'exit_sign';
    if (this.cache.has(key)) return this.cache.get(key) as THREE.CanvasTexture;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#061a0e';
    ctx.fillRect(0, 0, 256, 128);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 64px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT ➜', 128, 64);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }
}

export const textureFactory = new TextureFactory();
