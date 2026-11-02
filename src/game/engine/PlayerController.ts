import * as THREE from 'three';
import { sound } from '../../audio/SoundEngine';
import { PlayerStats } from '../../types/game';
import { CollisionBox, InteractiveEntity } from '../levels/SanatoriumMap';

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public flashlight: THREE.SpotLight;
  public flashlightTarget: THREE.Object3D;

  public position: THREE.Vector3;
  public yaw: number = 0; // horizontal rotation
  public pitch: number = 0; // vertical camera tilt

  public stats: PlayerStats = {
    health: 100,
    stamina: 100,
    sanity: 100,
    flashlightOn: true,
    battery: 85,
    isCrouching: false,
    isSprinting: false,
    isHiding: false,
  };

  private walkSpeed: number = 2.8;
  private sprintSpeed: number = 5.2;
  private crouchSpeed: number = 1.4;

  private headBobTimer: number = 0;
  private footstepTimer: number = 0;
  private targetHeight: number = 1.7;
  private currentHeight: number = 1.7;

  private collisionBoxes: CollisionBox[] = [];
  public currentHidingEntity: InteractiveEntity | null = null;
  private lockerOriginalPos: THREE.Vector3 = new THREE.Vector3();

  constructor(camera: THREE.PerspectiveCamera, initialPos: THREE.Vector3) {
    this.camera = camera;
    this.position = initialPos.clone();
    this.camera.position.copy(this.position);

    // Flashlight SpotLight attached to player camera
    this.flashlight = new THREE.SpotLight(0xfff7e6, 2.8, 16, Math.PI / 6, 0.45, 1.6);
    this.flashlight.castShadow = true;
    this.flashlight.shadow.mapSize.width = 1024;
    this.flashlight.shadow.mapSize.height = 1024;
    this.flashlight.shadow.bias = -0.001;

    this.flashlightTarget = new THREE.Object3D();
    this.flashlight.target = this.flashlightTarget;

    this.camera.add(this.flashlight);
    this.camera.add(this.flashlightTarget);
    this.flashlightTarget.position.set(0, 0, -5);
    this.flashlight.position.set(0.18, -0.15, 0.1); // held at shoulder
  }

  public setCollisionBoxes(boxes: CollisionBox[]) {
    this.collisionBoxes = boxes;
  }

  public rotateCamera(deltaYaw: number, deltaPitch: number, invertY: boolean = false) {
    if (this.stats.isHiding) {
      // Limit yaw inside locker so you only peek through front slats
      this.yaw += deltaYaw * 0.5;
      this.pitch += (invertY ? deltaPitch : -deltaPitch) * 0.5;
      this.pitch = Math.max(-0.4, Math.min(0.4, this.pitch));
      return;
    }

    this.yaw -= deltaYaw;
    const pitchDelta = invertY ? -deltaPitch : deltaPitch;
    this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - pitchDelta));
  }

  public update(delta: number, moveInput: { x: number; y: number }) {
    // 1. Flashlight Battery Drain & Flicker
    if (this.stats.flashlightOn) {
      this.stats.battery = Math.max(0, this.stats.battery - delta * 0.45);
      if (this.stats.battery <= 0) {
        this.stats.flashlightOn = false;
        this.flashlight.intensity = 0;
      } else if (this.stats.battery < 20 && Math.random() < 0.12) {
        // Low battery flicker
        this.flashlight.intensity = Math.random() * 0.8;
      } else {
        this.flashlight.intensity = 2.8;
      }
    } else {
      this.flashlight.intensity = 0;
      // In pitch darkness, sanity depletes slightly
      this.stats.sanity = Math.max(10, this.stats.sanity - delta * 0.8);
    }

    // 2. Hiding Logic
    if (this.stats.isHiding) {
      this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
      return;
    }

    // 3. Sprinting & Stamina
    const isMoving = Math.abs(moveInput.x) > 0.05 || Math.abs(moveInput.y) > 0.05;
    if (this.stats.isSprinting && isMoving && !this.stats.isCrouching) {
      this.stats.stamina = Math.max(0, this.stats.stamina - delta * 22);
      if (this.stats.stamina <= 0) {
        this.stats.isSprinting = false;
      }
    } else {
      this.stats.stamina = Math.min(100, this.stats.stamina + delta * 14);
    }

    // 4. Crouch Height Transition
    this.targetHeight = this.stats.isCrouching ? 0.95 : 1.7;
    this.currentHeight = THREE.MathUtils.damp(this.currentHeight, this.targetHeight, 10, delta);

    // 5. Movement Calculation
    let currentSpeed = this.walkSpeed;
    if (this.stats.isCrouching) currentSpeed = this.crouchSpeed;
    else if (this.stats.isSprinting) currentSpeed = this.sprintSpeed;

    // Camera forward and right vectors projected onto XZ plane
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();

    const moveDirection = new THREE.Vector3()
      .addScaledVector(right, moveInput.x)
      .addScaledVector(forward, moveInput.y);

    if (moveDirection.lengthSq() > 1) {
      moveDirection.normalize();
    }

    const velocity = moveDirection.clone().multiplyScalar(currentSpeed * delta);

    // 6. Sliding Collision Resolution
    this.resolveCollision(velocity);

    // 7. Head Bobbing & Footsteps
    if (isMoving) {
      const bobFreq = this.stats.isSprinting ? 14 : this.stats.isCrouching ? 6 : 9;
      const bobAmp = this.stats.isSprinting ? 0.07 : 0.035;

      this.headBobTimer += delta * bobFreq;
      const bobY = Math.sin(this.headBobTimer) * bobAmp;
      const bobTilt = Math.cos(this.headBobTimer) * (bobAmp * 0.4);

      this.camera.position.set(this.position.x, this.currentHeight + bobY, this.position.z);
      this.camera.quaternion.setFromEuler(
        new THREE.Euler(this.pitch, this.yaw, bobTilt, 'YXZ')
      );

      // Footstep cadence
      this.footstepTimer += delta * (currentSpeed / 2.5);
      if (this.footstepTimer > 0.45) {
        this.footstepTimer = 0;
        sound.playFootstep(this.stats.isSprinting, 'tile');
      }
    } else {
      this.camera.position.set(this.position.x, this.currentHeight, this.position.z);
      this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
    }
  }

  private resolveCollision(velocity: THREE.Vector3) {
    const playerRadius = 0.35;

    // Test X movement
    const testX = this.position.x + velocity.x;
    let blockedX = false;
    for (const box of this.collisionBoxes) {
      if (
        testX + playerRadius > box.minX &&
        testX - playerRadius < box.maxX &&
        this.position.z + playerRadius > box.minZ &&
        this.position.z - playerRadius < box.maxZ
      ) {
        blockedX = true;
        break;
      }
    }
    if (!blockedX) {
      this.position.x = testX;
    }

    // Test Z movement
    const testZ = this.position.z + velocity.z;
    let blockedZ = false;
    for (const box of this.collisionBoxes) {
      if (
        this.position.x + playerRadius > box.minX &&
        this.position.x - playerRadius < box.maxX &&
        testZ + playerRadius > box.minZ &&
        testZ - playerRadius < box.maxZ
      ) {
        blockedZ = true;
        break;
      }
    }
    if (!blockedZ) {
      this.position.z = testZ;
    }
  }

  public toggleFlashlight(): boolean {
    if (this.stats.battery <= 0) return false;
    this.stats.flashlightOn = !this.stats.flashlightOn;
    this.flashlight.intensity = this.stats.flashlightOn ? 2.8 : 0;
    sound.playFlashlightClick(this.stats.flashlightOn);
    return this.stats.flashlightOn;
  }

  public toggleCrouch(): boolean {
    this.stats.isCrouching = !this.stats.isCrouching;
    if (this.stats.isCrouching) {
      this.stats.isSprinting = false;
    }
    return this.stats.isCrouching;
  }

  public setSprinting(sprint: boolean) {
    if (sprint && this.stats.stamina > 10 && !this.stats.isCrouching) {
      this.stats.isSprinting = true;
    } else {
      this.stats.isSprinting = false;
    }
  }

  public enterLocker(entity: InteractiveEntity) {
    this.stats.isHiding = true;
    this.currentHidingEntity = entity;
    this.lockerOriginalPos.copy(this.position);

    // Position player inside locker cavity
    this.position.copy(entity.position);
    this.position.y = 1.6;
    this.camera.position.copy(this.position);

    // Open locker door then shut
    if (entity.doorPivot) {
      entity.doorPivot.rotation.y = Math.PI * 0.6;
      setTimeout(() => {
        if (entity.doorPivot) entity.doorPivot.rotation.y = 0.05; // tiny slit!
      }, 350);
    }
    sound.playLockerEnter(true);
  }

  public exitLocker() {
    if (!this.stats.isHiding || !this.currentHidingEntity) return;

    if (this.currentHidingEntity.doorPivot) {
      this.currentHidingEntity.doorPivot.rotation.y = Math.PI * 0.6;
      setTimeout(() => {
        if (this.currentHidingEntity?.doorPivot) {
          this.currentHidingEntity.doorPivot.rotation.y = 0;
        }
      }, 500);
    }

    sound.playLockerEnter(false);
    this.position.copy(this.lockerOriginalPos);
    this.stats.isHiding = false;
    this.currentHidingEntity = null;
  }

  public rechargeBattery(amount: number = 50) {
    this.stats.battery = Math.min(100, this.stats.battery + amount);
    sound.playPickup();
  }

  public reset(spawnPos: THREE.Vector3) {
    this.position.copy(spawnPos);
    this.camera.position.copy(this.position);
    this.yaw = 0;
    this.pitch = 0;
    this.stats.health = 100;
    this.stats.stamina = 100;
    this.stats.sanity = 100;
    this.stats.flashlightOn = true;
    this.stats.battery = 85;
    this.stats.isCrouching = false;
    this.stats.isSprinting = false;
    this.stats.isHiding = false;
    this.flashlight.intensity = 2.8;
  }
}
