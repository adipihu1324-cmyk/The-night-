import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { sound } from '../../audio/SoundEngine';
import { GraphicsSettings } from '../../types/game';
import { MonsterAI } from '../ai/MonsterAI';
import { MapData, SanatoriumMap } from '../levels/SanatoriumMap';
import { MaterialPalette } from '../materials';
import { ModelFactory } from '../models';
import { PlayerController } from './PlayerController';

export class GameScene {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public player: PlayerController;
  public monster: MonsterAI;
  public mapData: MapData;

  private isSoftwareGl: boolean;
  private animFrameId: number = 0;
  private clock: THREE.Clock;
  private rainParticles: THREE.Points | null = null;
  private lightningTimer: number = 8.0;

  // Closest interactive object in player view
  public activeInteractive: any = null;

  // Callbacks
  public onPlayerCaught: () => void = () => {};
  public onEndingReached: () => void = () => {};
  public onInteractiveChange: (target: any) => void = () => {};

  // Settings
  private targetFps: number = 60;
  private lastRenderTime: number = 0;

  constructor(container: HTMLDivElement, settings: GraphicsSettings) {
    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && settings.preset !== 'low',
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    const pixelRatio = this.isSoftwareGl
      ? 1.0
      : Math.min(window.devicePixelRatio, 2) * settings.renderScale;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    this.renderer.shadowMap.enabled = !this.isSoftwareGl && settings.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030508);
    this.scene.fog = new THREE.FogExp2(0x030508, 0.08);

    // 4. Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Camera & Player
    this.camera = new THREE.PerspectiveCamera(
      72,
      container.clientWidth / container.clientHeight,
      0.1,
      60
    );
    this.scene.add(this.camera);

    // 6. Materials & Models Palette
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const materials = new MaterialPalette(maxAnisotropy);
    const models = new ModelFactory(materials);

    // 7. Sanatorium Map
    this.mapData = SanatoriumMap.build(materials, models);
    this.scene.add(this.mapData.sceneGroup);

    // 8. Player Setup
    this.player = new PlayerController(this.camera, this.mapData.spawnPoint);
    this.player.setCollisionBoxes(this.mapData.collisionBoxes);

    // 9. Monster Creature Setup
    const creatureData = models.createCreature();
    this.scene.add(creatureData.group);
    this.monster = new MonsterAI(
      creatureData.group,
      creatureData.parts,
      this.mapData.patrolWaypoints,
      this.mapData.collisionBoxes,
      this.mapData.monsterSpawnPoint
    );

    // 10. Rain Particle System
    if (settings.particles) {
      this.initRainParticles();
    }

    this.clock = new THREE.Clock();
    this.targetFps = settings.fpsCap;

    // Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  private initRainParticles() {
    const rainCount = 600;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = -20 - Math.random() * 12; // outside bay
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.scene.add(this.rainParticles);
  }

  public startLoop() {
    const tick = () => {
      this.animFrameId = requestAnimationFrame(tick);

      const now = performance.now();
      const interval = 1000 / this.targetFps;
      const elapsed = now - this.lastRenderTime;

      if (elapsed < interval) return;
      this.lastRenderTime = now - (elapsed % interval);

      const delta = Math.min(this.clock.getDelta(), 0.1);
      this.update(delta);
      this.renderer.render(this.scene, this.camera);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  public stopLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  private update(delta: number) {
    // 1. Monster Update
    this.monster.update(
      delta,
      this.player.position,
      this.player.stats.flashlightOn,
      this.player.stats.isSprinting,
      this.player.stats.isCrouching,
      this.player.stats.isHiding
    );

    if (this.monster.hasCaughtPlayer) {
      this.onPlayerCaught();
      return;
    }

    // 2. Flickering Lights (Atmospheric tension)
    this.mapData.flickerLights.forEach((light) => {
      if (Math.random() < 0.06) {
        light.intensity = Math.random() * 0.9;
      }
    });

    // 3. Lightning Storm Event
    this.lightningTimer -= delta;
    if (this.lightningTimer <= 0) {
      this.triggerLightningFlash();
      this.lightningTimer = 7.0 + Math.random() * 14.0;
    }

    // 4. Update Rain Particles
    if (this.rainParticles) {
      const pos = this.rainParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= delta * 12.0; // fall down
        if (pos[i] < 0) pos[i] = 8.0;
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 5. Check Closest Interactive
    this.checkInteractive();
  }

  private triggerLightningFlash() {
    this.mapData.windowLights.forEach((light) => {
      light.intensity = 28.0;
    });

    sound.playThunderclap();

    setTimeout(() => {
      this.mapData.windowLights.forEach((light) => {
        light.intensity = 0.0;
      });
    }, 180);
  }

  private checkInteractive() {
    let closestTarget: any = null;
    let minDistance = 999;

    for (const item of this.mapData.interactives) {
      if (item.isCollected) continue;

      const dist = this.player.position.distanceTo(item.position);
      if (dist <= item.radius && dist < minDistance) {
        minDistance = dist;
        closestTarget = item;
      }
    }

    if (closestTarget !== this.activeInteractive) {
      this.activeInteractive = closestTarget;
      this.onInteractiveChange(closestTarget);
    }
  }

  public handleInteract(inventory: string[]): {
    success: boolean;
    type: string;
    message?: string;
    data?: any;
  } {
    if (!this.activeInteractive) return { success: false, type: 'none' };

    const item = this.activeInteractive;

    // DOOR INTERACTION
    if (item.type === 'door') {
      if (item.locked) {
        if (item.requiresItem && inventory.includes(item.requiresItem)) {
          item.locked = false;
          sound.playDoorCreak(true);
          this.animateDoorOpen(item);
          return {
            success: true,
            type: 'door_unlocked',
            message: `Unlocked ${item.label}!`,
          };
        } else {
          sound.playDoorLocked();
          return {
            success: false,
            type: 'door_locked',
            message: `Locked! Requires ${item.requiresItem ? item.requiresItem.replace('_', ' ') : 'a key'}.`,
          };
        }
      } else {
        // Toggle door
        item.isOpen = !item.isOpen;
        sound.playDoorCreak(false);
        this.animateDoorOpen(item);
        return { success: true, type: 'door_toggle' };
      }
    }

    // LOCKER INTERACTION
    if (item.type === 'locker') {
      if (this.player.stats.isHiding) {
        this.player.exitLocker();
        return { success: true, type: 'locker_exit' };
      } else {
        this.player.enterLocker(item);
        return { success: true, type: 'locker_enter' };
      }
    }

    // ITEM PICKUP (Key, Battery, Note)
    if (item.type === 'key') {
      item.isCollected = true;
      if (item.group) this.scene.remove(item.group);
      sound.playPickup();
      return {
        success: true,
        type: 'item_picked',
        data: item.data,
      };
    }

    if (item.type === 'battery') {
      item.isCollected = true;
      if (item.group) this.scene.remove(item.group);
      this.player.rechargeBattery(50);
      return {
        success: true,
        type: 'battery_picked',
        message: 'Flashlight recharged +50%',
      };
    }

    if (item.type === 'note') {
      sound.playPickup();
      return {
        success: true,
        type: 'note_inspect',
        data: item.data,
      };
    }

    // PUZZLE INTERACTION (Breaker or Keypad)
    if (item.type === 'breaker') {
      return {
        success: true,
        type: 'breaker_puzzle',
        data: item.data,
      };
    }

    if (item.type === 'keypad') {
      return {
        success: true,
        type: 'keypad_puzzle',
        data: item.data,
      };
    }

    // AMBULANCE ESCAPE (Final Ending!)
    if (item.type === 'ambulance') {
      if (inventory.includes('ambulance_key')) {
        this.onEndingReached();
        return { success: true, type: 'escape_success' };
      } else {
        sound.playDoorLocked();
        return {
          success: false,
          type: 'ambulance_no_key',
          message: 'Ignition locked! Need the ambulance ignition key from the morgue.',
        };
      }
    }

    return { success: false, type: 'unknown' };
  }

  private animateDoorOpen(item: any) {
    if (!item.doorPivot) return;
    const targetAngle = item.isOpen ? Math.PI * 0.55 : 0;
    item.doorPivot.rotation.y = targetAngle;
  }

  public unlockPharmacyDoor() {
    const pharm = this.mapData.interactives.find((i) => i.id === 'door_pharmacy');
    if (pharm) {
      pharm.locked = false;
      pharm.isOpen = true;
      sound.playDoorCreak(true);
      this.animateDoorOpen(pharm);
    }
  }

  public solveBreakerPuzzle() {
    sound.playBreakerSwitch();
    // Power restored! Light up breaker light green
    if (this.mapData.breakerLight) {
      this.mapData.breakerLight.color.setHex(0x22c55e);
      this.mapData.breakerLight.intensity = 1.8;
    }
    // Turn all flicker lights steady brighter
    this.mapData.flickerLights.forEach((light) => {
      light.intensity = 1.4;
      light.color.setHex(0xfef08a);
    });
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public updateSettings(settings: GraphicsSettings) {
    this.targetFps = settings.fpsCap;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && settings.shadows;
    const pixelRatio = this.isSoftwareGl
      ? 1.0
      : Math.min(window.devicePixelRatio, 2) * settings.renderScale;
    this.renderer.setPixelRatio(pixelRatio);
  }

  public restartGame() {
    this.player.reset(this.mapData.spawnPoint);
    this.monster.reset(this.mapData.monsterSpawnPoint);
  }

  public dispose() {
    this.stopLoop();
    this.renderer.dispose();
  }
}
