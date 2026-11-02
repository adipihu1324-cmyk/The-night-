import * as THREE from 'three';
import { textureFactory } from './textures';

/**
 * Three.js PBR Materials Palette
 * Optimized for mobile Android & desktop with realistic horror lighting response.
 */

export class MaterialPalette {
  public floorMaterial: THREE.MeshStandardMaterial;
  public wallMaterial: THREE.MeshStandardMaterial;
  public ceilingMaterial: THREE.MeshStandardMaterial;
  public doorWoodMaterial: THREE.MeshStandardMaterial;
  public metalMaterial: THREE.MeshStandardMaterial;
  public bloodDecalMaterial: THREE.MeshStandardMaterial;
  public exitSignMaterial: THREE.MeshBasicMaterial;
  public glassMaterial: THREE.MeshPhysicalMaterial;
  public monsterMaterial: THREE.MeshStandardMaterial;
  public eyeGlowMaterial: THREE.MeshBasicMaterial;

  constructor(maxAnisotropy: number = 4) {
    const tileTex = textureFactory.getHospitalTileTexture();
    tileTex.repeat.set(8, 8);
    tileTex.anisotropy = maxAnisotropy;

    this.floorMaterial = new THREE.MeshStandardMaterial({
      map: tileTex,
      roughness: 0.35,
      metalness: 0.15,
    });

    const wallTex = textureFactory.getGrungeWallTexture();
    wallTex.repeat.set(4, 2);
    wallTex.anisotropy = maxAnisotropy;

    this.wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x14171a,
      roughness: 0.95,
      metalness: 0.0,
    });

    const rustTex = textureFactory.getRustedMetalTexture();
    rustTex.repeat.set(2, 2);
    rustTex.anisotropy = maxAnisotropy;

    this.doorWoodMaterial = new THREE.MeshStandardMaterial({
      map: rustTex,
      roughness: 0.65,
      metalness: 0.3,
    });

    this.metalMaterial = new THREE.MeshStandardMaterial({
      map: rustTex,
      roughness: 0.45,
      metalness: 0.75,
    });

    const bloodTex = textureFactory.getBloodSmearTexture();
    this.bloodDecalMaterial = new THREE.MeshStandardMaterial({
      map: bloodTex,
      transparent: true,
      opacity: 0.9,
      roughness: 0.2, // wet fresh blood sheen
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      depthWrite: false,
    });

    const exitTex = textureFactory.getExitSignTexture();
    this.exitSignMaterial = new THREE.MeshBasicMaterial({
      map: exitTex,
    });

    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xa0c0d0,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      ior: 1.5,
      depthWrite: false,
    });

    // Monster Skin: pale grey-veined decomposing skin
    this.monsterMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d3835,
      roughness: 0.6,
      metalness: 0.1,
      wireframe: false,
    });

    // Glowing hollow yellow-red eyes
    this.eyeGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff3b30,
    });
  }
}
