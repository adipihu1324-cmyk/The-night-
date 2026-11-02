import * as THREE from 'three';
import { MaterialPalette } from './materials';
import { textureFactory } from './textures';

/**
 * Composite 3–12 Part Procedural 3D Models
 * Zero external asset dependencies.
 * All models have their pivot at bottom-center (Y=0 sits flush on the ground).
 */

export class ModelFactory {
  private materials: MaterialPalette;

  constructor(materials: MaterialPalette) {
    this.materials = materials;
  }

  // --- THE CREATURE: SUBJECT 99 (THE HOLLOWED) ---
  public createCreature(): {
    group: THREE.Group;
    parts: {
      head: THREE.Object3D;
      jaw: THREE.Object3D;
      leftArm: THREE.Object3D;
      rightArm: THREE.Object3D;
      leftLeg: THREE.Object3D;
      rightLeg: THREE.Object3D;
      spine: THREE.Object3D;
    };
  } {
    const root = new THREE.Group();
    root.name = 'Creature_Subject99';

    // Pelvis / Lower Body (Y ~ 1.05)
    const pelvis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.14, 0.22, 6),
      this.materials.monsterMaterial
    );
    pelvis.position.set(0, 1.05, 0);
    pelvis.castShadow = true;
    root.add(pelvis);

    // Hunched Spine / Upper Torso
    const spine = new THREE.Group();
    spine.position.set(0, 0.1, 0);
    pelvis.add(spine);

    const ribcage = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.55, 0.26),
      this.materials.monsterMaterial
    );
    ribcage.position.set(0, 0.28, 0.08); // hunched forward
    ribcage.rotation.x = 0.25;
    ribcage.castShadow = true;
    spine.add(ribcage);

    // Elongated Neck & Head
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 0.22, 6),
      this.materials.monsterMaterial
    );
    neck.position.set(0, 0.58, 0.16);
    neck.rotation.x = 0.35;
    spine.add(neck);

    const head = new THREE.Group();
    head.position.set(0, 0.16, 0.06);
    neck.add(head);

    // Distorted skull
    const cranium = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.28, 0.32),
      this.materials.monsterMaterial
    );
    cranium.castShadow = true;
    head.add(cranium);

    // Hollow glowing red eyes
    const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const leftEye = new THREE.Mesh(eyeGeo, this.materials.eyeGlowMaterial);
    leftEye.position.set(-0.075, 0.03, 0.16);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, this.materials.eyeGlowMaterial);
    rightEye.position.set(0.075, 0.03, 0.16);
    head.add(rightEye);

    // Hanging unhinged jaw
    const jaw = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.14, 0.24),
      this.materials.monsterMaterial
    );
    jaw.position.set(0, -0.15, 0.08);
    jaw.rotation.x = 0.35;
    head.add(jaw);

    // Left Arm (Long and disjointed)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.24, 0.5, 0.08);
    spine.add(leftArm);

    const lUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.045, 0.55, 6),
      this.materials.monsterMaterial
    );
    lUpperArm.position.set(-0.06, -0.25, 0);
    lUpperArm.rotation.z = -0.15;
    leftArm.add(lUpperArm);

    const lForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.03, 0.65, 6),
      this.materials.monsterMaterial
    );
    lForearm.position.set(-0.1, -0.75, 0.1);
    lForearm.rotation.x = -0.2;
    leftArm.add(lForearm);

    // Right Arm
    const rightArm = new THREE.Group();
    rightArm.position.set(0.24, 0.5, 0.08);
    spine.add(rightArm);

    const rUpperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.045, 0.55, 6),
      this.materials.monsterMaterial
    );
    rUpperArm.position.set(0.06, -0.25, 0);
    rUpperArm.rotation.z = 0.15;
    rightArm.add(rUpperArm);

    const rForearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.03, 0.65, 6),
      this.materials.monsterMaterial
    );
    rForearm.position.set(0.1, -0.75, 0.1);
    rForearm.rotation.x = -0.2;
    rightArm.add(rForearm);

    // Left Leg
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.14, 0, 0);
    pelvis.add(leftLeg);

    const lThigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.05, 0.55, 6),
      this.materials.monsterMaterial
    );
    lThigh.position.set(0, -0.27, 0);
    leftLeg.add(lThigh);

    const lShin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.035, 0.55, 6),
      this.materials.monsterMaterial
    );
    lShin.position.set(0, -0.75, -0.05);
    lShin.rotation.x = 0.15;
    leftLeg.add(lShin);

    // Right Leg
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.14, 0, 0);
    pelvis.add(rightLeg);

    const rThigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.05, 0.55, 6),
      this.materials.monsterMaterial
    );
    rThigh.position.set(0, -0.27, 0);
    rightLeg.add(rThigh);

    const rShin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.035, 0.55, 6),
      this.materials.monsterMaterial
    );
    rShin.position.set(0, -0.75, -0.05);
    rShin.rotation.x = 0.15;
    rightLeg.add(rShin);

    return {
      group: root,
      parts: {
        head,
        jaw,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        spine,
      },
    };
  }

  // --- HOSPITAL GURNEY (STRETCHER) ---
  public createHospitalGurney(): THREE.Group {
    const gurney = new THREE.Group();
    gurney.name = 'Hospital_Gurney';

    // Metal Frame Base
    const frameMat = this.materials.metalMaterial;
    const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8);

    const legPositions = [
      [-0.45, 0.375, -0.9],
      [0.45, 0.375, -0.9],
      [-0.45, 0.375, 0.9],
      [0.45, 0.375, 0.9],
    ];

    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, frameMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      gurney.add(leg);

      // Caster wheel
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12),
        frameMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.06, z);
      gurney.add(wheel);
    });

    // Cross braces
    const crossBarLong = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.04, 1.8),
      frameMat
    );
    crossBarLong.position.set(-0.45, 0.2, 0);
    gurney.add(crossBarLong);

    const crossBarLong2 = crossBarLong.clone();
    crossBarLong2.position.set(0.45, 0.2, 0);
    gurney.add(crossBarLong2);

    // Stained Mattress Top
    const mattressMat = new THREE.MeshStandardMaterial({
      color: 0x5a5f56, // dirty vinyl
      roughness: 0.8,
    });
    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.18, 1.9),
      mattressMat
    );
    mattress.position.set(0, 0.84, 0);
    mattress.castShadow = true;
    mattress.receiveShadow = true;
    gurney.add(mattress);

    // Raised headrest pillow
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.12, 0.5),
      mattressMat
    );
    pillow.position.set(0, 0.96, -0.65);
    pillow.rotation.x = -0.2;
    gurney.add(pillow);

    // IV Pole attached to frame
    const ivPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 1.6, 8),
      frameMat
    );
    ivPole.position.set(0.48, 1.2, -0.85);
    gurney.add(ivPole);

    // Blood splatter on mattress
    const bloodDecal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.7),
      this.materials.bloodDecalMaterial
    );
    bloodDecal.rotation.x = -Math.PI / 2;
    bloodDecal.position.set(0.05, 0.94, 0.1);
    gurney.add(bloodDecal);

    return gurney;
  }

  // --- OVERTURNED WHEELCHAIR ---
  public createWheelchair(overturned: boolean = true): THREE.Group {
    const chair = new THREE.Group();
    chair.name = 'Wheelchair';

    const mat = this.materials.metalMaterial;
    const vinylMat = new THREE.MeshStandardMaterial({
      color: 0x242426,
      roughness: 0.7,
    });

    // Seat & Backrest
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.5), vinylMat);
    seat.position.set(0, 0.5, 0);
    chair.add(seat);

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.05), vinylMat);
    backrest.position.set(0, 0.8, -0.25);
    chair.add(backrest);

    // Frame tubes
    const tubeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
    const leftPost = new THREE.Mesh(tubeGeo, mat);
    leftPost.position.set(-0.28, 0.55, -0.26);
    chair.add(leftPost);

    const rightPost = new THREE.Mesh(tubeGeo, mat);
    rightPost.position.set(0.28, 0.55, -0.26);
    chair.add(rightPost);

    // Large rear spoked wheels
    const wheelGeo = new THREE.TorusGeometry(0.32, 0.025, 8, 24);
    const leftWheel = new THREE.Mesh(wheelGeo, mat);
    leftWheel.rotation.y = Math.PI / 2;
    leftWheel.position.set(-0.32, 0.35, -0.1);
    chair.add(leftWheel);

    const rightWheel = new THREE.Mesh(wheelGeo, mat);
    rightWheel.rotation.y = Math.PI / 2;
    rightWheel.position.set(0.32, 0.35, -0.1);
    chair.add(rightWheel);

    if (overturned) {
      chair.rotation.z = Math.PI * 0.45;
      chair.rotation.x = 0.2;
      chair.position.y = 0.25;
    }

    return chair;
  }

  // --- INTERACTIVE LOCKER (CAN HIDE INSIDE!) ---
  public createLocker(): { group: THREE.Group; door: THREE.Object3D } {
    const root = new THREE.Group();
    root.name = 'Sanatorium_Locker';

    const mat = this.materials.metalMaterial;

    // Cabinet Main Shell (0.8m wide, 2.2m tall, 0.7m deep)
    const shell = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 0.7), mat);
    shell.position.set(0, 1.1, 0);
    shell.castShadow = true;
    shell.receiveShadow = true;
    root.add(shell);

    // Interior Hollow Cutout effect (Dark cavity)
    const cavityMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const cavity = new THREE.Mesh(new THREE.BoxGeometry(0.72, 2.1, 0.64), cavityMat);
    cavity.position.set(0, 1.1, 0.02);
    root.add(cavity);

    // Door Pivot at left edge (X = -0.38, Z = 0.35)
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-0.38, 1.1, 0.35);
    root.add(doorPivot);

    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.76, 2.1, 0.04), mat);
    doorMesh.position.set(0.38, 0, 0); // centered relative to pivot
    doorMesh.castShadow = true;
    doorPivot.add(doorMesh);

    // Door handle & vent slits
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8),
      this.materials.metalMaterial
    );
    handle.position.set(0.68, 0, 0.04);
    doorPivot.add(handle);

    return {
      group: root,
      door: doorPivot,
    };
  }

  // --- ELECTRICAL BREAKER BOX ---
  public createBreakerBox(): THREE.Group {
    const box = new THREE.Group();
    box.name = 'BreakerBox';

    const metalMat = this.materials.metalMaterial;

    // Outer metal case (mounted on wall)
    const casing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.25), metalMat);
    casing.castShadow = true;
    box.add(casing);

    // Face panel (recessed)
    const faceMat = new THREE.MeshStandardMaterial({
      color: 0x1f2421,
      roughness: 0.8,
    });
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.92, 0.05), faceMat);
    face.position.set(0, 0, 0.12);
    box.add(face);

    // 4 Toggle switches with red/green status lights
    const switchGeo = new THREE.BoxGeometry(0.06, 0.14, 0.08);
    const switchMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c });

    [-0.24, -0.08, 0.08, 0.24].forEach((x, i) => {
      const sw = new THREE.Mesh(switchGeo, switchMat);
      sw.position.set(x, 0.1, 0.16);
      box.add(sw);

      // Status indicator light
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 8, 8),
        new THREE.MeshBasicMaterial({ color: i === 1 ? 0x22c55e : 0xef4444 })
      );
      led.position.set(x, 0.25, 0.16);
      box.add(led);
    });

    // High Voltage Danger Warning Decal
    const warningTex = textureFactory.createSignTexture('HIGH VOLTAGE', 'DANGER 480V', '#ef4444');
    const warningPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.45, 0.22),
      new THREE.MeshBasicMaterial({ map: warningTex })
    );
    warningPlate.position.set(0, -0.22, 0.16);
    box.add(warningPlate);

    return box;
  }

  // --- INTERACTIVE DOOR WITH WORKING HINGE ---
  public createDoor(signText?: string): {
    group: THREE.Group;
    doorPivot: THREE.Group;
  } {
    const root = new THREE.Group();
    root.name = 'Doorway';

    const frameMat = this.materials.metalMaterial;

    // Door Frame (Left post, right post, top header)
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.25), frameMat);
    leftPost.position.set(-0.85, 1.25, 0);
    root.add(leftPost);

    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.5, 0.25), frameMat);
    rightPost.position.set(0.85, 1.25, 0);
    root.add(rightPost);

    const header = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.15, 0.25), frameMat);
    header.position.set(0, 2.45, 0);
    root.add(header);

    // Door Pivot at left hinge
    const doorPivot = new THREE.Group();
    doorPivot.position.set(-0.78, 0, 0);
    root.add(doorPivot);

    // Door Slab (1.56m wide, 2.35m tall, 0.08m thick)
    const doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.56, 2.35, 0.08),
      this.materials.doorWoodMaterial
    );
    doorMesh.position.set(0.78, 1.18, 0);
    doorMesh.castShadow = true;
    doorMesh.receiveShadow = true;
    doorPivot.add(doorMesh);

    // Brass Lever Handle
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.18, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.9 })
    );
    handle.rotation.x = Math.PI / 2;
    handle.position.set(1.42, 1.05, 0.06);
    doorPivot.add(handle);

    // Sign plate if specified
    if (signText) {
      const signTex = textureFactory.createSignTexture(signText, 'RESTRICTED AREA', '#f59e0b');
      const signMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.65, 0.32),
        new THREE.MeshBasicMaterial({ map: signTex })
      );
      signMesh.position.set(0.78, 1.65, 0.05);
      doorPivot.add(signMesh);
    }

    return {
      group: root,
      doorPivot,
    };
  }

  // --- KEY OBJECT ---
  public createKeyItem(): THREE.Group {
    const key = new THREE.Group();
    key.name = 'Item_Key';

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      metalness: 0.9,
      roughness: 0.25,
    });

    // Bow (Ring handle)
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 8, 16), goldMat);
    key.add(ring);

    // Shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 8), goldMat);
    shaft.position.set(0, -0.12, 0);
    key.add(shaft);

    // Bit (Teeth)
    const bit = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.012), goldMat);
    bit.position.set(0.03, -0.2, 0);
    key.add(bit);

    return key;
  }

  // --- FLASHLIGHT BATTERY OBJECT ---
  public createBatteryItem(): THREE.Group {
    const bat = new THREE.Group();
    bat.name = 'Item_Battery';

    const cellMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.8,
      roughness: 0.3,
    });
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.95,
      roughness: 0.2,
    });

    const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 12), cellMat);
    bat.add(cylinder);

    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 12), tipMat);
    tip.position.set(0, 0.09, 0);
    bat.add(tip);

    return bat;
  }

  // --- WRITTEN NOTE / DOCUMENT ---
  public createNoteItem(): THREE.Group {
    const note = new THREE.Group();
    note.name = 'Item_Note';

    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xd8cca8,
      roughness: 0.9,
    });

    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.01, 0.34), paperMat);
    note.add(paper);

    return note;
  }
}
