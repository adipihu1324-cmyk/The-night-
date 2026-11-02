import * as THREE from 'three';
import { sound } from '../../audio/SoundEngine';
import { CollisionBox } from '../levels/SanatoriumMap';

export type MonsterState = 'PATROL' | 'INVESTIGATE' | 'CHASE' | 'SEARCH';

export class MonsterAI {
  public group: THREE.Group;
  public parts: {
    head: THREE.Object3D;
    jaw: THREE.Object3D;
    leftArm: THREE.Object3D;
    rightArm: THREE.Object3D;
    leftLeg: THREE.Object3D;
    rightLeg: THREE.Object3D;
    spine: THREE.Object3D;
  };

  public state: MonsterState = 'PATROL';
  public position: THREE.Vector3;
  private waypoints: THREE.Vector3[];
  private currentWaypointIdx: number = 0;
  private collisionBoxes: CollisionBox[];

  // Speeds
  private patrolSpeed: number = 1.3;
  private chaseSpeed: number = 3.8;
  private investigateSpeed: number = 1.8;

  // Sensory
  private targetPosition: THREE.Vector3 = new THREE.Vector3();
  private stateTimer: number = 0;
  private stepSoundTimer: number = 0;
  private growlTimer: number = 5.0;

  // Animation time
  private animTime: number = 0;
  public distanceToPlayer: number = 999;
  public hasCaughtPlayer: boolean = false;

  constructor(
    group: THREE.Group,
    parts: any,
    waypoints: THREE.Vector3[],
    collisionBoxes: CollisionBox[],
    spawnPos: THREE.Vector3
  ) {
    this.group = group;
    this.parts = parts;
    this.waypoints = waypoints;
    this.collisionBoxes = collisionBoxes;
    this.position = spawnPos.clone();
    this.group.position.copy(this.position);

    if (this.waypoints.length > 0) {
      this.targetPosition.copy(this.waypoints[0]);
    }
  }

  public update(
    delta: number,
    playerPosition: THREE.Vector3,
    playerFlashlightOn: boolean,
    playerSprinting: boolean,
    playerCrouching: boolean,
    playerHiding: boolean
  ) {
    if (this.hasCaughtPlayer) return;

    this.animTime += delta;
    this.stateTimer += delta;
    this.growlTimer -= delta;

    // Proximity to player
    this.distanceToPlayer = this.position.distanceTo(playerPosition);

    // Audio cues based on proximity
    const proximityRatio = Math.max(0, 1 - this.distanceToPlayer / 20);
    sound.updateSanityHeartbeat(
      Math.max(10, 100 - proximityRatio * 90),
      proximityRatio
    );

    if (this.growlTimer <= 0 && this.distanceToPlayer < 18) {
      sound.playMonsterGrowl(this.distanceToPlayer / 20);
      this.growlTimer = 4.0 + Math.random() * 5.0;
    }

    // Sensory Detection Logic:
    // 1. Direct Flashlight Ray Detection
    let isSpottedByFlashlight = false;
    if (playerFlashlightOn && !playerHiding) {
      const toMonster = this.position.clone().sub(playerPosition).normalize();
      // Check if distance is within flashlight range (< 12m)
      if (this.distanceToPlayer < 12.0) {
        // Player looking towards monster?
        isSpottedByFlashlight = true;
      }
    }

    // 2. Sprinting Footstep Sound Detection
    let isHeardSprinting = false;
    if (playerSprinting && !playerCrouching && !playerHiding) {
      if (this.distanceToPlayer < 14.0) {
        isHeardSprinting = true;
      }
    }

    // 3. Direct Close Proximity (< 4.5m unless hiding)
    const isVeryClose = this.distanceToPlayer < 4.5 && !playerHiding;

    // STATE TRANSITIONS
    if (this.state === 'PATROL') {
      if (!playerHiding && (isSpottedByFlashlight || isHeardSprinting || isVeryClose)) {
        this.triggerChase(playerPosition);
      } else {
        // Patrol movement
        const distToWp = this.position.distanceTo(this.targetPosition);
        if (distToWp < 1.0) {
          this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.waypoints.length;
          this.targetPosition.copy(this.waypoints[this.currentWaypointIdx]);
        }
        this.moveTowards(this.targetPosition, this.patrolSpeed, delta);
      }
    } else if (this.state === 'CHASE') {
      if (playerHiding) {
        // Lost sight! Switch to SEARCH
        this.state = 'SEARCH';
        this.stateTimer = 0;
        this.targetPosition.copy(playerPosition);
      } else {
        this.targetPosition.copy(playerPosition);
        this.moveTowards(this.targetPosition, this.chaseSpeed, delta);

        // Catch player check!
        if (this.distanceToPlayer < 1.35) {
          this.hasCaughtPlayer = true;
          sound.playJumpscareStinger();
          sound.playMonsterScreech();
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 150, 50, 300]);
          }
          return;
        }

