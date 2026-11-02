import * as THREE from 'three';
import { MaterialPalette } from '../materials';
import { ModelFactory } from '../models';

export interface CollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface InteractiveEntity {
  id: string;
  type: 'door' | 'key' | 'note' | 'battery' | 'breaker' | 'keypad' | 'locker' | 'ambulance' | 'radio';
  label: string;
  actionText: string;
  position: THREE.Vector3;
  radius: number;
  data?: any;
  group?: THREE.Object3D;
  doorPivot?: THREE.Object3D;
  isOpen?: boolean;
  isCollected?: boolean;
  locked?: boolean;
  requiresItem?: string;
}

export interface MapData {
  sceneGroup: THREE.Group;
  collisionBoxes: CollisionBox[];
  interactives: InteractiveEntity[];
  patrolWaypoints: THREE.Vector3[];
  spawnPoint: THREE.Vector3;
  monsterSpawnPoint: THREE.Vector3;
  flickerLights: THREE.PointLight[];
  windowLights: THREE.PointLight[];
  breakerLight: THREE.PointLight | null;
}

export class SanatoriumMap {
  public static build(palette: MaterialPalette, models: ModelFactory): MapData {
    const sceneGroup = new THREE.Group();
    sceneGroup.name = 'Sanatorium_Map';

    const collisionBoxes: CollisionBox[] = [];
    const interactives: InteractiveEntity[] = [];
    const patrolWaypoints: THREE.Vector3[] = [];
    const flickerLights: THREE.PointLight[] = [];
    const windowLights: THREE.PointLight[] = [];

    // Helper to add solid wall and register collision
    const addWall = (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      hasCollision: boolean = true
    ) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), palette.wallMaterial);
      wall.position.set(x, y + h / 2, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      sceneGroup.add(wall);

      if (hasCollision) {
        collisionBoxes.push({
          minX: x - w / 2 - 0.35,
          maxX: x + w / 2 + 0.35,
          minZ: z - d / 2 - 0.35,
          maxZ: z + d / 2 + 0.35,
        });
      }
      return wall;
    };

    // Helper for floors
    const addFloor = (x: number, z: number, w: number, d: number) => {
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, d), palette.floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(x, 0, z);
      floor.receiveShadow = true;
      sceneGroup.add(floor);

      // Ceiling
      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(w, d), palette.ceilingMaterial);
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.set(x, 3.6, z);
      ceiling.receiveShadow = true;
      sceneGroup.add(ceiling);
    };

    // 1. MAIN CORRIDOR (Z: -20 to +20, X: -2.5 to 2.5)
    addFloor(0, 0, 5, 42);

    // Main corridor outer walls (with door cutouts)
    // Left Wall segments (X = -2.5)
    addWall(-2.6, 0, -15, 0.2, 3.6, 10);
    addWall(-2.6, 0, -5, 0.2, 3.6, 6);
    addWall(-2.6, 0, 5, 0.2, 3.6, 6);
    addWall(-2.6, 0, 15, 0.2, 3.6, 10);

    // Right Wall segments (X = +2.5)
    addWall(2.6, 0, -15, 0.2, 3.6, 10);
    addWall(2.6, 0, -5, 0.2, 3.6, 6);
    addWall(2.6, 0, 5, 0.2, 3.6, 6);
    addWall(2.6, 0, 15, 0.2, 3.6, 10);

    // North End Wall (Z = -20) - Emergency Exit
    addWall(0, 0, -21.1, 5.2, 3.6, 0.2);

    // South End Wall (Z = +20) - Blocked Debris
    addWall(0, 0, 21.1, 5.2, 3.6, 0.2);

    // 2. ROOM 402 - PLAYER STARTING ROOM (Left side, Z: -10 to -4, X: -2.5 to -8.5)
    addFloor(-5.5, -7, 6, 6);
    addWall(-8.6, 0, -7, 0.2, 3.6, 6); // West wall
    addWall(-5.5, 0, -10.1, 6, 3.6, 0.2); // North wall
    addWall(-5.5, 0, -3.9, 6, 3.6, 0.2); // South wall

    // 3. NURSE STATION (Right side, Z: -10 to -3, X: 2.5 to 8.5)
    addFloor(5.5, -6.5, 6, 7);
    addWall(8.6, 0, -6.5, 0.2, 3.6, 7);
    addWall(5.5, 0, -10.1, 6, 3.6, 0.2);
    addWall(5.5, 0, -2.9, 6, 3.6, 0.2);

    // 4. ELECTRICAL BREAKER CLOSET (Left side, Z: 0 to 6, X: -2.5 to -7.5)
    addFloor(-5.0, 3, 5, 6);
    addWall(-7.6, 0, 3, 0.2, 3.6, 6);
    addWall(-5.0, 0, -0.1, 5, 3.6, 0.2);
    addWall(-5.0, 0, 6.1, 5, 3.6, 0.2);

    // 5. PHARMACY / DISPENSARY (Right side, Z: 0 to 7, X: 2.5 to 8.5)
    addFloor(5.5, 3.5, 6, 7);
    addWall(8.6, 0, 3.5, 0.2, 3.6, 7);
    addWall(5.5, 0, -0.1, 6, 3.6, 0.2);
    addWall(5.5, 0, 7.1, 6, 3.6, 0.2);

    // 6. SUB-BASEMENT MORGUE (Left side, Z: 9 to 18, X: -2.5 to -10.5)
    addFloor(-6.5, 13.5, 8, 9);
    addWall(-10.6, 0, 13.5, 0.2, 3.6, 9);
    addWall(-6.5, 0, 8.9, 8, 3.6, 0.2);
    addWall(-6.5, 0, 18.1, 8, 3.6, 0.2);

    // 7. ROOM 401 (Right side, Z: 10 to 17, X: 2.5 to 8.5)
    addFloor(5.5, 13.5, 6, 7);
    addWall(8.6, 0, 13.5, 0.2, 3.6, 7);
    addWall(5.5, 0, 9.9, 6, 3.6, 0.2);
    addWall(5.5, 0, 17.1, 6, 3.6, 0.2);

    // 8. OUTSIDE AMBULANCE BAY (North of Z = -20)
    const bayFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 14),
      new THREE.MeshStandardMaterial({ color: 0x181a1f, roughness: 0.9 })
    );
    bayFloor.rotation.x = -Math.PI / 2;
    bayFloor.position.set(0, -0.05, -28);
    sceneGroup.add(bayFloor);

    // Rain puddle reflection
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(3.5, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f1115, roughness: 0.1, metalness: 0.8 })
    );
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(-1, 0.01, -26);
    sceneGroup.add(puddle);

    // PROPS PLACEMENT
    // Gurney in corridor
    const gurney1 = models.createHospitalGurney();
    gurney1.position.set(0.6, 0, -2);
    gurney1.rotation.y = 0.35;
    sceneGroup.add(gurney1);
    collisionBoxes.push({ minX: 0.0, maxX: 1.2, minZ: -3.0, maxZ: -1.0 });

    // Morgue autopsy gurney
    const morgueGurney = models.createHospitalGurney();
    morgueGurney.position.set(-6.5, 0, 13.5);
    sceneGroup.add(morgueGurney);
    collisionBoxes.push({ minX: -7.2, maxX: -5.8, minZ: 12.5, maxZ: 14.5 });

    // Overturned wheelchair in Room 402
    const wheelchair = models.createWheelchair(true);
    wheelchair.position.set(-6.8, 0.2, -8.5);
    sceneGroup.add(wheelchair);

    // Lockers (Interactive hiding spots)
    // Locker 1: Inside Room 401
    const locker1 = models.createLocker();
    locker1.group.position.set(7.8, 0, 14.5);
    locker1.group.rotation.y = -Math.PI / 2;
    sceneGroup.add(locker1.group);
    collisionBoxes.push({ minX: 7.2, maxX: 8.5, minZ: 13.8, maxZ: 15.2 });

    interactives.push({
      id: 'locker_room401',
      type: 'locker',
      label: 'Tall Steel Locker',
      actionText: 'Hide Inside Locker',
      position: new THREE.Vector3(7.2, 1.2, 14.5),
      radius: 1.6,
      doorPivot: locker1.door,
    });

    // Locker 2: Main corridor alcove
    const locker2 = models.createLocker();
    locker2.group.position.set(-2.1, 0, 10.5);
    locker2.group.rotation.y = Math.PI / 2;
    sceneGroup.add(locker2.group);
    collisionBoxes.push({ minX: -2.6, maxX: -1.6, minZ: 9.8, maxZ: 11.2 });

    interactives.push({
      id: 'locker_corridor',
      type: 'locker',
      label: 'Ventilated Locker',
      actionText: 'Hide Inside Locker',
      position: new THREE.Vector3(-1.6, 1.2, 10.5),
      radius: 1.6,
      doorPivot: locker2.door,
    });

    // Blood smears on walls
    const bloodWall = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.5),
      palette.bloodDecalMaterial
    );
    bloodWall.position.set(-2.49, 1.6, 2.0);
    bloodWall.rotation.y = Math.PI / 2;
    sceneGroup.add(bloodWall);

    const bloodWall2 = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      palette.bloodDecalMaterial
    );
    bloodWall2.position.set(2.49, 1.4, -12.0);
    bloodWall2.rotation.y = -Math.PI / 2;
    sceneGroup.add(bloodWall2);

    // Exit Signs
    const exitMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), palette.exitSignMaterial);
    exitMesh.position.set(0, 3.1, -19.9);
    sceneGroup.add(exitMesh);

    // LIGHTING RIG
    // Ambient moonlight
    const ambientLight = new THREE.HemisphereLight(0x0e141a, 0x050608, 0.4);
    sceneGroup.add(ambientLight);

    // Corridor flickering emergency lamps (low power)
    const corridorLampZ = [-16, -8, 0, 8, 16];
    corridorLampZ.forEach((z) => {
      const lamp = new THREE.PointLight(0xe0b970, 0.75, 7.5, 2.0);
      lamp.position.set(0, 3.2, z);
      lamp.castShadow = true;
      lamp.shadow.bias = -0.002;
      sceneGroup.add(lamp);
      flickerLights.push(lamp);

      // Light fixture mesh
      const bulb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8),
        new THREE.MeshBasicMaterial({ color: 0xffe899 })
      );
      bulb.rotation.z = Math.PI / 2;
      bulb.position.set(0, 3.4, z);
      sceneGroup.add(bulb);
    });

    // Window storm flashes (from high barred windows)
    const winLight1 = new THREE.PointLight(0x7dd3fc, 0.0, 25);
    winLight1.position.set(-8.5, 2.8, -7);
    sceneGroup.add(winLight1);
    windowLights.push(winLight1);

    const winLight2 = new THREE.PointLight(0x7dd3fc, 0.0, 30);
    winLight2.position.set(0, 4.0, -26);
    sceneGroup.add(winLight2);
    windowLights.push(winLight2);

    // INTERACTIVE DOORS
    // Door 1: Room 402 Starting Room Door
    const door402 = models.createDoor('WARD 402');
    door402.group.position.set(-2.5, 0, -7.0);
    door402.group.rotation.y = Math.PI / 2;
    sceneGroup.add(door402.group);

    interactives.push({
      id: 'door_room402',
      type: 'door',
      label: 'Room 402 Door',
      actionText: 'Open Door',
      position: new THREE.Vector3(-2.5, 1.2, -7.0),
      radius: 1.8,
      doorPivot: door402.doorPivot,
      isOpen: false,
    });

    // Door 2: Nurse Station Door
    const doorNurse = models.createDoor("NURSE'S DESK");
    doorNurse.group.position.set(2.5, 0, -6.5);
    doorNurse.group.rotation.y = -Math.PI / 2;
    sceneGroup.add(doorNurse.group);

    interactives.push({
      id: 'door_nurse',
      type: 'door',
      label: "Nurse's Station Door",
      actionText: 'Unlock Ward Door',
      position: new THREE.Vector3(2.5, 1.2, -6.5),
      radius: 1.8,
      doorPivot: doorNurse.doorPivot,
      isOpen: false,
      locked: true,
      requiresItem: 'key_ward4',
    });

    // Door 3: Electrical Breaker Closet Door
    const doorBreaker = models.createDoor('CIRCUITS 480V');
    doorBreaker.group.position.set(-2.5, 0, 3.0);
    doorBreaker.group.rotation.y = Math.PI / 2;
    sceneGroup.add(doorBreaker.group);

    interactives.push({
      id: 'door_breaker',
      type: 'door',
      label: 'Breaker Closet Door',
      actionText: 'Open Breaker Door',
      position: new THREE.Vector3(-2.5, 1.2, 3.0),
      radius: 1.8,
      doorPivot: doorBreaker.doorPivot,
      isOpen: false,
    });

    // Door 4: Pharmacy (Keypad Locked)
    const doorPharm = models.createDoor('PHARMACY');
    doorPharm.group.position.set(2.5, 0, 3.5);
    doorPharm.group.rotation.y = -Math.PI / 2;
    sceneGroup.add(doorPharm.group);

    interactives.push({
      id: 'door_pharmacy',
      type: 'keypad',
      label: 'Digital Keypad Lock',
      actionText: 'Enter Keypad Code',
      position: new THREE.Vector3(2.5, 1.2, 3.5),
      radius: 1.8,
      doorPivot: doorPharm.doorPivot,
      isOpen: false,
      locked: true,
      data: { code: '4812' },
    });

    // Door 5: Morgue Entrance (Requires Breaker + Keycard)
    const doorMorgue = models.createDoor('MORGUE SUB-LEVEL');
    doorMorgue.group.position.set(-2.5, 0, 13.5);
    doorMorgue.group.rotation.y = Math.PI / 2;
    sceneGroup.add(doorMorgue.group);

    interactives.push({
      id: 'door_morgue',
      type: 'door',
      label: 'Morgue Reinforced Door',
      actionText: 'Swipe Keycard',
      position: new THREE.Vector3(-2.5, 1.2, 13.5),
      radius: 1.8,
      doorPivot: doorMorgue.doorPivot,
      isOpen: false,
      locked: true,
      requiresItem: 'morgue_keycard',
    });

    // Door 6: Rear Emergency Exit (Final Escape Door)
    const doorExit = models.createDoor('EMERGENCY EXIT');
    doorExit.group.position.set(0, 0, -20.0);
    sceneGroup.add(doorExit.group);

    interactives.push({
      id: 'door_emergency_exit',
      type: 'door',
      label: 'Heavy Double Exit Door',
      actionText: 'Unlock Emergency Gate',
      position: new THREE.Vector3(0, 1.2, -20.0),
      radius: 2.2,
      doorPivot: doorExit.doorPivot,
      isOpen: false,
      locked: true,
      requiresItem: 'ambulance_key',
    });

    // ELECTRICAL BREAKER BOX (Inside Breaker Closet at X = -7.4, Z = 3.0)
    const breakerBox = models.createBreakerBox();
    breakerBox.position.set(-7.4, 1.6, 3.0);
    breakerBox.rotation.y = Math.PI / 2;
    sceneGroup.add(breakerBox);

    const breakerLight = new THREE.PointLight(0xef4444, 0.8, 4);
    breakerLight.position.set(-7.0, 1.8, 3.0);
    sceneGroup.add(breakerLight);

    interactives.push({
      id: 'breaker_panel',
      type: 'breaker',
      label: 'Main Auxiliary Breaker',
      actionText: 'Configure Circuit Breakers',
      position: new THREE.Vector3(-7.2, 1.6, 3.0),
      radius: 2.0,
      data: { switches: [false, false, false, false], target: [true, false, true, true] },
    });

    // AMBULANCE OUTSIDE IN RAIN (Escape Vehicle!)
    const ambulanceGroup = new THREE.Group();
    ambulanceGroup.position.set(0, 0, -28);

    // Van Body (composite 6 parts)
    const vanBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.2, 5.0),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.5 })
    );
    vanBody.position.set(0, 1.3, 0);
    vanBody.castShadow = true;
    ambulanceGroup.add(vanBody);

    const roofWhite = new THREE.Mesh(
      new THREE.BoxGeometry(2.42, 0.4, 5.02),
      new THREE.MeshStandardMaterial({ color: 0xf9fafb, roughness: 0.4 })
    );
    roofWhite.position.set(0, 2.2, 0);
    ambulanceGroup.add(roofWhite);

    // Emergency Flasher lights on roof
    const flasherBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.15, 0.35),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    flasherBar.position.set(0, 2.5, 0.8);
    ambulanceGroup.add(flasherBar);

    sceneGroup.add(ambulanceGroup);

    interactives.push({
      id: 'escape_ambulance',
      type: 'ambulance',
      label: 'Saint Jude Paramedic Ambulance',
      actionText: 'Ignite Engine & Escape',
      position: new THREE.Vector3(0, 1.0, -28),
      radius: 2.8,
      requiresItem: 'ambulance_key',
    });

    // ITEMS TO COLLECT / NOTES
    // Note 1: In starting room on table
    const note1 = models.createNoteItem();
    note1.position.set(-7.5, 0.85, -5.5);
    sceneGroup.add(note1);

    interactives.push({
      id: 'note_starting',
      type: 'note',
      label: "Dr. Vance's Journal #1",
      actionText: 'Read Dr. Vance Note',
      position: new THREE.Vector3(-7.5, 0.85, -5.5),
      radius: 1.5,
      group: note1,
      data: {
        title: "DR. VANCE'S DIARY - OCTOBER 14",
        text: "The emergency generator tripped at 03:00. When the lights died, the containment lock on Cell 99 released. We heard it crawling through the ceiling ductwork. If you are reading this: Stay low. Crouch in the dark. It hunts by the sound of running steps and direct light. Restoring the breaker in closet 4B might re-energize the magnetic doors.",
      },
    });

    // Key in starting room
    const keyWard4 = models.createKeyItem();
    keyWard4.position.set(-4.5, 0.8, -9.0);
    sceneGroup.add(keyWard4);

    interactives.push({
      id: 'key_ward4',
      type: 'key',
      label: 'Brass Ward 4 Key',
      actionText: 'Take Brass Ward Key',
      position: new THREE.Vector3(-4.5, 0.8, -9.0),
      radius: 1.5,
      group: keyWard4,
      data: {
        name: 'Brass Ward 4 Key',
        description: 'An old brass key stamped with numeral "4". Unlocks the Nurse Station door.',
        icon: 'key',
        category: 'key',
      },
    });

    // Battery 1 in Starting Room
    const battery1 = models.createBatteryItem();
    battery1.position.set(-7.8, 0.85, -6.2);
    sceneGroup.add(battery1);

    interactives.push({
      id: 'battery_1',
      type: 'battery',
      label: 'Industrial 9V Battery',
      actionText: 'Pick up 9V Battery',
      position: new THREE.Vector3(-7.8, 0.85, -6.2),
      radius: 1.5,
      group: battery1,
      data: {
        name: 'Industrial 9V Battery',
        description: 'Recharges flashlight battery by 50%.',
        icon: 'battery-charging',
        category: 'battery',
      },
    });

    // Battery 2 in Room 401
    const battery2 = models.createBatteryItem();
    battery2.position.set(7.5, 0.8, 12.0);
    sceneGroup.add(battery2);

    interactives.push({
      id: 'battery_2',
      type: 'battery',
      label: 'Spare Lithium Battery',
      actionText: 'Pick up Battery',
      position: new THREE.Vector3(7.5, 0.8, 12.0),
      radius: 1.5,
      group: battery2,
    });

    // Note 2 in Nurse Station (Contains hint about pharmacy code & audio cassette)
    const note2 = models.createNoteItem();
    note2.position.set(6.2, 0.9, -6.0);
    sceneGroup.add(note2);

    interactives.push({
      id: 'note_nurse',
      type: 'note',
      label: 'Chief Nurse Memo',
      actionText: 'Read Nurse Memo',
      position: new THREE.Vector3(6.2, 0.9, -6.0),
      radius: 1.5,
      group: note2,
      data: {
        title: 'NURSE STATION LOG - 02:40 AM',
        text: 'Dr. Adler locked the sub-level morgue passcard inside the Pharmacy locker. The keypad passcode was updated to the last 4 digits of Patient 99’s intake badge: 4 - 8 - 1 - 2. Keep the doors locked. The scratches in the vent are getting louder.',
      },
    });

    // Keycard in Pharmacy
    const keycardMesh = models.createKeyItem();
    keycardMesh.position.set(6.8, 0.85, 4.0);
    sceneGroup.add(keycardMesh);

    interactives.push({
      id: 'morgue_keycard',
      type: 'key',
      label: 'Morgue Access Card',
      actionText: 'Take Morgue Keycard',
      position: new THREE.Vector3(6.8, 0.85, 4.0),
      radius: 1.5,
      group: keycardMesh,
      data: {
        name: 'Morgue Access Keycard',
        description: 'Magnetic keycard granting authorization to enter the Sub-Basement Morgue.',
        icon: 'credit-card',
        category: 'tool',
      },
    });

    // Ambulance Key in Morgue
    const ambKey = models.createKeyItem();
    ambKey.position.set(-7.5, 0.85, 15.0);
    sceneGroup.add(ambKey);

    interactives.push({
      id: 'ambulance_key',
      type: 'key',
      label: 'Ambulance Ignition Key',
      actionText: 'Take Ambulance Key',
      position: new THREE.Vector3(-7.5, 0.85, 15.0),
      radius: 1.6,
      group: ambKey,
      data: {
        name: 'Ambulance Ignition Key',
        description: 'Key to the paramedic ambulance parked in the rear storm bay. Your ticket out of here.',
        icon: 'key',
        category: 'key',
      },
    });

    // PATROL WAYPOINTS FOR THE MONSTER ("Subject 99")
    patrolWaypoints.push(
      new THREE.Vector3(0, 0, 16),
      new THREE.Vector3(0, 0, 8),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -8),
      new THREE.Vector3(0, 0, -16),
      new THREE.Vector3(5.5, 0, 13.5), // Room 401
      new THREE.Vector3(0, 0, 10),
      new THREE.Vector3(-5.0, 0, 3.0), // Breaker room
      new THREE.Vector3(0, 0, -2)
    );

    return {
      sceneGroup,
      collisionBoxes,
      interactives,
      patrolWaypoints,
      spawnPoint: new THREE.Vector3(-5.5, 1.7, -7.0), // Inside Room 402
      monsterSpawnPoint: new THREE.Vector3(0, 0, 18), // Lurking at south corridor
      flickerLights,
      windowLights,
      breakerLight,
    };
  }
}