        // Drop chase if player runs very far away and crouches
        if (this.distanceToPlayer > 18.0 && playerCrouching) {
          this.state = 'SEARCH';
          this.stateTimer = 0;
        }
      }
    } else if (this.state === 'SEARCH') {
      // Look around the last known area for 5 seconds
      if (this.stateTimer > 5.0) {
        this.state = 'PATROL';
        this.stateTimer = 0;
        this.targetPosition.copy(this.waypoints[this.currentWaypointIdx]);
      } else {
        // Wander slowly in small circle near target
        const wanderTarget = this.targetPosition
          .clone()
          .add(
            new THREE.Vector3(
              Math.sin(this.stateTimer * 1.5) * 2.0,
              0,
              Math.cos(this.stateTimer * 1.5) * 2.0
            )
          );
        this.moveTowards(wanderTarget, this.investigateSpeed * 0.7, delta);
      }
    } else if (this.state === 'INVESTIGATE') {
      const dist = this.position.distanceTo(this.targetPosition);
      if (dist < 1.2 || this.stateTimer > 7.0) {
        this.state = 'SEARCH';
        this.stateTimer = 0;
      } else {
        this.moveTowards(this.targetPosition, this.investigateSpeed, delta);
      }
    }

    // PROCEDURAL SKELETAL ANIMATIONS
    this.animateBones(delta);
  }

  private triggerChase(playerPos: THREE.Vector3) {
    if (this.state !== 'CHASE') {
      this.state = 'CHASE';
      this.stateTimer = 0;
      sound.playMonsterScreech();
      if (navigator.vibrate) {
        navigator.vibrate([60, 40, 80]);
      }
    }
    this.targetPosition.copy(playerPos);
  }

  public alertDisturbance(pos: THREE.Vector3) {
    if (this.state !== 'CHASE') {
      this.state = 'INVESTIGATE';
      this.stateTimer = 0;
      this.targetPosition.copy(pos);
    }
  }

  private moveTowards(target: THREE.Vector3, speed: number, delta: number) {
    const dir = target.clone().sub(this.position);
    dir.y = 0;
    const len = dir.length();
    if (len < 0.05) return;

    dir.normalize();

    // Turn rotation smoothly towards movement direction
    const targetAngle = Math.atan2(dir.x, dir.z);
    this.group.rotation.y = THREE.MathUtils.damp(
      this.group.rotation.y,
      targetAngle,
      8,
      delta
    );

    // Compute proposed step
    const step = dir.multiplyScalar(speed * delta);
    const newX = this.position.x + step.x;
    const newZ = this.position.z + step.z;

    // Check collision with map boundary
    this.position.x = newX;
    this.position.z = newZ;
    this.group.position.copy(this.position);

    // Footstep audio cadence
    this.stepSoundTimer += delta * (speed / 1.5);
    if (this.stepSoundTimer > 0.55) {
      this.stepSoundTimer = 0;
      if (this.distanceToPlayer < 16) {
        sound.playFootstep(this.state === 'CHASE', 'tile');
      }
    }
  }

  private animateBones(delta: number) {
    const isChasing = this.state === 'CHASE';
    const speedMultiplier = isChasing ? 12 : 5;
    const t = this.animTime * speedMultiplier;

    // Leg swinging
    const legAngle = Math.sin(t) * (isChasing ? 0.7 : 0.4);
    this.parts.leftLeg.rotation.x = legAngle;
    this.parts.rightLeg.rotation.x = -legAngle;

    // Spine hunch & twitch
    this.parts.spine.rotation.x = 0.25 + (isChasing ? 0.2 : 0) + Math.sin(t * 2) * 0.05;
    this.parts.spine.rotation.z = Math.cos(t) * 0.08;

    // Arms: in chase, reaching forward; in patrol, hanging swinging
    if (isChasing) {
      this.parts.leftArm.rotation.x = -1.2 + Math.sin(t * 1.5) * 0.2;
      this.parts.rightArm.rotation.x = -1.2 + Math.cos(t * 1.5) * 0.2;
      this.parts.jaw.rotation.x = 0.6 + Math.sin(t * 3) * 0.15; // wide open screeching jaw
    } else {
      this.parts.leftArm.rotation.x = -Math.sin(t) * 0.35;
      this.parts.rightArm.rotation.x = Math.sin(t) * 0.35;
      this.parts.jaw.rotation.x = 0.25 + Math.sin(t * 0.5) * 0.05;
    }

    // Head erratic twitch
    if (Math.random() < 0.04) {
      this.parts.head.rotation.y = (Math.random() - 0.5) * 0.8;
      this.parts.head.rotation.z = (Math.random() - 0.5) * 0.4;
    }
  }

  public reset(spawnPos: THREE.Vector3) {
    this.state = 'PATROL';
    this.hasCaughtPlayer = false;
    this.position.copy(spawnPos);
    this.group.position.copy(this.position);
    this.currentWaypointIdx = 0;
    this.stateTimer = 0;
    if (this.waypoints.length > 0) {
      this.targetPosition.copy(this.waypoints[0]);
    }
  }
}
