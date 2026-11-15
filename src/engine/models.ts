import * as THREE from 'three';
import { CHOWK_ROUNDABOUTS, CITY_BLOCK_CENTERS, CITY_ROAD_CENTERS, VehicleKind, WeaponId } from '../types/game';

export interface BuildingCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  height: number;
}

export interface CircleCollider {
  x: number;
  z: number;
  radius: number;
  height: number;
}

export interface HumanoidRig {
  root: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  weaponMount: THREE.Group;
  lathiProp: THREE.Mesh;
  head: THREE.Group;
  phoneProp: THREE.Mesh;
  helmetMesh: THREE.Group;
  shirtMat?: THREE.MeshStandardMaterial;
  pantsMat?: THREE.MeshStandardMaterial;
  beltMesh?: THREE.Mesh;
  kurtaHem?: THREE.Mesh;
  kurtaPlacket?: THREE.Mesh;
}

export interface VehicleRig {
  root: THREE.Group;
  wheels: THREE.Mesh[];
  lightBarRed?: THREE.Mesh;
  lightBarBlue?: THREE.Mesh;
  riderRig?: HumanoidRig;
}

/**
 * Generates crisp procedural canvas textures for roads, sidewalks, and building facades.
 * Enforces SRGBColorSpace and max anisotropy per Three.js skill standards.
 */
export function createCityTextures(maxAniso: number) {
  // 1. Asphalt road texture
  const roadCanvas = document.createElement('canvas');
  roadCanvas.width = 512;
  roadCanvas.height = 512;
  const rctx = roadCanvas.getContext('2d')!;
  rctx.fillStyle = '#252932';
  rctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6500; i++) {
    const shade = 30 + Math.floor(Math.random() * 20);
    rctx.fillStyle = `rgb(${shade}, ${shade + 3}, ${shade + 8})`;
    rctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const roadTex = new THREE.CanvasTexture(roadCanvas);
  roadTex.colorSpace = THREE.SRGBColorSpace;
  roadTex.wrapS = THREE.RepeatWrapping;
  roadTex.wrapT = THREE.RepeatWrapping;
  roadTex.repeat.set(24, 24);
  roadTex.anisotropy = maxAniso;

  // 2. Concrete sidewalk texture
  const walkCanvas = document.createElement('canvas');
  walkCanvas.width = 256;
  walkCanvas.height = 256;
  const wctx = walkCanvas.getContext('2d')!;
  wctx.fillStyle = '#5a616d';
  wctx.fillRect(0, 0, 256, 256);
  wctx.strokeStyle = '#474d57';
  wctx.lineWidth = 3;
  for (let x = 0; x <= 256; x += 64) {
    wctx.beginPath();
    wctx.moveTo(x, 0);
    wctx.lineTo(x, 256);
    wctx.stroke();
    wctx.beginPath();
    wctx.moveTo(0, x);
    wctx.lineTo(256, x);
    wctx.stroke();
  }
  const walkTex = new THREE.CanvasTexture(walkCanvas);
  walkTex.colorSpace = THREE.SRGBColorSpace;
  walkTex.wrapS = THREE.RepeatWrapping;
  walkTex.wrapT = THREE.RepeatWrapping;
  walkTex.repeat.set(3, 3);
  walkTex.anisotropy = maxAniso;

  // 3. Building facade textures (3 architectural styles)
  const makeFacade = (wallColor: string, trimColor: string, litTint: string) => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 512;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = wallColor;
    ctx.fillRect(0, 0, 256, 512);

    ctx.fillStyle = trimColor;
    for (let y = 0; y < 512; y += 64) {
      ctx.fillRect(0, y, 256, 6);
    }

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 4; col++) {
        const wx = 18 + col * 58;
        const wy = 14 + row * 64;
        const lit = Math.random() > 0.45;
        ctx.fillStyle = lit ? litTint : '#141a24';
        ctx.fillRect(wx, wy, 40, 38);
        ctx.strokeStyle = '#1f2633';
        ctx.lineWidth = 2;
        ctx.strokeRect(wx, wy, 40, 38);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = maxAniso;
    return tex;
  };

  const facades = [
    makeFacade('#3a4250', '#2a303b', '#c7d9ec'),
    makeFacade('#6f584b', '#523f35', '#f5dca8'),
    makeFacade('#45515e', '#2f3842', '#9bd0e8'),
  ];

  return { roadTex, walkTex, facades };
}

/**
 * Realistic composite PBR firearms oriented so barrel points along -Z (forward).
 * Zero toy-like bright plastic blocks: blued steel, parkerized receiver, matte polymer/walnut grips.
 */
export function createWeaponModel(weaponId: WeaponId): THREE.Group {
  const group = new THREE.Group();
  if (weaponId === 'fists') return group;

  const gunmetal = new THREE.MeshStandardMaterial({
    color: 0x262b33,
    metalness: 0.88,
    roughness: 0.28,
  });
  const parkerized = new THREE.MeshStandardMaterial({
    color: 0x1a1e24,
    metalness: 0.72,
    roughness: 0.44,
  });
  const chromeBarrel = new THREE.MeshStandardMaterial({
    color: 0x717882,
    metalness: 0.94,
    roughness: 0.2,
  });
  const polymerGrip = new THREE.MeshStandardMaterial({
    color: 0x15171b,
    metalness: 0.08,
    roughness: 0.82,
  });
  const walnut = new THREE.MeshStandardMaterial({
    color: 0x4b301d,
    metalness: 0.05,
    roughness: 0.68,
  });
  const opticGlass = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    emissive: 0xef4444,
    emissiveIntensity: 0.6,
    metalness: 0.2,
    roughness: 0.15,
  });

  if (weaponId === 'pistol') {
    const slide = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.055, 0.26), gunmetal);
    slide.position.set(0, 0.05, -0.07);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.032, 0.21), parkerized);
    frame.position.set(0, 0.015, -0.05);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 10), chromeBarrel);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.052, -0.215);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.13, 0.062), polymerGrip);
    grip.rotation.x = 0.24;
    grip.position.set(0, -0.055, 0.018);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.05), parkerized);
    guard.position.set(0, -0.018, -0.045);
    const tritiumMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, emissive: 0x22c55e, emissiveIntensity: 0.9 });
    const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.016, 0.018), tritiumMat);
    frontSight.position.set(0, 0.084, -0.185);
    const rearSight = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.015, 0.016), parkerized);
    rearSight.position.set(0, 0.082, 0.035);
    group.add(slide, frame, barrel, grip, guard, frontSight, rearSight);
  } else if (weaponId === 'smg') {
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.095, 0.34), parkerized);
    receiver.position.set(0, 0.045, -0.1);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 12), gunmetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, -0.36);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.22, 0.048), gunmetal);
    mag.rotation.x = -0.12;
    mag.position.set(0, -0.09, -0.14);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.13, 0.055), polymerGrip);
    grip.rotation.x = 0.22;
    grip.position.set(0, -0.055, 0.02);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.055, 0.18), gunmetal);
    stock.position.set(0, 0.045, 0.14);
    // Reflex Red-Dot Scope Housing
    const sightMount = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.018, 0.08), parkerized);
    sightMount.position.set(0, 0.1, -0.09);
    const redDotTube = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.075, 12), gunmetal);
    redDotTube.rotation.x = Math.PI / 2;
    redDotTube.position.set(0, 0.125, -0.09);
    const redDotLens = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.01, 10), opticGlass);
    redDotLens.rotation.x = Math.PI / 2;
    redDotLens.position.set(0, 0.125, -0.128);
    group.add(receiver, barrel, mag, grip, stock, sightMount, redDotTube, redDotLens);
  } else if (weaponId === 'shotgun') {
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.088, 0.28), parkerized);
    receiver.position.set(0, 0.04, -0.06);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.019, 0.56, 12), gunmetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.062, -0.46);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.44, 10), parkerized);
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0, 0.026, -0.4);
    const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.2, 10), polymerGrip);
    pump.rotation.x = Math.PI / 2;
    pump.position.set(0, 0.022, -0.34);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.11, 0.28), walnut);
    stock.rotation.x = -0.14;
    stock.position.set(0, 0.0, 0.19);
    const ghostRing = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.004, 8, 12), chromeBarrel);
    ghostRing.position.set(0, 0.1, 0.02);
    group.add(receiver, barrel, tube, pump, stock, ghostRing);
  } else if (weaponId === 'rifle') {
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.1, 0.36), parkerized);
    receiver.position.set(0, 0.045, -0.1);
    const handguard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.072, 0.28), gunmetal);
    handguard.position.set(0, 0.05, -0.41);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.014, 0.26, 10), gunmetal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.052, -0.64);
    const flashHider = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.016, 0.055, 8), chromeBarrel);
    flashHider.rotation.x = Math.PI / 2;
    flashHider.position.set(0, 0.052, -0.77);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.22, 0.072), gunmetal);
    mag.rotation.x = -0.22;
    mag.position.set(0, -0.095, -0.18);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.125, 0.054), polymerGrip);
    grip.rotation.x = 0.25;
    grip.position.set(0, -0.05, 0.03);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.115, 0.24), polymerGrip);
    stock.position.set(0, 0.038, 0.19);
    // Magnified 2.2x Marksman Tactical Scope
    const scopeRail = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.02, 0.14), parkerized);
    scopeRail.position.set(0, 0.105, -0.1);
    const scopeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.02, 0.21, 12), gunmetal);
    scopeTube.rotation.x = Math.PI / 2;
    scopeTube.position.set(0, 0.136, -0.11);
    const scopeBell = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.024, 0.055, 12), gunmetal);
    scopeBell.rotation.x = Math.PI / 2;
    scopeBell.position.set(0, 0.136, -0.215);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.01, 12), opticGlass);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 0.136, -0.244);
    group.add(receiver, handguard, barrel, flashHider, mag, grip, stock, scopeRail, scopeTube, scopeBell, lens);
  }

  return group;
}

/**
 * Builds an articulated humanoid grounded at y = 0 facing local -Z (North).
 * Explicit facial features (sunglasses/eyes/nose) on -Z face so facing direction is unmistakable.
 */
export function createHumanoidModel(opts: {
  shirtColor: number;
  pantsColor: number;
  skinColor?: number;
  isPolice?: boolean;
  isTrafficPolice?: boolean;
  isPlayer?: boolean;
  outfitStyle?: 'casual' | 'kurta' | 'saree' | 'salwar';
  variant?:
    | 'default'
    | 'pandit'
    | 'temple_visitor'
    | 'imam'
    | 'mosque_visitor'
    | 'swat'
    | 'commando'
    | 'army'
    | 'vakil'
    | 'judge'
    | 'prison_guard'
    | 'jailer';
}): HumanoidRig {
  const root = new THREE.Group();

  const isKhakiBeatCop =
    Boolean(opts.isPolice) &&
    !opts.isTrafficPolice &&
    opts.variant !== 'swat' &&
    opts.variant !== 'commando' &&
    opts.variant !== 'army' &&
    opts.variant !== 'prison_guard' &&
    opts.variant !== 'jailer';

  const resolvedShirtColor = isKhakiBeatCop
    ? 0xa88f5c
    : opts.isTrafficPolice
      ? 0xf1f5f9
      : opts.variant === 'vakil'
        ? 0x111827
        : opts.variant === 'judge'
          ? 0x0f172a
          : opts.variant === 'prison_guard'
            ? 0x4b5563
            : opts.variant === 'jailer'
              ? 0x334155
              : opts.shirtColor;
  const resolvedPantsColor = isKhakiBeatCop
    ? 0x8d7548
    : opts.isTrafficPolice
      ? 0x1e293b
      : opts.variant === 'vakil' || opts.variant === 'judge'
        ? 0x0f172a
        : opts.variant === 'prison_guard' || opts.variant === 'jailer'
          ? 0x374151
          : opts.pantsColor;

  const skinMat = new THREE.MeshStandardMaterial({
    color: opts.skinColor ?? 0xd8a47f,
    roughness: 0.72,
    metalness: 0.02,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: resolvedShirtColor,
    roughness: 0.78,
    metalness: 0.05,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: resolvedPantsColor,
    roughness: 0.85,
    metalness: 0.04,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color:
      opts.variant === 'pandit' || opts.variant === 'temple_visitor' || opts.variant === 'imam' || opts.variant === 'mosque_visitor'
        ? 0x5c3a21
        : 0x181a1f,
    roughness: 0.65,
    metalness: 0.08,
  });

  // Legs (pivot at hip y = 0.84)
  const makeLeg = (xOffset: number) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(xOffset, 0.84, 0);
    const legMesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        opts.variant === 'pandit' || opts.variant === 'imam' ? 0.25 : 0.22,
        0.76,
        opts.variant === 'pandit' || opts.variant === 'imam' ? 0.26 : 0.24,
      ),
      pantsMat,
    );
    legMesh.position.y = -0.38;
    legMesh.castShadow = true;
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.12, 0.32), shoeMat);
    shoe.position.set(0, -0.78, -0.04); // toe points toward -Z!
    shoe.castShadow = true;
    legPivot.add(legMesh, shoe);

    if (opts.variant === 'pandit') {
      const zariHem = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.08, 0.27),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45, metalness: 0.25 }),
      );
      zariHem.position.set(0, -0.68, 0);
      legPivot.add(zariHem);
    }
    return legPivot;
  };

  const leftLeg = makeLeg(-0.15);
  const rightLeg = makeLeg(0.15);
  root.add(leftLeg, rightLeg);

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.66, 0.3), shirtMat);
  torso.position.y = 1.18;
  torso.castShadow = true;
  root.add(torso);

  const isTraditional =
    opts.variant === 'pandit' ||
    opts.variant === 'temple_visitor' ||
    opts.variant === 'imam' ||
    opts.variant === 'mosque_visitor';

  const outfit = opts.outfitStyle ?? 'casual';

  let beltMesh: THREE.Mesh | undefined;
  let kurtaHem: THREE.Mesh | undefined;
  let kurtaPlacket: THREE.Mesh | undefined;

  if (isTraditional) {
    // Traditional lower kurta skirt flare instead of tactical belt
    kurtaHem = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.26, 0.32), shirtMat);
    kurtaHem.position.y = 0.84;
    kurtaHem.castShadow = true;
    root.add(kurtaHem);
  } else if (outfit === 'kurta') {
    kurtaHem = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.3, 0.32), shirtMat);
    kurtaHem.position.y = 0.82;
    kurtaHem.castShadow = true;
    kurtaPlacket = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.32, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.65 }),
    );
    kurtaPlacket.position.set(0, 1.32, -0.15);
    root.add(kurtaHem, kurtaPlacket);
  } else if (outfit === 'saree') {
    // Draped saree pallu across shoulder & vibrant golden zari border hem
    const pallu = new THREE.Mesh(
      new THREE.BoxGeometry(0.57, 0.14, 0.33),
      new THREE.MeshStandardMaterial({ color: resolvedPantsColor, roughness: 0.68 }),
    );
    pallu.position.set(0, 1.24, 0);
    pallu.rotation.z = 0.42;
    const zariBorder = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.07, 0.34),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.42, metalness: 0.28 }),
    );
    zariBorder.position.set(0, 0.84, 0);
    const sareeSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.3, 0.33), pantsMat);
    sareeSkirt.position.set(0, 0.86, 0);
    root.add(pallu, sareeSkirt, zariBorder);
  } else if (outfit === 'salwar') {
    const kameezHem = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.32), shirtMat);
    kameezHem.position.set(0, 0.82, 0);
    kameezHem.castShadow = true;
    const dupatta = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.13, 0.33),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.7 }),
    );
    dupatta.position.set(0, 1.29, 0);
    dupatta.rotation.z = -0.35;
    root.add(kameezHem, dupatta);
  } else {
    // Leather police belt for khaki beat cops or standard belt
    const beltColor = isKhakiBeatCop ? 0x3b1f0e : 0x16181d;
    beltMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.09, 0.32),
      new THREE.MeshStandardMaterial({ color: beltColor, roughness: 0.38, metalness: 0.25 }),
    );
    beltMesh.position.y = 0.88;
    root.add(beltMesh);
    if (opts.isPlayer) {
      kurtaHem = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.3, 0.32), shirtMat);
      kurtaHem.position.y = 0.82;
      kurtaHem.castShadow = true;
      kurtaHem.visible = false;
      kurtaPlacket = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.32, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.65 }),
      );
      kurtaPlacket.position.set(0, 1.32, -0.15);
      kurtaPlacket.visible = false;
      root.add(kurtaHem, kurtaPlacket);
    }
    if (isKhakiBeatCop) {
      // Classic Indian Police brown Sam Browne cross-strap + brass buckle
      const crossStrap = new THREE.Mesh(
        new THREE.BoxGeometry(0.57, 0.07, 0.325),
        new THREE.MeshStandardMaterial({ color: 0x3b1f0e, roughness: 0.38, metalness: 0.2 }),
      );
      crossStrap.position.set(0, 1.22, 0);
      crossStrap.rotation.z = 0.56;
      const buckle = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.08, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.2 }),
      );
      buckle.position.set(0, 0.88, -0.165);
      root.add(crossStrap, buckle);
    }
  }

  if (opts.variant === 'pandit') {
    const angavastram = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.15, 0.34),
      new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.68 }),
    );
    angavastram.position.set(0, 1.31, 0);
    angavastram.rotation.z = 0.4;
    const rudrakshaMala = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.025, 6, 14),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }),
    );
    rudrakshaMala.position.set(0, 1.38, -0.14);
    root.add(angavastram, rudrakshaMala);
  } else if (opts.variant === 'temple_visitor') {
    const uttariya = new THREE.Mesh(
      new THREE.BoxGeometry(0.57, 0.12, 0.33),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.65 }),
    );
    uttariya.position.set(0, 1.3, 0);
    uttariya.rotation.z = -0.34;
    const placket = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.34, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.5 }),
    );
    placket.position.set(0, 1.31, -0.15);
    root.add(uttariya, placket);
  } else if (opts.variant === 'imam') {
    const stole = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.68, 0.34),
      new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.65 }),
    );
    stole.position.set(0, 1.18, 0);
    const trim = new THREE.Mesh(
      new THREE.BoxGeometry(0.57, 0.07, 0.33),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 }),
    );
    trim.position.set(0, 0.74, 0);
    root.add(stole, trim);
  } else if (opts.variant === 'mosque_visitor') {
    const waistcoat = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.48, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x1e3a3a, roughness: 0.72 }),
    );
    waistcoat.position.set(0, 1.21, 0);
    const collar = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.09, 0.33),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 }),
    );
    collar.position.set(0, 1.47, 0);
    root.add(waistcoat, collar);
  }

  if (opts.variant === 'vakil' || opts.variant === 'judge') {
    const neckBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.24, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 }),
    );
    neckBand.position.set(0, 1.38, -0.155);
    root.add(neckBand);
    if (opts.variant === 'judge') {
      const robeHem = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.34, 0.34), shirtMat);
      robeHem.position.set(0, 0.84, 0);
      const sash = new THREE.Mesh(
        new THREE.BoxGeometry(0.59, 0.08, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.5 }),
      );
      sash.position.set(0, 1.08, 0);
      root.add(robeHem, sash);
    }
  }
  if (opts.variant === 'prison_guard' || opts.variant === 'jailer') {
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.09, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4, metalness: 0.25 }),
    );
    belt.position.y = 0.88;
    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 }),
    );
    badge.position.set(0.13, 1.32, -0.155);
    root.add(belt, badge);
  }
  if (opts.isPolice) {
    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.1, 0.03),
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 }),
    );
    badge.position.set(0.13, 1.32, -0.155); // badge on chest facing -Z
    root.add(badge);
  }
  if (opts.variant === 'swat' || opts.variant === 'commando' || opts.variant === 'army') {
    const vestColor = opts.variant === 'army' ? 0x3f6212 : opts.variant === 'commando' ? 0x1e293b : 0x0f172a;
    const plateCarrier = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.44, 0.35),
      new THREE.MeshStandardMaterial({ color: vestColor, roughness: 0.55, metalness: 0.25 }),
    );
    plateCarrier.position.set(0, 1.21, 0);
    root.add(plateCarrier);
  }
  if (opts.isTrafficPolice) {
    const sash = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.11, 0.32),
      new THREE.MeshStandardMaterial({
        color: 0xa3e635,
        emissive: 0x65a30d,
        emissiveIntensity: 0.35,
        roughness: 0.4,
      }),
    );
    sash.position.set(0, 1.18, 0);
    root.add(sash);
  }

  // Head group (facing -Z)
  const head = new THREE.Group();
  head.position.set(0, 1.67, 0);
  const cranium = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), skinMat);
  cranium.castShadow = true;
  head.add(cranium);

  if (opts.variant === 'swat' || opts.variant === 'commando' || opts.variant === 'army') {
    const helmetColor = opts.variant === 'army' ? 0x365314 : opts.variant === 'commando' ? 0x18181b : 0x0f172a;
    const helmet = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.2, 0.38),
      new THREE.MeshStandardMaterial({ color: helmetColor, roughness: 0.45, metalness: 0.3 }),
    );
    helmet.position.set(0, 0.14, 0.01);
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.08, 0.08),
      new THREE.MeshStandardMaterial({
        color: opts.variant === 'commando' ? 0x10b981 : 0x38bdf8,
        emissive: opts.variant === 'commando' ? 0x059669 : 0x0284c7,
        emissiveIntensity: 0.45,
        metalness: 0.7,
        roughness: 0.2,
      }),
    );
    visor.position.set(0, 0.05, -0.17);
    head.add(helmet, visor);
  } else if (opts.isPolice || opts.variant === 'prison_guard' || opts.variant === 'jailer') {
    const capColor = isKhakiBeatCop
      ? 0x9b8352
      : opts.isTrafficPolice
        ? 0xf8fafc
        : opts.variant === 'prison_guard' || opts.variant === 'jailer'
          ? 0x374151
          : 0x18253a;
    const bandColor = isKhakiBeatCop
      ? 0x1e3a8a
      : opts.isTrafficPolice
        ? 0x1e293b
        : opts.variant === 'jailer'
          ? 0xb45309
          : 0x0f172a;
    const capCrown = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.13, 0.35),
      new THREE.MeshStandardMaterial({ color: capColor, roughness: 0.62 }),
    );
    capCrown.position.y = 0.16;
    const capBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.355, 0.04, 0.355),
      new THREE.MeshStandardMaterial({ color: bandColor, roughness: 0.5 }),
    );
    capBand.position.y = 0.11;
    const capBrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.04, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.32 }),
    );
    capBrim.position.set(0, 0.11, -0.2); // brim points forward (-Z)
    head.add(capCrown, capBand, capBrim);
  } else if (opts.variant === 'imam' || opts.variant === 'mosque_visitor') {
    const topi = new THREE.Mesh(
      new THREE.CylinderGeometry(0.165, 0.17, 0.12, 12),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.72 }),
    );
    topi.position.set(0, 0.19, 0);
    const topiBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.172, 0.172, 0.03, 12),
      new THREE.MeshStandardMaterial({ color: opts.variant === 'imam' ? 0xd4af37 : 0x059669, roughness: 0.4 }),
    );
    topiBand.position.set(0, 0.145, 0);
    const beard = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.13, 0.08),
      new THREE.MeshStandardMaterial({ color: opts.variant === 'imam' ? 0xdbe2ea : 0x1f242c, roughness: 0.9 }),
    );
    beard.position.set(0, -0.11, -0.135);
    head.add(topi, topiBand, beard);
  } else if (opts.variant === 'pandit' || opts.variant === 'temple_visitor') {
    const hair = new THREE.Mesh(
      new THREE.BoxGeometry(0.33, 0.1, 0.33),
      new THREE.MeshStandardMaterial({ color: opts.variant === 'pandit' ? 0x4b4440 : 0x1f1916, roughness: 0.88 }),
    );
    hair.position.set(0, 0.15, 0.02);
    const tilak = new THREE.Mesh(
      new THREE.BoxGeometry(0.036, 0.09, 0.02),
      new THREE.MeshStandardMaterial({
        color: opts.variant === 'pandit' ? 0xfef08a : 0xef4444,
        emissive: opts.variant === 'pandit' ? 0xf59e0b : 0xb91c1c,
        emissiveIntensity: 0.3,
      }),
    );
    tilak.position.set(0, 0.085, -0.165);
    head.add(hair, tilak);
  } else {
    const hair = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.12, 0.34),
      new THREE.MeshStandardMaterial({
        color: opts.variant === 'judge' ? 0x9ca3af : opts.isPlayer ? 0x141414 : 0x2a1f18,
        roughness: 0.88,
      }),
    );
    hair.position.set(0, 0.15, 0.02);
    head.add(hair);
  }

  // Respectful eyes for traditional characters, tactical shades for player/police/street
  if (isTraditional) {
    [-0.075, 0.075].forEach((ex) => {
      const eye = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.035, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }),
      );
      eye.position.set(ex, 0.025, -0.162);
      head.add(eye);
    });
  } else {
    const shades = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.075, 0.05),
      new THREE.MeshStandardMaterial({
        color: opts.isPlayer || opts.isPolice ? 0x090d14 : 0x1e293b,
        metalness: 0.65,
        roughness: 0.2,
      }),
    );
    shades.position.set(0, 0.03, -0.165);
    head.add(shades);
  }

  // Wearable 3D ISI Full-Face Motorcycle Helmet (hidden until player wears helmet)
  const helmetMesh = new THREE.Group();
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x18181b,
    roughness: 0.25,
    metalness: 0.35,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
  });
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.35,
    metalness: 0.2,
  });
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d14,
    metalness: 0.85,
    roughness: 0.08,
    clearcoat: 1.0,
  });
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.245, 14, 12), shellMat);
  shell.scale.set(1.0, 0.96, 1.08);
  shell.position.set(0, 0.03, 0);
  const chinGuard = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.22), shellMat);
  chinGuard.position.set(0, -0.1, -0.14);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.48), stripeMat);
  stripe.position.set(0, 0.16, 0.01);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.13, 0.09), visorMat);
  visor.position.set(0, 0.03, -0.22);
  helmetMesh.add(shell, chinGuard, stripe, visor);
  helmetMesh.visible = false;
  head.add(helmetMesh);

  root.add(head);

  // Arms (pivot at shoulder y = 1.44)
  const makeArm = (xOffset: number) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(xOffset, 1.44, 0);
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.38, 0.18), shirtMat);
    sleeve.position.y = -0.17;
    sleeve.castShadow = true;
    const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), skinMat);
    forearm.position.y = -0.46;
    forearm.castShadow = true;
    armPivot.add(sleeve, forearm);
    return armPivot;
  };

  const leftArm = makeArm(-0.37);
  const rightArm = makeArm(0.37);

  // Generic fictional smartphone prop on left hand for realistic witness phone calls
  const phoneProp = new THREE.Mesh(
    new THREE.BoxGeometry(0.085, 0.15, 0.025),
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.85,
      roughness: 0.25,
    }),
  );
  phoneProp.position.set(0.03, -0.56, -0.11);
  phoneProp.rotation.x = -0.3;
  phoneProp.visible = false;
  leftArm.add(phoneProp);

  // Weapon mount attached to right hand pointing forward (-Z)
  const weaponMount = new THREE.Group();
  weaponMount.position.set(0, -0.58, -0.1);
  rightArm.add(weaponMount);

  // Indian Police wooden Lathi (baton) for non-lethal arrest mode
  const lathiProp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.038, 0.72, 8),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.78, metalness: 0.05 }),
  );
  lathiProp.rotation.x = Math.PI / 2;
  lathiProp.position.set(0, 0.02, -0.32);
  lathiProp.visible = false;
  weaponMount.add(lathiProp);

  root.add(leftArm, rightArm);

  return {
    root,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    weaponMount,
    lathiProp,
    head,
    phoneProp,
    helmetMesh,
    shirtMat,
    pantsMat,
    beltMesh,
    kurtaHem,
    kurtaPlacket,
  };
}

export interface HelicopterRig {
  root: THREE.Group;
  mainRotor: THREE.Group;
  tailRotor: THREE.Group;
  spotlightBeam: THREE.Mesh;
  spotLight: THREE.SpotLight;
}

export function createPoliceChopperModel(): HelicopterRig {
  const root = new THREE.Group();
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x0f172a, metalness: 0.45, roughness: 0.3, clearcoat: 0.7 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.12 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.35 });

  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.55, 4.8), bodyMat);
  fuselage.castShadow = true;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.32, 3.6), stripeMat);
  stripe.position.y = -0.15;
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.95, 1.8), glassMat);
  canopy.position.set(0, 0.22, -1.85);
  const tailBoom = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 4.2), bodyMat);
  tailBoom.position.set(0, 0.25, 4.2);
  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 0.7), stripeMat);
  tailFin.position.set(0, 0.65, 6.1);
  root.add(fuselage, stripe, canopy, tailBoom, tailFin);

  [-0.95, 0.95].forEach((sx) => {
    const skid = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 3.6), metalMat);
    skid.position.set(sx, -1.18, -0.2);
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 0.1), metalMat);
    s1.position.set(sx, -0.92, -1.0);
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.55, 0.1), metalMat);
    s2.position.set(sx, -0.92, 0.8);
    root.add(skid, s1, s2);
  });

  const mainRotor = new THREE.Group();
  mainRotor.position.set(0, 1.05, 0);
  const blade1 = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.06, 0.24), metalMat);
  const blade2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 7.6), metalMat);
  mainRotor.add(blade1, blade2);
  root.add(mainRotor);

  const tailRotor = new THREE.Group();
  tailRotor.position.set(0.28, 0.55, 6.1);
  const tb1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.4, 0.14), stripeMat);
  const tb2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 1.4), stripeMat);
  tailRotor.add(tb1, tb2);
  root.add(tailRotor);

  const beamGeo = new THREE.ConeGeometry(4.8, 26, 16, 1, true);
  beamGeo.translate(0, -13, 0);
  const spotlightBeam = new THREE.Mesh(
    beamGeo,
    new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  spotlightBeam.position.set(0, -0.8, -1.7);
  root.add(spotlightBeam);

  const spotLight = new THREE.SpotLight(0xe0f2fe, 4.5, 48, 0.36, 0.45, 1.0);
  spotLight.position.set(0, -0.8, -1.7);
  root.add(spotLight);
  root.add(spotLight.target);

  return { root, mainRotor, tailRotor, spotlightBeam, spotLight };
}

export function createRoadblockBarricade(): THREE.Group {
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45, metalness: 0.2 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.65 });
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.9,
  });
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.32, 0.24), frameMat);
  topBar.position.y = 0.96;
  const midBar = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.26, 0.24), darkMat);
  midBar.position.y = 0.64;
  [-1.55, 1.55].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.15, 0.65), darkMat);
    leg.position.set(lx, 0.58, 0);
    g.add(leg);
  });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), lampMat);
  beacon.position.set(0, 1.22, 0);
  g.add(topBar, midBar, beacon);
  return g;
}

/**
 * Multi-part PBR vehicle builder grounded at y = 0, facing local -Z (headlights forward).
 * Supports Indian motorcycles ('bike'), White/Blue Police Vajra SUVs ('police'), Auto-Rickshaws, Sedans & Tactical units.
 */
export function createVehicleModel(
  kind: VehicleKind,
  bodyColorHex?: number,
): VehicleRig {
  const root = new THREE.Group();
  const wheels: THREE.Mesh[] = [];

  if (kind === 'bike') {
    const bikePaintColor =
      bodyColorHex ?? [0xb91c1c, 0x1d4ed8, 0x111827, 0xd97706, 0x047857][Math.floor(Math.random() * 5)];
    const paintMat = new THREE.MeshPhysicalMaterial({
      color: bikePaintColor,
      metalness: 0.55,
      roughness: 0.24,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.92, roughness: 0.18 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.4 });
    const leatherMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.78, metalness: 0.05 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.88, metalness: 0.04 });

    // Lower chassis & engine block
    const engine = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.52), frameMat);
    engine.position.set(0, 0.44, -0.05);
    engine.castShadow = true;
    root.add(engine);

    // Chrome exhaust silencer along right side (+X)
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.95, 10), chromeMat);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(0.22, 0.36, 0.32);
    root.add(exhaust);

    // Sculpted Fuel Tank
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.26, 0.58), paintMat);
    tank.position.set(0, 0.86, -0.24);
    tank.rotation.x = 0.08;
    tank.castShadow = true;
    root.add(tank);

    // Contoured Rider & Pillion Seat
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.76), leatherMat);
    seat.position.set(0, 0.78, 0.36);
    seat.castShadow = true;
    root.add(seat);

    // Rear cowl + tail lamp
    const rearFender = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.38), paintMat);
    rearFender.position.set(0, 0.66, 0.84);
    rearFender.rotation.x = 0.22;
    const tailLamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.08, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.75 }),
    );
    tailLamp.position.set(0, 0.68, 1.02);
    root.add(rearFender, tailLamp);

    // Twin Front Suspension Forks, Handlebar, Mirrors & Round Headlight (-Z)
    [-0.11, 0.11].forEach((fx) => {
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.82, 8), chromeMat);
      fork.position.set(fx, 0.64, -0.66);
      fork.rotation.x = 0.28;
      root.add(fork);
    });
    const frontMudguard = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.42), paintMat);
    frontMudguard.position.set(0, 0.64, -0.78);
    const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.82, 8), chromeMat);
    handlebar.rotation.z = Math.PI / 2;
    handlebar.position.set(0, 1.04, -0.52);
    [-0.38, 0.38].forEach((gx) => {
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.14, 8), leatherMat);
      grip.rotation.z = Math.PI / 2;
      grip.position.set(gx, 1.04, -0.52);
      root.add(grip);
    });
    const headHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.16, 12), frameMat);
    headHousing.rotation.x = Math.PI / 2;
    headHousing.position.set(0, 0.94, -0.72);
    const headLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.04, 12),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfde68a, emissiveIntensity: 0.95 }),
    );
    headLens.rotation.x = Math.PI / 2;
    headLens.position.set(0, 0.94, -0.8);
    root.add(frontMudguard, handlebar, headHousing, headLens);

    // 2 Wheels (Front -Z, Rear +Z)
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.16, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.18, 12);
    rimGeo.rotateZ(Math.PI / 2);
    for (const wz of [-0.78, 0.78]) {
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.position.set(0, 0.32, wz);
      tire.castShadow = true;
      tire.add(new THREE.Mesh(rimGeo, chromeMat));
      root.add(tire);
      wheels.push(tire);
    }

    // Visible seated AI rider who ALWAYS wears an ISI helmet while on the bike
    const riderColors = [0x334155, 0x1e3a5f, 0x9a3412, 0x3f6212, 0x7c2d12];
    const riderShirt = riderColors[Math.abs(bikePaintColor) % riderColors.length];
    const riderRig = createHumanoidModel({
      shirtColor: riderShirt,
      pantsColor: 0x1e2430,
      skinColor: 0xc98b63,
      outfitStyle: 'casual',
    });
    riderRig.helmetMesh.visible = true;
    riderRig.root.position.set(0, 0.24, 0.06);
    riderRig.leftArm.rotation.x = 0.85;
    riderRig.rightArm.rotation.x = 0.85;
    riderRig.leftLeg.rotation.x = 0.55;
    riderRig.rightLeg.rotation.x = 0.55;
    riderRig.root.visible = false;
    root.add(riderRig.root);

    return { root, wheels, riderRig };
  }

  if (kind === 'rickshaw') {
    const greenMat = new THREE.MeshPhysicalMaterial({
      color: 0x15803d,
      metalness: 0.35,
      roughness: 0.35,
      clearcoat: 0.7,
    });
    const yellowMat = new THREE.MeshPhysicalMaterial({
      color: 0xfacc15,
      metalness: 0.25,
      roughness: 0.35,
      clearcoat: 0.7,
    });
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.85,
      metalness: 0.05,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.75,
      roughness: 0.15,
    });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.88 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25 });

    // Lower tub + yellow belt trim
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.56, 2.75), greenMat);
    base.position.set(0, 0.54, 0.1);
    base.castShadow = true;
    root.add(base);

    const yellowTrim = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.22, 2.78), yellowMat);
    yellowTrim.position.set(0, 0.84, 0.1);
    root.add(yellowTrim);

    // Front fairing & windshield facing -Z
    const cowl = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.95, 0.55), yellowMat);
    cowl.position.set(0, 0.88, -1.12);
    cowl.castShadow = true;
    root.add(cowl);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.52, 0.12), glassMat);
    windshield.position.set(0, 1.48, -1.04);
    windshield.rotation.x = -0.22;
    root.add(windshield);

    // Classic black canvas auto canopy roof + rear pillars
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 2.45), canopyMat);
    canopy.position.set(0, 1.82, 0.15);
    canopy.castShadow = true;
    root.add(canopy);

    const rearBack = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.92, 0.22), canopyMat);
    rearBack.position.set(0, 1.32, 1.32);
    root.add(rearBack);

    // Single round bright headlight facing -Z
    const hl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfde68a, emissiveIntensity: 0.95 }),
    );
    hl.rotation.x = Math.PI / 2;
    hl.position.set(0, 0.82, -1.42);
    root.add(hl);

    // 3 Wheels: 1 centered front wheel (-Z), 2 rear wheels (+Z)
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.24, 10);
    rimGeo.rotateZ(Math.PI / 2);

    const coords: [number, number][] = [
      [0, -1.2],
      [-0.78, 0.95],
      [0.78, 0.95],
    ];
    for (const [wx, wz] of coords) {
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.position.set(wx, 0.3, wz);
      tire.castShadow = true;
      tire.add(new THREE.Mesh(rimGeo, rimMat));
      root.add(tire);
      wheels.push(tire);
    }

    return { root, wheels };
  }

  if (kind === 'swat_van' || kind === 'army_truck' || kind === 'armored_apc') {
    const tacticalColor =
      kind === 'swat_van' ? 0x0f172a : kind === 'army_truck' ? 0x365314 : 0x3f4a32;
    const armorMat = new THREE.MeshStandardMaterial({
      color: tacticalColor,
      metalness: kind === 'armored_apc' ? 0.55 : 0.25,
      roughness: 0.62,
    });
    const cabinGlass = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.1,
    });
    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      metalness: 0.5,
      roughness: 0.55,
    });
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x121418,
      roughness: 0.88,
      metalness: 0.05,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.22,
    });
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(2.45, kind === 'army_truck' ? 1.55 : 1.35, 5.2),
      armorMat,
    );
    hull.position.set(0, 1.15, 0);
    hull.castShadow = true;
    root.add(hull);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.9, 1.85), armorMat);
    cab.position.set(0, 1.85, -1.2);
    cab.castShadow = true;
    root.add(cab);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.42, 0.14), cabinGlass);
    visor.position.set(0, 1.88, -2.14);
    root.add(visor);

    const bullbar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.45, 0.32), bumperMat);
    bullbar.position.set(0, 0.62, -2.68);
    root.add(bullbar);

    if (kind === 'armored_apc') {
      const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.9, 0.55, 10), armorMat);
      turret.position.set(0, 2.35, 0.45);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.8, 8), bumperMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 2.42, -0.75);
      root.add(turret, barrel);
    }

    let lightBarRed: THREE.Mesh | undefined;
    let lightBarBlue: THREE.Mesh | undefined;
    if (kind === 'swat_van') {
      lightBarRed = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.15, 0.28),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.6 }),
      );
      lightBarRed.position.set(-0.35, 2.36, -1.2);
      lightBarBlue = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.15, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.6 }),
      );
      lightBarBlue.position.set(0.35, 2.36, -1.2);
      root.add(lightBarRed, lightBarBlue);
    }

    const wheelGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.34, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.36, 10);
    rimGeo.rotateZ(Math.PI / 2);
    const wc: [number, number][] = [
      [-1.18, -1.65],
      [1.18, -1.65],
      [-1.18, 0.2],
      [1.18, 0.2],
      [-1.18, 1.75],
      [1.18, 1.75],
    ];
    for (const [wx, wz] of wc) {
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.position.set(wx, 0.46, wz);
      tire.castShadow = true;
      tire.add(new THREE.Mesh(rimGeo, rimMat));
      root.add(tire);
      wheels.push(tire);
    }
    return { root, wheels, lightBarRed, lightBarBlue };
  }

  // Authentic White & Royal-Blue Indian Police Vajra Patrol SUV
  if (kind === 'police') {
    const whiteMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      metalness: 0.22,
      roughness: 0.28,
      clearcoat: 0.85,
    });
    const royalBlueMat = new THREE.MeshPhysicalMaterial({
      color: 0x1d4ed8,
      metalness: 0.35,
      roughness: 0.3,
      clearcoat: 0.8,
    });
    const cabinGlass = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.1,
    });
    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      metalness: 0.55,
      roughness: 0.5,
    });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.88, metalness: 0.05 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.22 });

    // Raised Vajra Police SUV body
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.78, 4.55), whiteMat);
    lowerBody.position.set(0, 0.8, 0);
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    root.add(lowerBody);

    // Royal-Blue police waist stripe & lower side cladding
    const blueStripe = new THREE.Mesh(new THREE.BoxGeometry(2.17, 0.26, 4.57), royalBlueMat);
    blueStripe.position.set(0, 0.86, 0);
    root.add(blueStripe);

    // Tall boxy SUV cabin greenhouse extending to rear tailgate
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.78, 2.95), whiteMat);
    cabin.position.set(0, 1.56, 0.62);
    cabin.castShadow = true;
    const glassBand = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.56, 2.99), cabinGlass);
    glassBand.position.set(0, 1.55, 0.62);
    root.add(cabin, glassBand);

    // Door POLICE / पुलिस decal plates on both sides
    const policeTex = createStreetCanvasTex('#1d4ed8', '#f8fafc', 'POLICE · पुलिस', 'DIAL 100 PATROL');
    const decalMat = new THREE.MeshStandardMaterial({ map: policeTex, roughness: 0.35 });
    [-1.09, 1.09].forEach((sx) => {
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.36, 1.45), decalMat);
      plate.position.set(sx, 0.84, -0.05);
      root.add(plate);
    });

    // Heavy black front bullbar + side steps
    const frontBullbar = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.36, 0.28), bumperMat);
    frontBullbar.position.set(0, 0.54, -2.35);
    const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.16, 0.26, 0.22), bumperMat);
    rearBumper.position.set(0, 0.5, 2.32);
    root.add(frontBullbar, rearBumper);

    // Tailgate-mounted spare wheel (+Z)
    const spareTire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.22, 14), tireMat);
    spareTire.rotation.x = Math.PI / 2;
    spareTire.position.set(0, 1.15, 2.34);
    const spareCover = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.24, 12), royalBlueMat);
    spareCover.rotation.x = Math.PI / 2;
    spareCover.position.set(0, 1.15, 2.35);
    root.add(spareTire, spareCover);

    // Headlights & Taillights
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfde68a, emissiveIntensity: 0.9 });
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xef4444, emissiveIntensity: 0.7 });
    [-0.74, 0.74].forEach((x) => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.2, 0.08), headMat);
      hl.position.set(x, 0.88, -2.28);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.08), tailMat);
      tl.position.set(x, 0.96, 2.28);
      root.add(hl, tl);
    });

    // Red-Blue Roof Beacon Bar
    const barMount = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.08, 0.32), bumperMat);
    barMount.position.set(0, 1.98, 0.15);
    const lightBarRed = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.15, 0.26),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.45 }),
    );
    lightBarRed.position.set(-0.31, 2.06, 0.15);
    const lightBarBlue = new THREE.Mesh(
      new THREE.BoxGeometry(0.54, 0.15, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.45 }),
    );
    lightBarBlue.position.set(0.31, 2.06, 0.15);
    root.add(barMount, lightBarRed, lightBarBlue);

    // Taller SUV Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.43, 0.43, 0.3, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.32, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const wheelCoords: [number, number][] = [
      [-1.04, -1.4],
      [1.04, -1.4],
      [-1.04, 1.4],
      [1.04, 1.4],
    ];
    for (const [wx, wz] of wheelCoords) {
      const tire = new THREE.Mesh(wheelGeo, tireMat);
      tire.position.set(wx, 0.43, wz);
      tire.castShadow = true;
      tire.add(new THREE.Mesh(rimGeo, rimMat));
      root.add(tire);
      wheels.push(tire);
    }

    return { root, wheels, lightBarRed, lightBarBlue };
  }

  const color =
    bodyColorHex ?? [0x991b1b, 0x1e40af, 0x374151, 0xb45309, 0x065f46][Math.floor(Math.random() * 5)];

  const paintMat = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.55,
    roughness: 0.28,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
  });
  const cabinGlass = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.1,
  });
  const bumperMat = new THREE.MeshStandardMaterial({
    color: 0x1e2430,
    metalness: 0.5,
    roughness: 0.55,
  });
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x121418,
    roughness: 0.88,
    metalness: 0.05,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.22,
  });

  // Lower chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.68, 4.4), paintMat);
  chassis.position.set(0, 0.66, 0);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  root.add(chassis);

  // Cabin upper greenhouse
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.58, 2.2), paintMat);
  cabin.position.set(0, 1.24, 0.22);
  cabin.castShadow = true;
  root.add(cabin);

  // Tinted windshield + rear glass
  const glassBand = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.44, 2.24), cabinGlass);
  glassBand.position.set(0, 1.22, 0.22);
  root.add(glassBand);

  // Front & rear bumpers + grille
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.24, 0.22), bumperMat);
  frontBumper.position.set(0, 0.42, -2.22);
  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.14, 0.24, 0.22), bumperMat);
  rearBumper.position.set(0, 0.42, 2.22);
  root.add(frontBumper, rearBumper);

  // Headlights facing -Z
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xfde68a,
    emissiveIntensity: 0.85,
  });
  const tailMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    emissive: 0xef4444,
    emissiveIntensity: 0.65,
  });
  [-0.72, 0.72].forEach((x) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.08), headMat);
    hl.position.set(x, 0.72, -2.21);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.08), tailMat);
    tl.position.set(x, 0.74, 2.21);
    root.add(hl, tl);
  });

  // Muscle hood intake
  if (kind === 'muscle') {
    const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 0.9), bumperMat);
    scoop.position.set(0, 1.03, -1.25);
    root.add(scoop);
  }

  // 4 Wheels with metallic rims
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.3, 12);
  rimGeo.rotateZ(Math.PI / 2);

  const wheelCoords: [number, number][] = [
    [-1.02, -1.35],
    [1.02, -1.35],
    [-1.02, 1.35],
    [1.02, 1.35],
  ];
  for (const [wx, wz] of wheelCoords) {
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.position.set(wx, 0.38, wz);
    tire.castShadow = true;
    const rim = new THREE.Mesh(rimGeo, rimMat);
    tire.add(rim);
    root.add(tire);
    wheels.push(tire);
  }

  return { root, wheels };
}

export interface DogRig {
  root: THREE.Group;
  flLeg: THREE.Group;
  frLeg: THREE.Group;
  blLeg: THREE.Group;
  brLeg: THREE.Group;
  tail: THREE.Group;
  head: THREE.Group;
}

/**
 * Builds an articulated Indian Pariah / Indie street dog grounded at y = 0, facing -Z.
 */
export function createIndianDogModel(seed = 0): DogRig {
  const root = new THREE.Group();

  const coatPalette = [0xd19455, 0xc07a3b, 0xb56b2e, 0xd8a870, 0x8f582c];
  const coatHex = coatPalette[Math.abs(seed) % coatPalette.length];

  const coatMat = new THREE.MeshStandardMaterial({ color: coatHex, roughness: 0.85, metalness: 0.02 });
  const creamMat = new THREE.MeshStandardMaterial({ color: 0xf1e6d2, roughness: 0.88, metalness: 0.01 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x171412, roughness: 0.45, metalness: 0.1 });

  // Slender athletic Indie torso & cream chest
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.62), coatMat);
  body.position.set(0, 0.36, 0.02);
  body.castShadow = true;
  root.add(body);

  const chest = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.22), creamMat);
  chest.position.set(0, 0.34, -0.2);
  root.add(chest);

  // Neck + Head + Snout + Pointed/Semi-folded Indie Ears
  const head = new THREE.Group();
  head.position.set(0, 0.48, -0.32);

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.16), coatMat);
  neck.rotation.x = 0.35;
  neck.position.set(0, -0.04, 0.05);
  head.add(neck);

  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.22), coatMat);
  skull.position.set(0, 0.06, -0.02);
  skull.castShadow = true;
  head.add(skull);

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.15), creamMat);
  snout.position.set(0, 0.02, -0.17);
  head.add(snout);

  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.045, 0.03), darkMat);
  nose.position.set(0, 0.04, -0.245);
  head.add(nose);

  [-0.065, 0.065].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), darkMat);
    eye.position.set(ex, 0.09, -0.13);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.11, 4), coatMat);
    ear.position.set(ex * 1.15, 0.18, 0.01);
    ear.rotation.z = ex < 0 ? 0.28 : -0.28;
    ear.rotation.x = 0.25;
    head.add(eye, ear);
  });
  root.add(head);

  // Classic upward curled Indie tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.44, 0.32);
  const tailBase = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.18, 0.055), coatMat);
  tailBase.position.set(0, 0.08, 0.04);
  tailBase.rotation.x = -0.55;
  const tailTip = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.14, 0.048), creamMat);
  tailTip.position.set(0, 0.19, 0.05);
  tailTip.rotation.x = 0.35;
  tail.add(tailBase, tailTip);
  root.add(tail);

  // 4 Articulated legs with white paw socks
  const makePawLeg = (lx: number, lz: number) => {
    const pivot = new THREE.Group();
    pivot.position.set(lx, 0.28, lz);
    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.22, 0.08), coatMat);
    upper.position.y = -0.11;
    upper.castShadow = true;
    const paw = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.07, 0.1), creamMat);
    paw.position.set(0, -0.245, -0.015);
    pivot.add(upper, paw);
    root.add(pivot);
    return pivot;
  };

  const flLeg = makePawLeg(-0.085, -0.22);
  const frLeg = makePawLeg(0.085, -0.22);
  const blLeg = makePawLeg(-0.085, 0.24);
  const brLeg = makePawLeg(0.085, 0.24);

  return { root, flLeg, frLeg, blLeg, brLeg, tail, head };
}

export interface RescueVanRig {
  root: THREE.Group;
  leftDoorPivot: THREE.Group;
  rightDoorPivot: THREE.Group;
  hitMesh: THREE.Mesh;
}

/**
 * Builds the Animal Rescue Van with hinged rear double doors (+Z) for the rescue cutscene.
 */
export function createRescueVanModel(): RescueVanRig {
  const root = new THREE.Group();

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xe2e8f0,
    roughness: 0.32,
    metalness: 0.25,
    clearcoat: 0.65,
  });
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.4,
    metalness: 0.3,
  });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.12 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.88 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.22 });

  // Front cab (-Z)
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.75, 1.8), bodyMat);
  cab.position.set(0, 1.15, -1.9);
  cab.castShadow = true;
  root.add(cab);

  const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.72, 0.15), glassMat);
  windshield.position.set(0, 1.55, -2.76);
  windshield.rotation.x = -0.15;
  root.add(windshield);

  // Cargo box walls + floor + roof (open rear at z = +2.6)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.22, 3.8), trimMat);
  floor.position.set(0, 0.42, 0.7);
  floor.receiveShadow = true;
  root.add(floor);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 3.8), bodyMat);
  roof.position.set(0, 2.38, 0.7);
  roof.castShadow = true;
  root.add(roof);

  [-1.14, 1.14].forEach((sx) => {
    const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.85, 3.8), bodyMat);
    sideWall.position.set(sx, 1.4, 0.7);
    sideWall.castShadow = true;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 3.76), stripeMat);
    stripe.position.set(sx, 1.15, 0.7);
    root.add(sideWall, stripe);
  });

  // Hinged rear doors at z = +2.6
  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.position.set(-1.12, 1.38, 2.6);
  const leftDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.8, 0.12), bodyMat);
  leftDoorMesh.position.set(0.54, 0, 0);
  leftDoorMesh.castShadow = true;
  const leftHandle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.16), trimMat);
  leftHandle.position.set(0.95, 0, 0.04);
  leftDoorPivot.add(leftDoorMesh, leftHandle);
  root.add(leftDoorPivot);

  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.position.set(1.12, 1.38, 2.6);
  const rightDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.08, 1.8, 0.12), bodyMat);
  rightDoorMesh.position.set(-0.54, 0, 0);
  rightDoorMesh.castShadow = true;
  const rightHandle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.16), trimMat);
  rightHandle.position.set(-0.95, 0, 0.04);
  rightDoorPivot.add(rightDoorMesh, rightHandle);
  root.add(rightDoorPivot);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14);
  wheelGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.32, 10);
  rimGeo.rotateZ(Math.PI / 2);
  const wCoords: [number, number][] = [
    [-1.12, -1.7],
    [1.12, -1.7],
    [-1.12, 1.7],
    [1.12, 1.7],
  ];
  for (const [wx, wz] of wCoords) {
    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.position.set(wx, 0.42, wz);
    tire.add(new THREE.Mesh(rimGeo, rimMat));
    root.add(tire);
  }

  const hitMesh = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.6, 5.8),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.set(0, 1.3, 0.2);
  hitMesh.userData = { shopAction: 'van' };
  root.add(hitMesh);

  return { root, leftDoorPivot, rightDoorPivot, hitMesh };
}

function createBankSignTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#0c231b';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 112);

  // Original geometric shield crest (uncopyrighted fictional bank emblem)
  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.moveTo(54, 30);
  ctx.lineTo(84, 30);
  ctx.lineTo(84, 68);
  ctx.lineTo(69, 92);
  ctx.lineTo(54, 68);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#0c231b';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('₹', 69, 58);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 31px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ROYAL BANK OF INDIA', 106, 65);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export interface ShopDisplayGun {
  weaponId: WeaponId;
  gunGroup: THREE.Group;
  hitMesh: THREE.Mesh;
  worldPos: THREE.Vector3;
}

export interface ShopDealerInfo {
  rig: HumanoidRig;
  hitMesh: THREE.Mesh;
  worldPos: THREE.Vector3;
}

export interface ChaiStallInfo {
  id: string;
  name: string;
  kind: 'chai' | 'golgappa' | 'chaat';
  vendorName: string;
  x: number;
  z: number;
  approachX: number;
  approachZ: number;
  hitMesh?: THREE.Mesh;
}

export interface SacredLandmarkInfo {
  id: string;
  name: string;
  kind: 'ram_mandir' | 'krishna_mandir' | 'mosque';
  x: number;
  z: number;
}

export interface AtmInfo {
  id: string;
  name: string;
  x: number;
  z: number;
  approachX: number;
  approachZ: number;
  hitMesh: THREE.Mesh;
}

export interface TrafficSignalRig {
  id: string;
  x: number;
  z: number;
  cycleOffset: number;
  nsRedMats: THREE.MeshStandardMaterial[];
  nsYellowMats: THREE.MeshStandardMaterial[];
  nsGreenMats: THREE.MeshStandardMaterial[];
  ewRedMats: THREE.MeshStandardMaterial[];
  ewYellowMats: THREE.MeshStandardMaterial[];
  ewGreenMats: THREE.MeshStandardMaterial[];
}

export interface InteriorLightSpot {
  x: number;
  y: number;
  z: number;
  color: number;
  intensity: number;
  distance: number;
}

export interface JailGuardVisual {
  rig: HumanoidRig;
  coneMesh: THREE.Mesh;
  waypoints: { x: number; z: number }[];
  wpIndex: number;
  x: number;
  z: number;
  yaw: number;
}

export interface ThanaActor {
  rig: HumanoidRig;
  kind: 'constable' | 'complainant' | 'prisoner' | 'duty' | 'inspector';
  name: string;
  baseX: number;
  baseZ: number;
  waypoints?: { x: number; z: number }[];
  wpIndex: number;
  x: number;
  z: number;
  yaw: number;
  active: boolean;
  seedId: number;
}

export interface JailInmateVisual {
  id: string;
  rig: HumanoidRig;
  name: string;
  role: 'exercise' | 'eat' | 'chat' | 'workshop' | 'ally' | 'rival';
  ally: boolean;
  isRival: boolean;
  hp: number;
  maxHp: number;
  bribeCost: number;
  bribed: boolean;
  defeated: boolean;
  attackCooldown: number;
  staggerTimer: number;
  alerted: boolean;
  yardPos: { x: number; z: number; yaw: number };
  workPos: { x: number; z: number; yaw: number };
  nightPos: { x: number; z: number; yaw: number };
  x: number;
  z: number;
  yaw: number;
  seedId: number;
}

export interface BuildingSignInfo {
  id: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  z: number;
  accent: string;
  maxDist?: number;
}

export interface IndianFamilyHouseRig {
  spawnPos: THREE.Vector3;
  pujaPos: THREE.Vector3;
  bedPos: THREE.Vector3;
  wardrobePos: THREE.Vector3;
  homeCenter: THREE.Vector3;
  nameplateMesh: THREE.Mesh;
  updateNameplate: (houseName: string) => void;
}

export interface CentralJailRig {
  guards: JailGuardVisual[];
  inmates: JailInmateVisual[];
  watchtowerBeams: THREE.Group[];
  mainGateDoor: THREE.Mesh;
  northGateDoor: THREE.Mesh;
  eastGateDoor: THREE.Mesh;
  cellGateDoor: THREE.Group;
  mainGateCollider: BuildingCollider;
  northGateCollider: BuildingCollider;
  eastGateCollider: BuildingCollider;
  cellGateCollider: BuildingCollider;
  bunkPos: THREE.Vector3;
  toiletPos: THREE.Vector3;
  cellInsidePos: THREE.Vector3;
  workshopPos: THREE.Vector3;
  wardenPos: THREE.Vector3;
  escapePos: THREE.Vector3;
  yardCenter: THREE.Vector3;
  releaseOutsidePos: THREE.Vector3;
  bribeOutsidePos: THREE.Vector3;
  escapeOutsidePos: THREE.Vector3;
  thanaDeskPos: THREE.Vector3;
  thanaLockupCellPos: THREE.Vector3;
  thanaInspectorPos: THREE.Vector3;
  thanaDoorwayPos: THREE.Vector3;
  thanaActors: ThanaActor[];
  thanaPrisoners: ThanaActor[];
  thanaLockupConstable: ThanaActor;
  thanaInspectorActor: ThanaActor;
  thanaRadioLedMat: THREE.MeshBasicMaterial;
}

export interface CourtComplexActor {
  rig: HumanoidRig;
  kind: 'vakil' | 'clerk' | 'judge' | 'witness';
  name: string;
  waypoints?: { x: number; z: number }[];
  wpIndex: number;
  x: number;
  z: number;
  yaw: number;
  seedId: number;
}

export interface CourtComplexRig {
  actors: CourtComplexActor[];
  atriumCenter: THREE.Vector3;
}

export interface CourtroomStageRig {
  root: THREE.Group;
  judgeRig: HumanoidRig;
  lawyerRig: HumanoidRig;
  inspectorRig: HumanoidRig;
  fanGroup: THREE.Group;
  kathgaraPos: THREE.Vector3;
  lightAnchor: THREE.Vector3;
}

export interface WaypointBeaconRig {
  root: THREE.Group;
  beam: THREE.Mesh;
  ring: THREE.Mesh;
}

export function createWaypointBeacon(): WaypointBeaconRig {
  const root = new THREE.Group();
  root.visible = false;

  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.65, 36, 12, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  beam.position.y = 18;
  root.add(beam);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 1.65, 24),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.24;
  root.add(ring);

  return { root, beam, ring };
}

/**
 * Builds the extended 11x11 Indian Theft Rickshaw city grid, sidewalks, instanced road markings & colonies,
 * Pankaj Shastra Bhandar, Grand Royal Bank Of India, Shree Ram Mandir, Shree Krishna Mandir, Noor Masjid,
 * District & Sessions Court exterior, Bharat Central Jail compound, Chai Tapris, Golgappa/Chaat Stalls,
 * Street Signs, Traffic Lights, Auto Stand, and colliders.
 */
export function buildCityEnvironment(
  scene: THREE.Scene,
  maxAniso: number,
): {
  colliders: BuildingCollider[];
  circleColliders: CircleCollider[];
  gunShopPos: THREE.Vector3;
  hospitalPos: THREE.Vector3;
  bankPos: THREE.Vector3;
  licenseOfficePos: THREE.Vector3;
  courtExitPos: THREE.Vector3;
  mafiaYardPos: THREE.Vector3;
  roadCenters: number[];
  shopDisplays: ShopDisplayGun[];
  shopDealer: ShopDealerInfo | null;
  bankClerk: ShopDealerInfo | null;
  licenseOfficer: ShopDealerInfo | null;
  chaiStalls: ChaiStallInfo[];
  sacredPlaces: SacredLandmarkInfo[];
  atms: AtmInfo[];
  trafficSignals: TrafficSignalRig[];
  nightEmissiveMats: THREE.MeshStandardMaterial[];
  interiorLightSpots: InteriorLightSpot[];
  jailRig: CentralJailRig;
  courtRig: CourtComplexRig;
  homeRig: IndianFamilyHouseRig;
  buildingSigns: BuildingSignInfo[];
} {
  const { roadTex, walkTex, facades } = createCityTextures(maxAniso);
  const colliders: BuildingCollider[] = [];
  const circleColliders: CircleCollider[] = [];
  const shopDisplays: ShopDisplayGun[] = [];
  const chaiStalls: ChaiStallInfo[] = [];
  const sacredPlaces: SacredLandmarkInfo[] = [];
  const atms: AtmInfo[] = [];
  const nightEmissiveMats: THREE.MeshStandardMaterial[] = [];
  const interiorLightSpots: InteriorLightSpot[] = [];
  const buildingSigns: BuildingSignInfo[] = [
    {
      id: 'sign-gunshop',
      title: 'Pankaj Shastra Bhandar',
      subtitle: 'Weapons · Ammo · Armor · Medkits',
      x: 30,
      y: 7.4,
      z: -19.5,
      accent: 'amber',
    },
    {
      id: 'sign-hospital',
      title: 'City Hospital',
      subtitle: '24×7 Emergency & Trauma Care',
      x: -30,
      y: 13.8,
      z: 24.0,
      accent: 'red',
    },
    {
      id: 'sign-bank',
      title: 'Royal Bank Of India',
      subtitle: 'Savings · FD · Rescue Mission',
      x: -30,
      y: 10.6,
      z: -76.8,
      accent: 'emerald',
    },
    {
      id: 'sign-ram-mandir',
      title: 'Shree Ram Mandir',
      subtitle: 'Darshan & Aashirwad [E]',
      x: 20,
      y: 8.6,
      z: 30,
      accent: 'orange',
    },
    {
      id: 'sign-krishna-mandir',
      title: 'Shree Krishna Mandir',
      subtitle: 'Darshan & Aashirwad [E]',
      x: 90,
      y: 8.6,
      z: -19.5,
      accent: 'orange',
    },
    {
      id: 'sign-masjid',
      title: 'Noor Masjid',
      subtitle: 'Dua & Salaam [E]',
      x: -90,
      y: 8.6,
      z: -19.5,
      accent: 'emerald',
    },
    {
      id: 'sign-dm',
      title: 'DM & RTO Licensing Office',
      subtitle: 'Arms License · Driving License · Helmet',
      x: -92,
      y: 8.6,
      z: 41.2,
      accent: 'sky',
    },
    {
      id: 'sign-court',
      title: 'District & Sessions Court',
      subtitle: 'Walk-In Complex · Bail & Hearings',
      x: -90,
      y: 9.2,
      z: 102.6,
      accent: 'amber',
    },
    {
      id: 'sign-thana',
      title: 'Bharat Police Thana No. 4 & Central Jail',
      subtitle: 'Duty Desk · Lockup · Jail Compound',
      x: -150,
      y: 6.4,
      z: 171.8,
      accent: 'sky',
    },
    {
      id: 'sign-home',
      title: 'Apna Ghar (Family House)',
      subtitle: 'Puja · Bedroom · Wardrobe',
      x: 30,
      y: 6.2,
      z: 102.5,
      accent: 'amber',
    },
  ];
  let shopDealer: ShopDealerInfo | null = null;
  let bankClerk: ShopDealerInfo | null = null;
  let licenseOfficer: ShopDealerInfo | null = null;
  let courtRig!: CourtComplexRig;
  let homeRig!: IndianFamilyHouseRig;

  const staticCityGroup = new THREE.Group();
  scene.add(staticCityGroup);

  // Vast asphalt ground plane (940 x 940)
  roadTex.repeat.set(46, 46);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(940, 940),
    new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.88, metalness: 0.05 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Outer coastal sea barrier beyond playable area (-340..340)
  const ocean = new THREE.Mesh(
    new THREE.RingGeometry(460, 780, 48),
    new THREE.MeshStandardMaterial({ color: 0x0f273d, roughness: 0.25, metalness: 0.4 }),
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.y = -0.15;
  scene.add(ocean);

  // Vast city grid: 11 avenues every 60 units, 100 city blocks
  const roadCenters = [...CITY_ROAD_CENTERS];
  const blockCenters = [...CITY_BLOCK_CENTERS];

  // Instanced dashed yellow road centerlines for high mobile & desktop FPS
  const lineMat = new THREE.MeshStandardMaterial({
    color: 0xd99b26,
    roughness: 0.7,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const dashGeo = new THREE.PlaneGeometry(0.34, 4.6);
  dashGeo.rotateX(-Math.PI / 2);
  const segCountPerRoad = 69; // -335 to +335 step 10
  const totalDashes = roadCenters.length * segCountPerRoad * 2;
  const dashInst = new THREE.InstancedMesh(dashGeo, lineMat, totalDashes);
  const dummy = new THREE.Object3D();
  let dIdx = 0;
  for (const rc of roadCenters) {
    for (let seg = -335; seg <= 335; seg += 10) {
      dummy.position.set(rc, 0.02, seg);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      dashInst.setMatrixAt(dIdx++, dummy.matrix);

      dummy.position.set(seg, 0.02, rc);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.updateMatrix();
      dashInst.setMatrixAt(dIdx++, dummy.matrix);
    }
  }
  dashInst.count = dIdx;
  dashInst.instanceMatrix.needsUpdate = true;
  dashInst.computeBoundingSphere();
  scene.add(dashInst);

  const walkMat = new THREE.MeshStandardMaterial({
    map: walkTex,
    roughness: 0.85,
    metalness: 0.04,
  });

  const roofMat = new THREE.MeshStandardMaterial({ color: 0x2b303a, roughness: 0.9 });
  const gunShopPos = new THREE.Vector3(30, 0, -14);
  const hospitalPos = new THREE.Vector3(-30, 0, 14);
  const bankPos = new THREE.Vector3(-30, 0, -74);
  const licenseOfficePos = new THREE.Vector3(-90, 0, 46);
  const courtExitPos = new THREE.Vector3(-90, 0, 108);
  const mafiaYardPos = new THREE.Vector3(150, 0, -150);

  // Instanced sidewalks across all 100 city blocks (1 draw call instead of 100!)
  const sidewalkInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(42, 0.18, 42),
    walkMat,
    blockCenters.length * blockCenters.length,
  );
  sidewalkInst.receiveShadow = true;
  let swIdx = 0;

  // Shared materials & geometries for commercial shops and residential colonies
  const sharedFacadeMats = facades.map(
    (tex) => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.65, metalness: 0.18 }),
  );
  const sharedBoardGeo = new THREE.BoxGeometry(10.5, 1.65, 0.25);
  const sharedAwnMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.65 });
  const sharedAwnGeo = new THREE.BoxGeometry(11, 0.25, 2.2);
  const sharedPlusMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 0.6,
  });
  const sharedShedMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.55, roughness: 0.45 });
  const sharedShedGeo = new THREE.BoxGeometry(11.4, 0.16, 2.8);

  const colPalettes = [0xe8dcc8, 0xd8c3a5, 0xcbd5c0, 0xe5d1c5];
  const sharedColonyWallMats = colPalettes.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.78 }));
  const sharedBalconyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.65, metalness: 0.2 });
  const sharedTankMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.45, metalness: 0.15 });
  const sharedColonyTrimMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });
  const sharedColonyLawnMat = new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.92 });
  const sharedColonyWingGeos = [
    new THREE.BoxGeometry(18, 10, 12),
    new THREE.BoxGeometry(18, 13.5, 12),
    new THREE.BoxGeometry(18, 17, 12),
  ];
  const sharedGateSignGeo = new THREE.BoxGeometry(7.2, 1.35, 0.22);

  // Batch repeated colony features into 5 InstancedMeshes
  const maxColonies = 72;
  const colBalcInst = new THREE.InstancedMesh(new THREE.BoxGeometry(16, 0.35, 1.8), sharedBalconyMat, maxColonies * 2);
  const colParapetInst = new THREE.InstancedMesh(new THREE.BoxGeometry(18.4, 0.7, 12.4), sharedColonyTrimMat, maxColonies);
  const colTankInst = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.92, 0.92, 1.45, 10), sharedTankMat, maxColonies * 2);
  const colLawnInst = new THREE.InstancedMesh(new THREE.BoxGeometry(28, 0.12, 12), sharedColonyLawnMat, maxColonies);
  const colPostInst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 4.2, 0.7), sharedColonyTrimMat, maxColonies * 2);
  let balcIdx = 0;
  let parIdx = 0;
  let tankIdx = 0;
  let lawnIdx = 0;
  let postIdx = 0;

  let jailRig!: CentralJailRig;

  // Build 100 city blocks
  blockCenters.forEach((bx, bi) => {
    blockCenters.forEach((bz, bj) => {
      dummy.position.set(bx, 0.09, bz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      sidewalkInst.setMatrixAt(swIdx++, dummy.matrix);

      // Block (30, -30) -> Walk-In Gun Armory with Shopkeeper NPC & 4 Display Guns
      if (bx === 30 && bz === -30) {
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x222731, roughness: 0.65, metalness: 0.25 });
        const trimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0x92400e, emissiveIntensity: 0.45 });
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x181d26, roughness: 0.5, metalness: 0.15 });
        const counterMat = new THREE.MeshStandardMaterial({ color: 0x3b2b20, roughness: 0.72 });
        const pedMat = new THREE.MeshStandardMaterial({ color: 0x11151d, roughness: 0.35, metalness: 0.5 });

        // Interior tiled floor (22m wide x 18m deep) centered at (30, -29)
        const shopFloor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.24, 18), floorMat);
        shopFloor.position.set(bx, 0.12, bz + 1);
        shopFloor.receiveShadow = true;
        staticCityGroup.add(shopFloor);

        // Back wall (North, z = -38)
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 6.2, 0.8), wallMat);
        backWall.position.set(bx, 3.1, bz - 8);
        backWall.castShadow = true;
        staticCityGroup.add(backWall);
        colliders.push({ minX: bx - 11, maxX: bx + 11, minZ: bz - 8.4, maxZ: bz - 7.6, height: 6.2 });

        // Left wall (West, x = 19)
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.2, 18), wallMat);
        leftWall.position.set(bx - 10.6, 3.1, bz + 1);
        leftWall.castShadow = true;
        staticCityGroup.add(leftWall);
        colliders.push({ minX: bx - 11, maxX: bx - 10.2, minZ: bz - 8, maxZ: bz + 10, height: 6.2 });

        // Right wall (East, x = 41)
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 6.2, 18), wallMat);
        rightWall.position.set(bx + 10.6, 3.1, bz + 1);
        rightWall.castShadow = true;
        staticCityGroup.add(rightWall);
        colliders.push({ minX: bx + 10.2, maxX: bx + 11, minZ: bz - 8, maxZ: bz + 10, height: 6.2 });

        // Front left & right piers leaving wide 10m open walk-in doorway (x = 25..35)
        const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(6, 6.2, 0.8), wallMat);
        frontLeft.position.set(bx - 8, 3.1, bz + 9.6);
        const frontRight = new THREE.Mesh(new THREE.BoxGeometry(6, 6.2, 0.8), wallMat);
        frontRight.position.set(bx + 8, 3.1, bz + 9.6);
        staticCityGroup.add(frontLeft, frontRight);
        colliders.push({ minX: bx - 11, maxX: bx - 5, minZ: bz + 9.2, maxZ: bz + 10, height: 6.2 });
        colliders.push({ minX: bx + 5, maxX: bx + 11, minZ: bz + 9.2, maxZ: bz + 10, height: 6.2 });

        // Roof & Pankaj Shastra Bhandar Sign over doorway
        const roof = new THREE.Mesh(new THREE.BoxGeometry(23, 0.6, 19), roofMat);
        roof.position.set(bx, 6.4, bz + 1);
        roof.castShadow = true;
        staticCityGroup.add(roof);

        const awning = new THREE.Mesh(new THREE.BoxGeometry(13, 1.3, 1.6), trimMat);
        awning.position.set(bx, 5.1, bz + 10.2);
        staticCityGroup.add(awning);

        const shopSignTex = createStreetCanvasTex('#1c1106', '#f59e0b', 'PANKAJ SHASTRA BHANDAR', 'ARMS · AMMO · ARMOR · MEDKITS');
        const shopSignBoard = new THREE.Mesh(
          new THREE.BoxGeometry(11.5, 2.2, 0.25),
          new THREE.MeshStandardMaterial({
            map: shopSignTex,
            emissiveMap: shopSignTex,
            emissive: 0xffffff,
            emissiveIntensity: 0.45,
            roughness: 0.28,
          }),
        );
        shopSignBoard.position.set(bx, 5.75, bz + 10.45);
        staticCityGroup.add(shopSignBoard);

        interiorLightSpots.push({ x: bx, y: 5.2, z: bz + 1, color: 0xffedd5, intensity: 18, distance: 26 });

        // Entrance glowing ring outside doorway
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(1.5, 2.0, 24),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }),
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(gunShopPos.x, 0.22, gunShopPos.z);
        scene.add(ring);

        // Sales Counter inside (z = -33)
        const counter = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.15, 1.4), counterMat);
        counter.position.set(bx, 0.72, bz - 3);
        counter.castShadow = true;
        scene.add(counter);
        colliders.push({ minX: bx - 4.25, maxX: bx + 4.25, minZ: bz - 3.7, maxZ: bz - 2.3, height: 1.3 });

        // Shopkeeper NPC behind counter facing South (+Z = yaw Math.PI)
        const dealerRig = createHumanoidModel({
          shirtColor: 0x78350f,
          pantsColor: 0x1e293b,
          skinColor: 0xd19a72,
          isPlayer: false,
        });
        const dealerX = bx;
        const dealerZ = bz - 4.8;
        dealerRig.root.position.set(dealerX, 0.18, dealerZ);
        dealerRig.root.rotation.y = Math.PI; // Faces +Z toward doorway & customer
        scene.add(dealerRig.root);

        const dealerHit = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 2.2, 1.4),
          new THREE.MeshBasicMaterial({ visible: false }),
        );
        dealerHit.position.set(dealerX, 1.25, dealerZ);
        dealerHit.userData = { shopAction: 'dealer' };
        scene.add(dealerHit);
        shopDealer = {
          rig: dealerRig,
          hitMesh: dealerHit,
          worldPos: new THREE.Vector3(dealerX, 2.25, dealerZ),
        };

        // 4 Illuminated Display Pedestals with rotating 3D firearms
        const displaySpecs: { weaponId: WeaponId; dx: number; dz: number }[] = [
          { weaponId: 'pistol', dx: -6.8, dz: -1.5 },
          { weaponId: 'smg', dx: -6.8, dz: 3.5 },
          { weaponId: 'shotgun', dx: 6.8, dz: -1.5 },
          { weaponId: 'rifle', dx: 6.8, dz: 3.5 },
        ];

        for (const ds of displaySpecs) {
          const px = bx + ds.dx;
          const pz = bz + ds.dz;

          const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.85, 1.05, 12), pedMat);
          pedestal.position.set(px, 0.68, pz);
          pedestal.castShadow = true;
          scene.add(pedestal);

          const halo = new THREE.Mesh(
            new THREE.RingGeometry(0.55, 0.72, 20),
            new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }),
          );
          halo.rotation.x = -Math.PI / 2;
          halo.position.set(px, 1.22, pz);
          scene.add(halo);

          const gunGroup = createWeaponModel(ds.weaponId);
          gunGroup.scale.setScalar(2.4);
          gunGroup.position.set(px, 1.62, pz);
          gunGroup.rotation.y = Math.PI / 4;
          scene.add(gunGroup);

          const hitMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.7, 1.9, 1.7),
            new THREE.MeshBasicMaterial({ visible: false }),
          );
          hitMesh.position.set(px, 1.35, pz);
          hitMesh.userData = { shopAction: 'gun', weaponId: ds.weaponId };
          scene.add(hitMesh);

          colliders.push({ minX: px - 0.8, maxX: px + 0.8, minZ: pz - 0.8, maxZ: pz + 0.8, height: 1.5 });
          shopDisplays.push({
            weaponId: ds.weaponId,
            gunGroup,
            hitMesh,
            worldPos: new THREE.Vector3(px, 2.35, pz),
          });
        }
        return;
      }

      // Block (-30, 30) -> City Hospital Plaza
      if (bx === -30 && bz === 30) {
        const hospW = 26;
        const hospD = 20;
        const hospH = 14;
        const hosp = new THREE.Mesh(
          new THREE.BoxGeometry(hospW, hospH, hospD),
          new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 }),
        );
        hosp.position.set(bx, hospH / 2 + 0.18, bz + 4);
        hosp.castShadow = true;
        hosp.receiveShadow = true;
        scene.add(hosp);

        // Medical red cross emblem on North wall + high-visibility illuminated signboard
        const crossMat = new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          emissive: 0x991b1b,
          emissiveIntensity: 0.55,
        });
        const cV = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.6, 0.3), crossMat);
        cV.position.set(bx, 7.6, bz - 6.1);
        const cH = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.4, 0.3), crossMat);
        cH.position.set(bx, 7.6, bz - 6.1);
        const hospSignTex = createStreetCanvasTex('#7f1d1d', '#fecaca', 'CITY HOSPITAL', '24×7 EMERGENCY & TRAUMA');
        const hospSignBoard = new THREE.Mesh(
          new THREE.BoxGeometry(15.2, 2.6, 0.35),
          new THREE.MeshStandardMaterial({
            map: hospSignTex,
            emissiveMap: hospSignTex,
            emissive: 0xffffff,
            emissiveIntensity: 0.45,
            roughness: 0.28,
          }),
        );
        hospSignBoard.position.set(bx, 12.2, bz - 6.15);
        hospSignBoard.rotation.y = Math.PI;
        scene.add(cV, cH, hospSignBoard);

        colliders.push({
          minX: bx - hospW / 2,
          maxX: bx + hospW / 2,
          minZ: bz + 4 - hospD / 2,
          maxZ: bz + 4 + hospD / 2,
          height: hospH,
        });
        return;
      }

      // Block (-30, -30) -> Central City Park with trees
      if (bx === -30 && bz === -30) {
        const grass = new THREE.Mesh(
          new THREE.BoxGeometry(36, 0.22, 36),
          new THREE.MeshStandardMaterial({ color: 0x2e4a34, roughness: 0.92 }),
        );
        grass.position.set(bx, 0.14, bz);
        grass.receiveShadow = true;
        scene.add(grass);
        addPalmTree(scene, bx - 10, bz - 10);
        addPalmTree(scene, bx + 10, bz - 10);
        addPalmTree(scene, bx - 10, bz + 10);
        addPalmTree(scene, bx + 10, bz + 10);
        return;
      }

      // Block (-30, -90) -> Extended Real-Style Royal Bank Of India (Marble Portico, Dome, ATM Kiosk & Vault)
      if (bx === -30 && bz === -90) {
        const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.12 });
        const stoneWallMat = new THREE.MeshStandardMaterial({ color: 0xd6d3cd, roughness: 0.52, metalness: 0.08 });
        const bankAccentMat = new THREE.MeshStandardMaterial({ color: 0x0f3b2e, roughness: 0.45, metalness: 0.22 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.22, metalness: 0.88 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.8 });
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x452b1c, roughness: 0.6 });
        const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.88 });

        // Grand raised granite plinth & stepped portico stairs
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(30, 0.34, 24), marbleMat);
        plinth.position.set(bx, 0.17, bz + 1);
        plinth.receiveShadow = true;
        scene.add(plinth);

        const backWall = new THREE.Mesh(new THREE.BoxGeometry(28, 9.2, 0.9), stoneWallMat);
        backWall.position.set(bx, 4.6, bz - 9.5);
        backWall.castShadow = true;
        scene.add(backWall);
        colliders.push({ minX: bx - 14, maxX: bx + 14, minZ: bz - 10, maxZ: bz - 9.0, height: 9.2 });

        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.9, 9.2, 21), stoneWallMat);
        leftWall.position.set(bx - 13.5, 4.6, bz + 1);
        leftWall.castShadow = true;
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.9, 9.2, 21), stoneWallMat);
        rightWall.position.set(bx + 13.5, 4.6, bz + 1);
        rightWall.castShadow = true;
        scene.add(leftWall, rightWall);
        colliders.push({ minX: bx - 14, maxX: bx - 13.0, minZ: bz - 9.5, maxZ: bz + 11.5, height: 9.2 });
        colliders.push({ minX: bx + 13.0, maxX: bx + 14, minZ: bz - 9.5, maxZ: bz + 11.5, height: 9.2 });

        // Side architectural glass windows
        [-13.95, 13.95].forEach((wx) => {
          [-5, 0, 5].forEach((wzOff) => {
            const win = new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.2, 3.0), glassMat);
            win.position.set(bx + wx, 4.8, bz + wzOff);
            scene.add(win);
          });
        });

        // Front stone wings leaving grand 11m colonnaded doorway
        const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(8.5, 9.2, 0.9), stoneWallMat);
        frontLeft.position.set(bx - 9.75, 4.6, bz + 11.2);
        const frontRight = new THREE.Mesh(new THREE.BoxGeometry(8.5, 9.2, 0.9), stoneWallMat);
        frontRight.position.set(bx + 9.75, 4.6, bz + 11.2);
        const frontHeader = new THREE.Mesh(new THREE.BoxGeometry(28, 2.4, 1.0), bankAccentMat);
        frontHeader.position.set(bx, 8.2, bz + 11.2);
        scene.add(frontLeft, frontRight, frontHeader);
        colliders.push({ minX: bx - 14, maxX: bx - 5.5, minZ: bz + 10.7, maxZ: bz + 11.7, height: 9.2 });
        colliders.push({ minX: bx + 5.5, maxX: bx + 14, minZ: bz + 10.7, maxZ: bz + 11.7, height: 9.2 });

        // 6 Fluted Classical Front Portico Columns
        [-11.5, -8.0, -4.6, 4.6, 8.0, 11.5].forEach((px) => {
          const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 1.1), marbleMat);
          base.position.set(bx + px, 0.5, bz + 12.6);
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 7.6, 12), marbleMat);
          col.position.set(bx + px, 4.3, bz + 12.6);
          col.castShadow = true;
          const cap = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.35, 1.05), goldMat);
          cap.position.set(bx + px, 8.2, bz + 12.6);
          scene.add(base, col, cap);
        });

        // Portico Roof Cornice + Central Bank Dome Cupola
        const bankRoof = new THREE.Mesh(new THREE.BoxGeometry(30.5, 0.9, 25.5), bankAccentMat);
        bankRoof.position.set(bx, 9.55, bz + 2);
        bankRoof.castShadow = true;
        scene.add(bankRoof);

        const domeDrum = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 1.8, 16), stoneWallMat);
        domeDrum.position.set(bx, 10.8, bz + 1);
        const domeCap = new THREE.Mesh(
          new THREE.SphereGeometry(4.3, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
          goldMat,
        );
        domeCap.position.set(bx, 11.7, bz + 1);
        const domeFinial = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.8, 8), goldMat);
        domeFinial.position.set(bx, 16.6, bz + 1);
        scene.add(domeDrum, domeCap, domeFinial);

        // Large "ROYAL BANK OF INDIA" exterior signboards
        const signTex = createBankSignTexture();
        const signBoard = new THREE.Mesh(
          new THREE.BoxGeometry(16, 2.8, 0.45),
          new THREE.MeshStandardMaterial({
            map: signTex,
            emissiveMap: signTex,
            emissive: 0xffffff,
            emissiveIntensity: 0.42,
            roughness: 0.28,
          }),
        );
        signBoard.position.set(bx, 8.1, bz + 13.2);
        scene.add(signBoard);

        // 24x7 Interactive ATM Kiosk Out Front (West Pillar Bay)
        const bankAtmHit = addAtmKiosk(
          scene,
          colliders,
          bx - 11.2,
          bz + 15.2,
          0,
          'atm-bank',
          'Royal Bank Plaza 24×7 ATM',
        );
        atms.push({
          id: 'atm-bank',
          name: 'Royal Bank Plaza 24×7 ATM',
          x: bx - 11.2,
          z: bz + 15.2,
          approachX: bx - 11.2,
          approachZ: bz + 18.0,
          hitMesh: bankAtmHit,
        });

        // Steel Bank Vault Door visible on interior back wall
        const vaultFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.2, 0.5), steelMat);
        vaultFrame.position.set(bx + 7.2, 2.5, bz - 8.8);
        const vaultDoor = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.4, 18), steelMat);
        vaultDoor.rotation.x = Math.PI / 2;
        vaultDoor.position.set(bx + 7.2, 2.5, bz - 8.5);
        const vaultWheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 8, 16), goldMat);
        vaultWheel.position.set(bx + 7.2, 2.5, bz - 8.25);
        scene.add(vaultFrame, vaultDoor, vaultWheel);

        interiorLightSpots.push({ x: bx, y: 7.6, z: bz + 1, color: 0xfef3c7, intensity: 24, distance: 30 });

        // Entrance glowing cyan/gold marker at (-30, -74)
        const bankRing = new THREE.Mesh(
          new THREE.RingGeometry(1.5, 2.05, 24),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }),
        );
        bankRing.rotation.x = -Math.PI / 2;
        bankRing.position.set(bankPos.x, 0.24, bankPos.z);
        scene.add(bankRing);

        // Long Marble Teller Counter + Brass Rails + Senior Bank Manager NPC
        const desk = new THREE.Mesh(new THREE.BoxGeometry(11.5, 1.2, 1.5), deskMat);
        desk.position.set(bx - 1.5, 0.85, bz - 2.8);
        const deskTop = new THREE.Mesh(new THREE.BoxGeometry(11.7, 0.14, 1.7), marbleMat);
        deskTop.position.set(bx - 1.5, 1.5, bz - 2.8);
        scene.add(desk, deskTop);
        colliders.push({ minX: bx - 7.3, maxX: bx + 4.3, minZ: bz - 3.6, maxZ: bz - 2.0, height: 1.5 });

        const clerkRig = createHumanoidModel({
          shirtColor: 0x064e3b,
          pantsColor: 0x0f172a,
          skinColor: 0xc98b63,
        });
        const clerkX = bx - 1.5;
        const clerkZ = bz - 4.7;
        clerkRig.root.position.set(clerkX, 0.25, clerkZ);
        clerkRig.root.rotation.y = Math.PI;
        scene.add(clerkRig.root);

        const clerkHit = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 2.4, 1.8),
          new THREE.MeshBasicMaterial({ visible: false }),
        );
        clerkHit.position.set(clerkX, 1.35, clerkZ);
        clerkHit.userData = { shopAction: 'banker' };
        scene.add(clerkHit);
        bankClerk = {
          rig: clerkRig,
          hitMesh: clerkHit,
          worldPos: new THREE.Vector3(clerkX, 2.4, clerkZ),
        };
        return;
      }

      // Block (30, 30) -> Shree Ram Mandir (Nagara Shikhara Temple depicting Lord Ram)
      if (bx === 30 && bz === 30) {
        addHinduTemple(scene, colliders, interiorLightSpots, bx, bz, 'ram_mandir');
        sacredPlaces.push({
          id: 'ram-mandir',
          name: 'Shree Ram Mandir',
          kind: 'ram_mandir',
          x: bx - 11,
          z: bz,
        });
        return;
      }

      // Block (90, -30) -> Shree Krishna Mandir (Temple depicting Lord Krishna)
      if (bx === 90 && bz === -30) {
        addHinduTemple(scene, colliders, interiorLightSpots, bx, bz, 'krishna_mandir');
        sacredPlaces.push({
          id: 'krishna-mandir',
          name: 'Shree Krishna Mandir',
          kind: 'krishna_mandir',
          x: bx,
          z: bz + 12,
        });
        return;
      }

      // Block (-90, -30) -> Noor Masjid (Mosque with Onion Dome & Twin Minarets)
      if (bx === -90 && bz === -30) {
        addMosqueLandmark(scene, colliders, interiorLightSpots, bx, bz);
        sacredPlaces.push({
          id: 'noor-masjid',
          name: 'Noor Masjid',
          kind: 'mosque',
          x: bx,
          z: bz + 12,
        });
        return;
      }

      // Block (-90, 30) -> District Magistrate & Arms Licensing Office + Verification Shooting Range
      if (bx === -90 && bz === 30) {
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2dfd7, roughness: 0.55 });
        const navyTrimMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.45, metalness: 0.2 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.28, metalness: 0.78 });
        const floorMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.45 });
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x452b1c, roughness: 0.65 });

        const plinth = new THREE.Mesh(new THREE.BoxGeometry(24, 0.3, 22), floorMat);
        plinth.position.set(bx - 2, 0.15, bz + 1);
        plinth.receiveShadow = true;
        scene.add(plinth);

        const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 7.6, 0.85), stoneMat);
        backWall.position.set(bx - 2, 3.8, bz - 9);
        backWall.castShadow = true;
        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.85, 7.6, 20), stoneMat);
        leftWall.position.set(bx - 12.6, 3.8, bz + 1);
        leftWall.castShadow = true;
        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.85, 7.6, 20), stoneMat);
        rightWall.position.set(bx + 8.6, 3.8, bz + 1);
        rightWall.castShadow = true;
        scene.add(backWall, leftWall, rightWall);
        colliders.push({ minX: bx - 13, maxX: bx + 9, minZ: bz - 9.45, maxZ: bz - 8.55, height: 7.6 });
        colliders.push({ minX: bx - 13, maxX: bx - 12.15, minZ: bz - 9, maxZ: bz + 11, height: 7.6 });
        colliders.push({ minX: bx + 8.15, maxX: bx + 9, minZ: bz - 9, maxZ: bz + 11, height: 7.6 });

        const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(6.5, 7.6, 0.85), stoneMat);
        frontLeft.position.set(bx - 9.75, 3.8, bz + 10.6);
        const frontRight = new THREE.Mesh(new THREE.BoxGeometry(6.5, 7.6, 0.85), stoneMat);
        frontRight.position.set(bx + 5.75, 3.8, bz + 10.6);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(24, 0.8, 22), navyTrimMat);
        roof.position.set(bx - 2, 7.9, bz + 1);
        roof.castShadow = true;
        scene.add(frontLeft, frontRight, roof);
        colliders.push({ minX: bx - 13, maxX: bx - 6.5, minZ: bz + 10.15, maxZ: bz + 11.05, height: 7.6 });
        colliders.push({ minX: bx + 2.5, maxX: bx + 9, minZ: bz + 10.15, maxZ: bz + 11.05, height: 7.6 });

        // Signboard over portico
        const dmSignTex = createStreetCanvasTex(
          '#0f2447',
          '#fbbf24',
          'DISTRICT MAGISTRATE',
          'ARMS & DRIVING OFFICE',
        );
        const dmBoard = new THREE.Mesh(
          new THREE.BoxGeometry(14.5, 2.3, 0.35),
          new THREE.MeshStandardMaterial({
            map: dmSignTex,
            emissiveMap: dmSignTex,
            emissive: 0xffffff,
            emissiveIntensity: 0.44,
            roughness: 0.28,
          }),
        );
        dmBoard.position.set(bx - 2, 6.7, bz + 11.1);
        scene.add(dmBoard);

        // Pillars & Entrance Beacon Ring
        [-5.2, 1.2].forEach((pxOff) => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 6.8, 10), stoneMat);
          col.position.set(bx + pxOff, 3.6, bz + 11.6);
          scene.add(col);
        });
        const dmRing = new THREE.Mesh(
          new THREE.RingGeometry(1.5, 2.0, 24),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }),
        );
        dmRing.rotation.x = -Math.PI / 2;
        dmRing.position.set(licenseOfficePos.x, 0.24, licenseOfficePos.z);
        scene.add(dmRing);

        // Licensing Desk & Magistrate Clerk NPC
        const desk = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.15, 1.4), deskMat);
        desk.position.set(bx - 2, 0.72, bz - 2.5);
        scene.add(desk);
        colliders.push({ minX: bx - 6.25, maxX: bx + 2.25, minZ: bz - 3.2, maxZ: bz - 1.8, height: 1.3 });

        const officerRig = createHumanoidModel({
          shirtColor: 0x1e293b,
          pantsColor: 0x0f172a,
          skinColor: 0xd19a72,
        });
        const offX = bx - 2;
        const offZ = bz - 4.4;
        officerRig.root.position.set(offX, 0.2, offZ);
        officerRig.root.rotation.y = Math.PI;
        scene.add(officerRig.root);

        const offHit = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 2.4, 1.8),
          new THREE.MeshBasicMaterial({ visible: false }),
        );
        offHit.position.set(offX, 1.3, offZ);
        offHit.userData = { shopAction: 'license_officer' };
        scene.add(offHit);
        licenseOfficer = {
          rig: officerRig,
          hitMesh: offHit,
          worldPos: new THREE.Vector3(offX, 2.3, offZ),
        };

        // Adjacent Target Range Practice Stands on East Yard Wing (bx + 14)
        const targetMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
        const bullMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });
        const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 });
        [-4, 0, 4].forEach((tzOff) => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.5, 0.16), standMat);
          post.position.set(bx + 15.5, 0.9, bz + tzOff);
          const board = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 0.9), targetMat);
          board.position.set(bx + 15.5, 1.65, bz + tzOff);
          const bull = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12), bullMat);
          bull.rotation.z = Math.PI / 2;
          bull.position.set(bx + 15.48, 1.65, bz + tzOff);
          scene.add(post, board, bull);
        });
        interiorLightSpots.push({ x: bx - 2, y: 6.2, z: bz + 1, color: 0xfef3c7, intensity: 18, distance: 24 });
        const crest = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.16, 16), goldMat);
        crest.rotation.x = Math.PI / 2;
        crest.position.set(bx - 2, 8.6, bz + 11.2);
        staticCityGroup.add(crest);
        return;
      }

      // Block (-90, 90) -> Enterable Bustling District & Sessions Court Complex
      if (bx === -90 && bz === 90) {
        courtRig = addDistrictCourtExterior(scene, colliders, interiorLightSpots, bx, bz);
        return;
      }

      // Block (-150, 150) -> Enterable Bharat Police Thana attached to Central Jail Compound
      if (bx === -150 && bz === 150) {
        jailRig = addCentralJailCompound(scene, colliders, interiorLightSpots, bx, bz);
        return;
      }

      // Block (150, -150) -> Dog Mafia Compound Yard (open rescue arena)
      if (bx === 150 && bz === -150) {
        const yardMat = new THREE.MeshStandardMaterial({ color: 0x3b352d, roughness: 0.92 });
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x7c5333, roughness: 0.85 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.55, metalness: 0.5 });

        const yardPad = new THREE.Mesh(new THREE.BoxGeometry(38, 0.22, 38), yardMat);
        yardPad.position.set(bx, 0.11, bz);
        yardPad.receiveShadow = true;
        scene.add(yardPad);

        // Open-sided warehouse canopy at north edge of yard
        const canopy = new THREE.Mesh(new THREE.BoxGeometry(22, 0.5, 10), metalMat);
        canopy.position.set(bx, 5.4, bz - 12);
        canopy.castShadow = true;
        scene.add(canopy);
        [-9.5, 9.5].forEach((px) => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5.4, 0.6), metalMat);
          post.position.set(bx + px, 2.7, bz - 15.5);
          scene.add(post);
        });

        // Perimeter cover crates (leaving wide open driving/combat center)
        const crateSpots: [number, number, number][] = [
          [bx - 14, bz - 8, 2.2],
          [bx + 14, bz - 6, 2.2],
          [bx - 13, bz + 10, 2.0],
          [bx + 13, bz + 11, 2.0],
        ];
        for (const [cx, cz, sz] of crateSpots) {
          const crate = new THREE.Mesh(new THREE.BoxGeometry(sz, sz, sz), crateMat);
          crate.position.set(cx, sz / 2 + 0.18, cz);
          crate.castShadow = true;
          scene.add(crate);
          colliders.push({
            minX: cx - sz / 2,
            maxX: cx + sz / 2,
            minZ: cz - sz / 2,
            maxZ: cz + sz / 2,
            height: sz,
          });
        }
        return;
      }

      // Block (30, 90) -> Personal Enterable Indian Family House (Home Base & Initial Spawn)
      if (bx === 30 && bz === 90) {
        homeRig = addIndianFamilyHouse(scene, colliders, interiorLightSpots, bx, bz);
        return;
      }

      // Shared materials & coordinates for instanced street trees & streetlamps
      const blockHash = Math.abs(bi * 17 + bj * 31);
      const isColonyBlock = Math.abs(bx) >= 150 || Math.abs(bz) >= 150;

      if (isColonyBlock) {
        // Outer Residential Colony Block: shared materials & batched InstancedMesh sub-parts
        const colonyNames = [
          'AZAD NAGAR COLONY',
          'SHANTI VIHAR',
          'PATEL ENCLAVE',
          'GANGA VIHAR',
          'LAKSHMI NAGAR',
          'ASHOK VATIKA',
        ];
        const aptMat = sharedColonyWallMats[blockHash % sharedColonyWallMats.length];
        const hIdx = blockHash % 3;
        const bW = 18;
        const bD = 12;
        const bH = 10 + hIdx * 3.5;

        const wingA = new THREE.Mesh(sharedColonyWingGeos[hIdx], aptMat);
        wingA.position.set(bx, bH / 2 + 0.18, bz - 6.5);
        wingA.castShadow = true;
        wingA.receiveShadow = true;
        staticCityGroup.add(wingA);
        colliders.push({ minX: bx - bW / 2, maxX: bx + bW / 2, minZ: bz - 6.5 - bD / 2, maxZ: bz - 6.5 + bD / 2, height: bH });

        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);

        for (let fl = 1; fl <= 2; fl++) {
          dummy.position.set(bx, fl * 3.6, bz - 6.5 + bD / 2 + 0.9);
          dummy.updateMatrix();
          colBalcInst.setMatrixAt(balcIdx++, dummy.matrix);
        }
        dummy.position.set(bx, bH + 0.45, bz - 6.5);
        dummy.updateMatrix();
        colParapetInst.setMatrixAt(parIdx++, dummy.matrix);

        dummy.position.set(bx - 5.5, bH + 1.45, bz - 7.5);
        dummy.updateMatrix();
        colTankInst.setMatrixAt(tankIdx++, dummy.matrix);

        dummy.position.set(bx + 5.5, bH + 1.4, bz - 7.5);
        dummy.updateMatrix();
        colTankInst.setMatrixAt(tankIdx++, dummy.matrix);

        dummy.position.set(bx, 0.24, bz + 9);
        dummy.updateMatrix();
        colLawnInst.setMatrixAt(lawnIdx++, dummy.matrix);

        // Colony nameplate
        const gateBoardTex = createStreetCanvasTex(
          '#1e3a8a',
          '#fbbf24',
          colonyNames[blockHash % colonyNames.length],
          'RESIDENTIAL COLONY',
        );
        const gateSign = new THREE.Mesh(
          sharedGateSignGeo,
          new THREE.MeshStandardMaterial({ map: gateBoardTex, roughness: 0.38 }),
        );
        gateSign.position.set(bx, 3.8, bz + 16.5);
        staticCityGroup.add(gateSign);
        [-3.9, 3.9].forEach((px) => {
          dummy.position.set(bx + px, 2.2, bz + 16.5);
          dummy.updateMatrix();
          colPostInst.setMatrixAt(postIdx++, dummy.matrix);
          colliders.push({ minX: bx + px - 0.35, maxX: bx + px + 0.35, minZ: bz + 16.15, maxZ: bz + 16.85, height: 4.2 });
        });
        return;
      }

      // Mid & Inner Commercial Blocks: shared facade materials & shopfront geometries
      const seed = (bi * 7 + bj * 13) % 3;
      const bW = 24 + ((bi + bj) % 2) * 3;
      const bD = 24 + ((bi * 3 + bj) % 2) * 3;
      const bH = 13 + ((bi * 5 + bj * 9) % 4) * 6;

      const facadeMat = sharedFacadeMats[seed];
      const building = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), [
        facadeMat,
        facadeMat,
        roofMat,
        roofMat,
        facadeMat,
        facadeMat,
      ]);
      building.position.set(bx, bH / 2 + 0.18, bz);
      building.castShadow = true;
      building.receiveShadow = true;
      staticCityGroup.add(building);

      colliders.push({
        minX: bx - bW / 2,
        maxX: bx + bW / 2,
        minZ: bz - bD / 2,
        maxZ: bz + bD / 2,
        height: bH,
      });

      // Hand-painted ground-floor Indian street shopfronts facing South (+Z sidewalk)
      const shopKindIdx = blockHash % 5;
      const signZ = bz + bD / 2 + 0.35;
      if (shopKindIdx === 0) {
        const kTex = createStreetCanvasTex('#991b1b', '#fde047', 'GUPTA KIRANA STORE', 'RASHAN · ATTA · DAL · COLD DRINK');
        const board = new THREE.Mesh(
          sharedBoardGeo,
          new THREE.MeshStandardMaterial({ map: kTex, roughness: 0.35 }),
        );
        board.position.set(bx, 4.1, signZ);
        const awning = new THREE.Mesh(sharedAwnGeo, sharedAwnMat);
        awning.position.set(bx, 3.1, signZ + 0.9);
        awning.rotation.x = 0.15;
        staticCityGroup.add(board, awning);
      } else if (shopKindIdx === 1) {
        const mTex = createStreetCanvasTex('#065f46', '#ffffff', 'LAXMI MEDICAL & DAWAI', '+ 24×7 CHEMIST & PHARMACY +');
        const board = new THREE.Mesh(
          sharedBoardGeo,
          new THREE.MeshStandardMaterial({ map: mTex, roughness: 0.32 }),
        );
        board.position.set(bx, 4.1, signZ);
        const pV = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.2, 0.16), sharedPlusMat);
        pV.position.set(bx - 6.1, 4.1, signZ);
        const pH = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.42, 0.16), sharedPlusMat);
        pH.position.set(bx - 6.1, 4.1, signZ);
        staticCityGroup.add(board, pV, pH);
      } else if (shopKindIdx === 2) {
        const dTex = createStreetCanvasTex('#7c2d12', '#fbbf24', 'SHER-E-PUNJAB DHABA', 'TANDOORI ROTI · DAL MAKHANI · CHAI');
        const board = new THREE.Mesh(
          sharedBoardGeo,
          new THREE.MeshStandardMaterial({ map: dTex, roughness: 0.35 }),
        );
        board.position.set(bx, 4.1, signZ);
        const shed = new THREE.Mesh(sharedShedGeo, sharedShedMat);
        shed.position.set(bx, 3.05, signZ + 1.2);
        shed.rotation.x = 0.12;
        staticCityGroup.add(board, shed);
      } else if (shopKindIdx === 3) {
        const sTex = createStreetCanvasTex('#1e3a8a', '#f8fafc', 'BHARAT ELECTRONICS', 'MOBILE · REPAIR · RECHARGE');
        const board = new THREE.Mesh(
          sharedBoardGeo,
          new THREE.MeshStandardMaterial({ map: sTex, roughness: 0.35 }),
        );
        board.position.set(bx, 4.1, signZ);
        staticCityGroup.add(board);
      } else {
        const bTex = createStreetCanvasTex('#581c87', '#fde047', 'ROYAL MITHAI BHANDAR', 'JALEBI · SAMOSA · KAJU KATLI');
        const board = new THREE.Mesh(
          sharedBoardGeo,
          new THREE.MeshStandardMaterial({ map: bTex, roughness: 0.35 }),
        );
        board.position.set(bx, 4.1, signZ);
        staticCityGroup.add(board);
      }
    });
  });

  // Finalize batched sidewalk & residential colony InstancedMeshes
  sidewalkInst.count = swIdx;
  sidewalkInst.instanceMatrix.needsUpdate = true;
  sidewalkInst.computeBoundingSphere();
  staticCityGroup.add(sidewalkInst);

  const finalizeInst = (inst: THREE.InstancedMesh, count: number) => {
    inst.count = count;
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    staticCityGroup.add(inst);
  };
  finalizeInst(colBalcInst, balcIdx);
  finalizeInst(colParapetInst, parIdx);
  finalizeInst(colTankInst, tankIdx);
  finalizeInst(colLawnInst, lawnIdx);
  finalizeInst(colPostInst, postIdx);

  // 9 Monumental Indian Chowks (Roundabouts) with Stone Plinths, Greenery & Circular Colliders
  const chowkStoneMat = new THREE.MeshStandardMaterial({ color: 0xd6d3cd, roughness: 0.55 });
  const chowkLawnMat = new THREE.MeshStandardMaterial({ color: 0x355e3b, roughness: 0.88 });
  const chowkGoldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.82, roughness: 0.25 });
  const chowkSaffronMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.5 });

  for (const ch of CHOWK_ROUNDABOUTS) {
    const cg = new THREE.Group();
    cg.position.set(ch.x, 0, ch.z);
    const r = ch.radius;

    const curb = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.25, 0.44, 24), chowkStoneMat);
    curb.position.y = 0.22;
    curb.receiveShadow = true;
    curb.castShadow = true;
    cg.add(curb);

    const lawn = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.86, r * 0.86, 0.14, 24), chowkLawnMat);
    lawn.position.y = 0.48;
    cg.add(lawn);

    const ped = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.34, r * 0.42, 1.4, 16), chowkStoneMat);
    ped.position.y = 1.2;
    ped.castShadow = true;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, ch.radius > 3 ? 3.2 : 2.4, 12), chowkStoneMat);
    pillar.position.y = ch.radius > 3 ? 3.4 : 2.9;
    const capital = new THREE.Mesh(new THREE.SphereGeometry(ch.radius > 3 ? 0.52 : 0.4, 12, 10), chowkGoldMat);
    capital.position.y = ch.radius > 3 ? 5.2 : 4.3;
    const ringBand = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.44, r * 0.44, 0.22, 16), chowkSaffronMat);
    ringBand.position.y = 1.85;
    cg.add(ped, pillar, capital, ringBand);

    scene.add(cg);
    circleColliders.push({
      x: ch.x,
      z: ch.z,
      radius: ch.radius + 0.18,
      height: 5.0,
    });
  }

  // Authentic Indian Street Food & Tea Stalls (Interactable!)
  const stallSpecs: {
    id: string;
    name: string;
    kind: 'chai' | 'golgappa' | 'chaat';
    vendorName: string;
    x: number;
    z: number;
    approachX: number;
    approachZ: number;
    rotY: number;
  }[] = [
    { id: 'chai-chowk', name: 'Sharma Chai Tapri', kind: 'chai', vendorName: 'Bittu Chaiwala', x: 13.5, z: 13.5, approachX: 10.2, approachZ: 13.5, rotY: -Math.PI / 2 },
    { id: 'chai-park', name: 'Raju Chai Stall', kind: 'chai', vendorName: 'Raju Chaiwala', x: -13.5, z: -13.5, approachX: -10.2, approachZ: -13.5, rotY: Math.PI / 2 },
    { id: 'chai-armory', name: 'Pankaj Chowk Chai Tapri', kind: 'chai', vendorName: 'Monu Chaiwala', x: 46.5, z: -13.5, approachX: 46.5, approachZ: -10.2, rotY: 0 },
    { id: 'chai-bank', name: 'Bank Wali Chai Tapri', kind: 'chai', vendorName: 'Harish Chaiwala', x: -13.5, z: -72, approachX: -10.2, approachZ: -72, rotY: Math.PI / 2 },
    { id: 'golgappa-chowk', name: 'Gupta Golgappa Bhandar', kind: 'golgappa', vendorName: 'Chamanlal Gupta', x: -13.5, z: 14.5, approachX: -10.2, approachZ: 14.5, rotY: Math.PI / 2 },
    { id: 'golgappa-mandir', name: 'Banaras Pani Puri Stall', kind: 'golgappa', vendorName: 'Bablu Pani Puri', x: 13.5, z: 24, approachX: 10.2, approachZ: 24, rotY: -Math.PI / 2 },
    { id: 'golgappa-masjid', name: 'Noor Bazaar Golgappa', kind: 'golgappa', vendorName: 'Imran Bhai Chaat', x: -73, z: -13.5, approachX: -73, approachZ: -10.2, rotY: 0 },
    { id: 'chaat-samosa', name: 'Bittu Garam Samosa & Lassi', kind: 'chaat', vendorName: 'Kailash Halwai', x: 13.5, z: -13.5, approachX: 10.2, approachZ: -13.5, rotY: -Math.PI / 2 },
    { id: 'chaat-krishna', name: 'Vrindavan Lassi & Tikki', kind: 'chaat', vendorName: 'Gopal Chaat', x: 73, z: -13.5, approachX: 73, approachZ: -10.2, rotY: 0 },
    { id: 'dhaba-ganga', name: 'Ganga Highway Dhaba', kind: 'chaat', vendorName: 'Sardar Harpreet', x: -133.5, z: 14, approachX: -130.2, approachZ: 14, rotY: -Math.PI / 2 },
    { id: 'chai-azad', name: 'Azad Nagar Chai Corner', kind: 'chai', vendorName: 'Pappu Chaiwala', x: -194, z: 13.5, approachX: -194, approachZ: 10.2, rotY: Math.PI },
  ];

  for (const ts of stallSpecs) {
    const hitMesh =
      ts.kind === 'chai'
        ? addChaiTapri(scene, colliders, ts.x, ts.z, ts.rotY, ts.name, ts.id)
        : addGolgappaStall(scene, colliders, ts.x, ts.z, ts.rotY, ts.name, ts.id, ts.kind);
    chaiStalls.push({
      id: ts.id,
      name: ts.name,
      kind: ts.kind,
      vendorName: ts.vendorName,
      x: ts.x,
      z: ts.z,
      approachX: ts.approachX,
      approachZ: ts.approachZ,
      hitMesh,
    });
  }

  // 7 Interactive Street ATM Kiosks across city neighborhoods (plus Royal Bank Plaza ATM = 8 total)
  const streetAtmSpecs: {
    id: string;
    name: string;
    x: number;
    z: number;
    approachX: number;
    approachZ: number;
    rotY: number;
  }[] = [
    { id: 'atm-park', name: 'Central Park 24×7 ATM', x: -13.5, z: -22.5, approachX: -10.8, approachZ: -22.5, rotY: Math.PI / 2 },
    { id: 'atm-hospital', name: 'City Hospital ATM', x: -13.5, z: 24.5, approachX: -10.8, approachZ: 24.5, rotY: Math.PI / 2 },
    { id: 'atm-armory', name: 'Pankaj Chowk ATM', x: 13.5, z: -24.5, approachX: 10.8, approachZ: -24.5, rotY: -Math.PI / 2 },
    { id: 'atm-mandir', name: 'Ram Mandir Marg ATM', x: 45, z: 13.5, approachX: 45, approachZ: 10.8, rotY: Math.PI },
    { id: 'atm-masjid', name: 'Noor Bazaar ATM', x: -82, z: -13.5, approachX: -82, approachZ: -10.8, rotY: 0 },
    { id: 'atm-laxmi', name: 'Laxmi Bazaar 24×7 ATM', x: 90, z: 46, approachX: 90, approachZ: 48.8, rotY: 0 },
    { id: 'atm-azad', name: 'Azad Nagar Colony ATM', x: -210, z: 13.5, approachX: -210, approachZ: 10.8, rotY: Math.PI },
  ];
  for (const spec of streetAtmSpecs) {
    const hitMesh = addAtmKiosk(scene, colliders, spec.x, spec.z, spec.rotY, spec.id, spec.name);
    atms.push({
      id: spec.id,
      name: spec.name,
      x: spec.x,
      z: spec.z,
      approachX: spec.approachX,
      approachZ: spec.approachZ,
      hitMesh,
    });
  }

  // Dedicated Auto-Rickshaw Stand Bay safely parked off Central Intersection at (7.5, 14.0)
  addAutoStandBay(scene, 7.5, 14.0);

  // Roadside Fruit / Chaat Thela Carts
  const thelaSpots: [number, number, number, number][] = [
    [-46, 13, Math.PI / 2, 0x059669],
    [46, 46, -Math.PI / 2, 0x2563eb],
    [106, -46, Math.PI, 0xea580c],
    [-166, -13, 0, 0x059669],
  ];
  for (const [tx, tz, ry, shadeColor] of thelaSpots) {
    addVendorThela(scene, colliders, tx, tz, ry, shadeColor);
  }

  // Indian Street Name Signboards at Central, Chowk & Outer Colony Intersections
  const streetSigns: [number, number, string, number][] = [
    [9.8, 9.8, 'BHARAT CHOWK', 0],
    [-9.8, -9.8, 'M.G. MARG', Math.PI / 4],
    [10, -50, 'PANKAJ SHASTRA BHANDAR', 0],
    [-10, -50, 'ROYAL BANK MARG', 0],
    [50, 10, 'RAM MANDIR MARG', -Math.PI / 2],
    [-70, -10, 'NOOR MASJID ROAD', Math.PI / 2],
    [70, -10, 'KRISHNA MANDIR ROAD', -Math.PI / 2],
    [-131, 11, 'AZAD CHOWK · DHABA', 0],
    [131, 11, 'SUBHASH CHOWK', 0],
    [-190, 11, 'AZAD NAGAR COLONY', 0],
    [190, -11, 'SHANTI VIHAR COLONY', Math.PI],
  ];
  for (const [sx, sz, label, ry] of streetSigns) {
    addStreetSign(scene, sx, sz, label, ry);
  }

  // Functional 3D Traffic Lights + Stop Lines across Signalized Intersections (keeping outer chowks open roundabouts)
  const signalCoords: { id: string; x: number; z: number; offset: number }[] = [
    { id: 'sig-center', x: 0, z: 0, offset: 0 },
    { id: 'sig-west', x: -60, z: 0, offset: 6 },
    { id: 'sig-east', x: 60, z: 0, offset: 12 },
    { id: 'sig-north', x: 0, z: -60, offset: 9 },
    { id: 'sig-south', x: 0, z: 60, offset: 3 },
    { id: 'sig-nw', x: -60, z: -60, offset: 4 },
    { id: 'sig-ne', x: 60, z: -60, offset: 14 },
    { id: 'sig-sw', x: -60, z: 60, offset: 16 },
    { id: 'sig-se', x: 60, z: 60, offset: 8 },
    { id: 'sig-far-w', x: -180, z: 0, offset: 5 },
    { id: 'sig-far-e', x: 180, z: 0, offset: 15 },
    { id: 'sig-far-n', x: 0, z: -180, offset: 10 },
    { id: 'sig-far-s', x: 0, z: 180, offset: 2 },
  ];
  const trafficSignals: TrafficSignalRig[] = signalCoords.map((sc) =>
    addTrafficIntersectionSignal(scene, colliders, sc.id, sc.x, sc.z, sc.offset),
  );

  // Instanced Warm Streetlamp Poles & Bulbs across the expanded 11x11 city
  const lampBulbMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.2,
    roughness: 0.2,
  });
  nightEmissiveMats.push(lampBulbMat);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.35 });

  const lampSpots: [number, number][] = [];
  for (const bx of blockCenters) {
    for (const bz of blockCenters) {
      if (Math.abs(bx) <= 210 && Math.abs(bz) <= 210) {
        lampSpots.push([bx - 19.5, bz + 19.5]);
      }
    }
  }
  const mastGeo = new THREE.CylinderGeometry(0.08, 0.11, 5.6, 6);
  const bulbGeo = new THREE.SphereGeometry(0.24, 8, 8);
  const mastInst = new THREE.InstancedMesh(mastGeo, poleMat, lampSpots.length);
  const bulbInst = new THREE.InstancedMesh(bulbGeo, lampBulbMat, lampSpots.length);
  lampSpots.forEach(([lx, lz], idx) => {
    dummy.position.set(lx, 2.98, lz);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    mastInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(lx, 5.93, lz);
    dummy.updateMatrix();
    bulbInst.setMatrixAt(idx, dummy.matrix);
  });
  mastInst.instanceMatrix.needsUpdate = true;
  mastInst.computeBoundingSphere();
  bulbInst.instanceMatrix.needsUpdate = true;
  bulbInst.computeBoundingSphere();
  scene.add(mastInst, bulbInst);

  // Instanced Roadside Neem/Gulmohar Trees across city blocks for lush Indian avenue silhouette
  const treeSpots: [number, number][] = [];
  for (const bx of blockCenters) {
    for (const bz of blockCenters) {
      if (bx === -30 && bz === -30) continue; // Park already has palms
      if (bx === 150 && bz === -150) continue; // Mafia compound clear
      if (bx === 30 && bz === 90) continue; // Personal Indian Family House clear
      treeSpots.push([bx + 17.5, bz + 17.5]);
      if ((Math.abs(bx) + Math.abs(bz)) % 120 === 0) {
        treeSpots.push([bx - 17.5, bz - 17.5]);
      }
    }
  }
  const treeTrunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 3.8, 7);
  const treeCanopyGeo = new THREE.DodecahedronGeometry(1.95, 1);
  const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4636, roughness: 0.9 });
  const treeCanopyMat = new THREE.MeshStandardMaterial({ color: 0x2f5e36, roughness: 0.85 });
  const trunkInst = new THREE.InstancedMesh(treeTrunkGeo, treeTrunkMat, treeSpots.length);
  const canopyInst = new THREE.InstancedMesh(treeCanopyGeo, treeCanopyMat, treeSpots.length);
  trunkInst.castShadow = false;
  canopyInst.castShadow = false;
  treeSpots.forEach(([tx, tz], idx) => {
    dummy.position.set(tx, 2.08, tz);
    dummy.rotation.set(0, (idx * 0.7) % (Math.PI * 2), 0);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(tx, 4.7, tz);
    dummy.updateMatrix();
    canopyInst.setMatrixAt(idx, dummy.matrix);
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  canopyInst.instanceMatrix.needsUpdate = true;
  canopyInst.computeBoundingSphere();
  staticCityGroup.add(trunkInst, canopyInst);

  // Freeze static city transforms so Three.js skips redundant matrix recalculations every frame
  staticCityGroup.traverse((obj) => {
    obj.matrixAutoUpdate = false;
    obj.updateMatrix();
  });

  return {
    colliders,
    circleColliders,
    gunShopPos,
    hospitalPos,
    bankPos,
    licenseOfficePos,
    courtExitPos,
    mafiaYardPos,
    roadCenters,
    shopDisplays,
    shopDealer,
    bankClerk,
    licenseOfficer,
    chaiStalls,
    sacredPlaces,
    atms,
    trafficSignals,
    nightEmissiveMats,
    interiorLightSpots,
    jailRig,
    courtRig,
    homeRig,
    buildingSigns,
  };
}

const streetCanvasTexCache = new Map<string, THREE.CanvasTexture>();

function createStreetCanvasTex(bg: string, border: string, title: string, subtitle?: string): THREE.CanvasTexture {
  const key = `${bg}|${border}|${title}|${subtitle ?? ''}`;
  const cached = streetCanvasTexCache.get(key);
  if (cached) return cached;

  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 192;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 192);
  ctx.strokeStyle = border;
  ctx.lineWidth = 10;
  ctx.strokeRect(7, 7, 498, 178);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 476, 156);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 256, subtitle ? 72 : 96, 462);
  if (subtitle) {
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 25px sans-serif';
    ctx.fillText(subtitle, 256, 132, 462);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  streetCanvasTexCache.set(key, tex);
  return tex;
}

function addChaiTapri(
  scene: THREE.Scene,
  colliders: BuildingCollider[],
  x: number,
  z: number,
  rotY: number,
  stallName: string,
  stallId: string,
): THREE.Mesh {
  const g = new THREE.Group();
  g.position.set(x, 0.18, z);
  g.rotation.y = rotY;

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.85 });
  const tinMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.55 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.25, metalness: 0.85 });
  const clayMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });

  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.05, 1.3), woodMat);
  counter.position.set(0, 0.525, 0);
  counter.castShadow = true;
  counter.receiveShadow = true;
  g.add(counter);

  [
    [-1.3, -0.55],
    [1.3, -0.55],
    [-1.3, 0.55],
    [1.3, 0.55],
  ].forEach(([px, pz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), woodMat);
    pole.position.set(px, 1.2, pz);
    g.add(pole);
  });

  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 2.0), tinMat);
  roof.position.set(0, 2.45, 0.1);
  roof.rotation.x = 0.12;
  roof.castShadow = true;
  g.add(roof);

  const signTex = createStreetCanvasTex('#7c2d12', '#f59e0b', stallName.toUpperCase(), 'गरमा-गरम चाय · [E] ORDER');
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.55, 0.1),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 }),
  );
  sign.position.set(0, 2.22, 0.96);
  g.add(sign);

  const patila = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.3, 10), steelMat);
  patila.position.set(-0.6, 1.2, 0.1);
  g.add(patila);

  for (let i = 0; i < 4; i++) {
    const kulhad = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.11, 8), clayMat);
    kulhad.position.set(0.35 + (i % 2) * 0.15, 1.1 + Math.floor(i / 2) * 0.1, 0.25);
    g.add(kulhad);
  }

  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.26, 8),
    new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.3, transparent: true, opacity: 0.85 }),
  );
  jar.position.set(0.95, 1.18, 0.2);
  g.add(jar);

  const chaiwala = createHumanoidModel({
    shirtColor: 0xf8fafc,
    pantsColor: 0x334155,
    skinColor: 0xc68b67,
  });
  chaiwala.root.position.set(0, 0, -0.95);
  g.add(chaiwala.root);

  const hitMesh = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 2.6, 2.4),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.set(0, 1.3, 0);
  hitMesh.userData = { shopAction: 'stall', stallId };
  g.add(hitMesh);

  scene.add(g);
  colliders.push({
    minX: x - 1.5,
    maxX: x + 1.5,
    minZ: z - 1.2,
    maxZ: z + 1.2,
    height: 2.5,
  });
  return hitMesh;
}

function addGolgappaStall(
  scene: THREE.Scene,
  colliders: BuildingCollider[],
  x: number,
  z: number,
  rotY: number,
  stallName: string,
  stallId: string,
  kind: 'golgappa' | 'chaat',
): THREE.Mesh {
  const g = new THREE.Group();
  g.position.set(x, 0.18, z);
  g.rotation.y = rotY;

  const cartColor = kind === 'golgappa' ? 0xbe123c : 0xd97706;
  const cartMat = new THREE.MeshStandardMaterial({ color: cartColor, roughness: 0.6 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });
  const clayMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 });
  const puriMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.72 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.95, 1.25), cartMat);
  body.position.set(0, 0.65, 0);
  body.castShadow = true;
  g.add(body);

  // Steel wheels under cart
  const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.1, 10);
  wheelGeo.rotateZ(Math.PI / 2);
  [-1.1, 1.1].forEach((wx) => {
    const w = new THREE.Mesh(wheelGeo, steelMat);
    w.position.set(wx, 0.26, 0.45);
    g.add(w);
  });

  // Glass pani-puri / chaat showcase box
  const glassBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.48, 0.7),
    new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.48, roughness: 0.15 }),
  );
  glassBox.position.set(-0.55, 1.36, 0.1);
  g.add(glassBox);

  // Mound of crispy golgappas inside display
  for (let i = 0; i < 6; i++) {
    const puri = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), puriMat);
    puri.position.set(-0.82 + (i % 3) * 0.22, 1.22 + Math.floor(i / 3) * 0.11, 0.12);
    g.add(puri);
  }

  // Twin brass/terracotta matkas wrapped in red cloth (Teekha & Meetha Pani)
  [0.45, 0.95].forEach((mx) => {
    const matka = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), clayMat);
    matka.position.set(mx, 1.3, 0.1);
    g.add(matka);
  });

  // Striped red/gold canopy + signboard
  [
    [-1.25, -0.5],
    [1.25, -0.5],
    [-1.25, 0.5],
    [1.25, 0.5],
  ].forEach(([px, pz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.45, 6), steelMat);
    pole.position.set(px, 1.22, pz);
    g.add(pole);
  });

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.12, 1.9), cartMat);
  canopy.position.set(0, 2.48, 0.08);
  canopy.castShadow = true;
  g.add(canopy);

  const signTex = createStreetCanvasTex(
    kind === 'golgappa' ? '#881337' : '#78350f',
    '#fde047',
    stallName.toUpperCase(),
    kind === 'golgappa' ? 'तीखा गोलगप्पा · [E] ORDER' : 'समोसा & लस्सी · [E] ORDER',
  );
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2.7, 0.55, 0.1),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.35 }),
  );
  sign.position.set(0, 2.24, 0.95);
  g.add(sign);

  const vendor = createHumanoidModel({
    shirtColor: kind === 'golgappa' ? 0xfbbf24 : 0xe2e8f0,
    pantsColor: 0x1e293b,
    skinColor: 0xc98b63,
  });
  vendor.root.position.set(0, 0, -0.95);
  g.add(vendor.root);

  const hitMesh = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 2.6, 2.4),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.set(0, 1.3, 0);
  hitMesh.userData = { shopAction: 'stall', stallId };
  g.add(hitMesh);

  scene.add(g);
  colliders.push({
    minX: x - 1.5,
    maxX: x + 1.5,
    minZ: z - 1.15,
    maxZ: z + 1.15,
    height: 2.5,
  });
  return hitMesh;
}

function addAutoStandBay(scene: THREE.Scene, x: number, z: number) {
  const bayMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.65,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const borderL = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 3.6), bayMat);
  borderL.rotation.x = -Math.PI / 2;
  borderL.position.set(x - 1.2, 0.025, z);
  const borderR = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 3.6), bayMat);
  borderR.rotation.x = -Math.PI / 2;
  borderR.position.set(x + 1.2, 0.025, z);
  scene.add(borderL, borderR);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 2.9, 8),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 }),
  );
  pole.position.set(x + 1.6, 1.45, z - 1.2);
  const tex = createStreetCanvasTex('#15803d', '#facc15', 'AUTO STAND', 'SAFE PARKING BAY');
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.5, 0.08),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 }),
  );
  board.position.set(x + 1.6, 2.7, z - 1.2);
  scene.add(pole, board);
}

function addHinduTemple(
  scene: THREE.Scene,
  colliders: BuildingCollider[],
  interiorLightSpots: InteriorLightSpot[],
  bx: number,
  bz: number,
  kind: 'ram_mandir' | 'krishna_mandir',
) {
  const isRam = kind === 'ram_mandir';
  const sandstone = new THREE.MeshStandardMaterial({
    color: isRam ? 0xe7c697 : 0xf8fafc,
    roughness: 0.55,
    metalness: 0.05,
  });
  const saffronMat = new THREE.MeshStandardMaterial({
    color: isRam ? 0xea580c : 0x0284c7,
    roughness: 0.55,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.85,
    roughness: 0.22,
  });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
  const skinMat = new THREE.MeshStandardMaterial({
    color: isRam ? 0x2563eb : 0x38bdf8,
    roughness: 0.45,
    metalness: 0.15,
  });

  // Raised Temple Platform + Courtyard (open on front for easy walk-in Darshan)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(24, 0.48, 22), floorMat);
  plinth.position.set(bx, 0.24, bz);
  plinth.receiveShadow = true;
  scene.add(plinth);

  // Back Garbhagriha Sanctum Walls
  const backW = new THREE.Mesh(new THREE.BoxGeometry(14, 7.2, 0.9), sandstone);
  backW.position.set(bx, 3.8, bz - 6.5);
  backW.castShadow = true;
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 7.2, 11), sandstone);
  sideL.position.set(bx - 6.6, 3.8, bz - 1);
  const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.9, 7.2, 11), sandstone);
  sideR.position.set(bx + 6.6, 3.8, bz - 1);
  scene.add(backW, sideL, sideR);
  colliders.push({ minX: bx - 7.1, maxX: bx + 7.1, minZ: bz - 7.0, maxZ: bz - 6.0, height: 7.2 });
  colliders.push({ minX: bx - 7.1, maxX: bx - 6.1, minZ: bz - 6.5, maxZ: bz + 4.5, height: 7.2 });
  colliders.push({ minX: bx + 6.1, maxX: bx + 7.1, minZ: bz - 6.5, maxZ: bz + 4.5, height: 7.2 });

  // Open Colonnade Mandap Pillars
  [
    [-6.5, 4.5],
    [-2.5, 4.5],
    [2.5, 4.5],
    [6.5, 4.5],
    [-6.5, 8.8],
    [6.5, 8.8],
  ].forEach(([px, pz]) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 7.2, 10), sandstone);
    pillar.position.set(bx + px, 3.8, bz + pz);
    pillar.castShadow = true;
    scene.add(pillar);
  });

  // Temple Roof + Tiered Nagara Shikhara Spire + Golden Kalash & Saffron Flag
  const mandapRoof = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.8, 16.5), sandstone);
  mandapRoof.position.set(bx, 7.6, bz + 1);
  mandapRoof.castShadow = true;
  scene.add(mandapRoof);

  const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 5.4, 3.2, 8), sandstone);
  tier1.position.set(bx, 9.6, bz - 2.5);
  const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 4.0, 3.0, 8), saffronMat);
  tier2.position.set(bx, 12.6, bz - 2.5);
  const tier3 = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.8, 8), sandstone);
  tier3.position.set(bx, 15.9, bz - 2.5);
  const kalash = new THREE.Mesh(new THREE.SphereGeometry(0.58, 10, 10), goldMat);
  kalash.position.set(bx, 18.1, bz - 2.5);
  const dhwajPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.2, 6), goldMat);
  dhwajPole.position.set(bx, 19.4, bz - 2.5);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.65, 0.06), saffronMat);
  flag.position.set(bx + 0.7, 20.1, bz - 2.5);
  scene.add(tier1, tier2, tier3, kalash, dhwajPole, flag);

  // Sacred Lotus Pedestal + Respectful Stylized Murti Idol (Lord Ram or Lord Krishna)
  const lotus = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 1.0, 12), goldMat);
  lotus.position.set(bx, 0.95, bz - 4.2);
  const prabhavali = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.14, 8, 20, Math.PI), goldMat);
  prabhavali.position.set(bx, 2.3, bz - 4.7);
  const idolTorso = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.3, 0.5), skinMat);
  idolTorso.position.set(bx, 2.25, bz - 4.2);
  const dhoti = new THREE.Mesh(
    new THREE.BoxGeometry(0.98, 0.75, 0.56),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 }),
  );
  dhoti.position.set(bx, 1.65, bz - 4.2);
  const idolHead = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 10), skinMat);
  idolHead.position.set(bx, 3.18, bz - 4.2);
  const mukut = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.58, 8), goldMat);
  mukut.position.set(bx, 3.65, bz - 4.2);
  scene.add(lotus, prabhavali, idolTorso, dhoti, idolHead, mukut);

  if (isRam) {
    // Golden Kodanda Bow next to Lord Ram Murti
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.06, 8, 16, Math.PI * 1.1), goldMat);
    bow.rotation.z = Math.PI * 0.45;
    bow.position.set(bx - 0.65, 2.45, bz - 3.9);
    scene.add(bow);
  } else {
    // Peacock Plume Feather on Crown + Silver Bansuri Flute for Lord Krishna Murti
    const plume = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.04, 0.42, 8),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x0284c7, emissiveIntensity: 0.4 }),
    );
    plume.rotation.z = -0.35;
    plume.position.set(bx + 0.18, 3.92, bz - 4.1);
    const bansuri = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.25, 8),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.15 }),
    );
    bansuri.rotation.z = Math.PI / 2 - 0.18;
    bansuri.position.set(bx, 2.75, bz - 3.78);
    scene.add(plume, bansuri);
  }

  // Hanging Brass Bell & Warm Diya Sanctum Light
  const bell = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.42, 10), goldMat);
  bell.position.set(bx, 5.2, bz + 3.2);
  scene.add(bell);

  interiorLightSpots.push({ x: bx, y: 5.6, z: bz - 1.5, color: 0xffedd5, intensity: 22, distance: 26 });

  const signTex = createStreetCanvasTex(
    isRam ? '#7c2d12' : '#0c4a6e',
    '#facc15',
    isRam ? 'SHREE RAM MANDIR' : 'SHREE KRISHNA MANDIR',
    isRam ? 'ॐ जय श्री राम · [E] DARSHAN' : 'ॐ राधे कृष्ण · [E] DARSHAN',
  );
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(10.5, 1.85, 0.3),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.35 }),
  );
  sign.position.set(bx, 6.2, bz + 8.95);
  scene.add(sign);
}

function addMosqueLandmark(
  scene: THREE.Scene,
  colliders: BuildingCollider[],
  interiorLightSpots: InteriorLightSpot[],
  bx: number,
  bz: number,
) {
  const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.06 });
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.48, metalness: 0.15 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.22 });
  const carpetMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.85 });

  // White Marble Courtyard Plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(26, 0.46, 22), marbleMat);
  plinth.position.set(bx, 0.23, bz);
  plinth.receiveShadow = true;
  scene.add(plinth);

  const prayerCarpet = new THREE.Mesh(new THREE.BoxGeometry(15, 0.08, 12), carpetMat);
  prayerCarpet.position.set(bx, 0.49, bz - 1);
  scene.add(prayerCarpet);

  // Prayer Hall Back & Side Walls (open arched South entrance +Z)
  const backW = new THREE.Mesh(new THREE.BoxGeometry(18, 7.6, 0.9), marbleMat);
  backW.position.set(bx, 3.8, bz - 7.5);
  backW.castShadow = true;
  const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 7.6, 14), marbleMat);
  sideL.position.set(bx - 8.6, 3.8, bz - 0.5);
  const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.9, 7.6, 14), marbleMat);
  sideR.position.set(bx + 8.6, 3.8, bz - 0.5);
  scene.add(backW, sideL, sideR);
  colliders.push({ minX: bx - 9.1, maxX: bx + 9.1, minZ: bz - 8.0, maxZ: bz - 7.0, height: 7.6 });
  colliders.push({ minX: bx - 9.1, maxX: bx - 8.1, minZ: bz - 7.5, maxZ: bz + 6.5, height: 7.6 });
  colliders.push({ minX: bx + 8.1, maxX: bx + 9.1, minZ: bz - 7.5, maxZ: bz + 6.5, height: 7.6 });

  // Emerald Arch Pillars & Roof
  [-6.2, -2.1, 2.1, 6.2].forEach((px) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 7.4, 10), marbleMat);
    col.position.set(bx + px, 3.7, bz + 6.5);
    col.castShadow = true;
    scene.add(col);
  });

  const hallRoof = new THREE.Mesh(new THREE.BoxGeometry(19.2, 0.75, 15.2), marbleMat);
  hallRoof.position.set(bx, 7.8, bz - 0.5);
  hallRoof.castShadow = true;
  const greenFrieze = new THREE.Mesh(new THREE.BoxGeometry(19.4, 0.9, 15.4), greenMat);
  greenFrieze.position.set(bx, 7.1, bz - 0.5);
  scene.add(hallRoof, greenFrieze);

  // Central White Onion Dome + Golden Crescent Finial
  const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.5, 1.5, 16), marbleMat);
  domeBase.position.set(bx, 8.9, bz - 1);
  const mainDome = new THREE.Mesh(new THREE.SphereGeometry(4.4, 20, 14), marbleMat);
  mainDome.scale.set(1, 0.92, 1);
  mainDome.position.set(bx, 11.4, bz - 1);
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.14, 2.2, 8), goldMat);
  spire.position.set(bx, 16.0, bz - 1);
  const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 8, 16, Math.PI * 1.45), goldMat);
  crescent.rotation.z = Math.PI * 0.3;
  crescent.position.set(bx, 17.3, bz - 1);
  scene.add(domeBase, mainDome, spire, crescent);

  // Twin Flanking Minarets with Balconies
  [-9.8, 9.8].forEach((mx) => {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.95, 16.5, 12), marbleMat);
    shaft.position.set(bx + mx, 8.25, bz + 6.8);
    shaft.castShadow = true;
    const balcony = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.05, 0.55, 12), greenMat);
    balcony.position.set(bx + mx, 12.2, bz + 6.8);
    const minDome = new THREE.Mesh(new THREE.SphereGeometry(0.82, 12, 10), greenMat);
    minDome.position.set(bx + mx, 16.8, bz + 6.8);
    const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.1, 6), goldMat);
    fin.position.set(bx + mx, 17.9, bz + 6.8);
    scene.add(shaft, balcony, minDome, fin);
    colliders.push({ minX: bx + mx - 1.0, maxX: bx + mx + 1.0, minZ: bz + 5.8, maxZ: bz + 7.8, height: 16 });
  });

  // Courtyard Wuzu Fountain + Warm Lantern Light
  const fountainRim = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.55, 14), marbleMat);
  fountainRim.position.set(bx, 0.65, bz + 8.8);
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 0.6, 14),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.15, metalness: 0.3 }),
  );
  water.position.set(bx, 0.68, bz + 8.8);
  scene.add(fountainRim, water);

  interiorLightSpots.push({ x: bx, y: 6.2, z: bz - 0.5, color: 0xd1fae5, intensity: 20, distance: 26 });

  const signTex = createStreetCanvasTex('#064e3b', '#facc15', 'NOOR MASJID', 'अस्सलामु अलैकुम · [E] VISIT');
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(10.0, 1.75, 0.3),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.35 }),
  );
  sign.position.set(bx, 6.4, bz + 7.0);
  scene.add(sign);
}

function addVendorThela(
  scene: THREE.Scene,
  colliders: BuildingCollider[],
  x: number,
  z: number,
  rotY: number,
  canopyColor: number,
) {
  const g = new THREE.Group();
  g.position.set(x, 0.18, z);
  g.rotation.y = rotY;

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.65 });

  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.24, 1.25), woodMat);
  bed.position.set(0, 0.78, 0);
  bed.castShadow = true;
  g.add(bed);

  const wGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 12);
  wGeo.rotateZ(Math.PI / 2);
  [
    [-0.95, -0.52],
    [0.95, -0.52],
    [-0.95, 0.52],
    [0.95, 0.52],
  ].forEach(([wx, wz]) => {
    const wheel = new THREE.Mesh(wGeo, rimMat);
    wheel.position.set(wx, 0.32, wz);
    g.add(wheel);
  });

  // Fruit crates (mangoes & tomatoes)
  const crateColors = [0xf59e0b, 0xef4444, 0x22c55e];
  crateColors.forEach((col, i) => {
    const fruit = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.25, 0.8),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 }),
    );
    fruit.position.set(-0.65 + i * 0.65, 1.0, 0);
    g.add(fruit);
  });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), woodMat);
  pole.position.set(0, 1.6, 0);
  g.add(pole);

  const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.45, 0.55, 8), canopyMat);
  umbrella.position.set(0, 2.55, 0);
  umbrella.castShadow = true;
  g.add(umbrella);

  scene.add(g);
  colliders.push({
    minX: x - 1.2,
    maxX: x + 1.2,
    minZ: z - 0.9,
    maxZ: z + 0.9,
    height: 1.5,
  });
}

function addStreetSign(scene: THREE.Scene, x: number, z: number, label: string, rotY: number) {
  const g = new THREE.Group();
  g.position.set(x, 0.18, z);
  g.rotation.y = rotY;

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.07, 3.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.3 }),
  );
  pole.position.y = 1.6;
  pole.castShadow = true;
  g.add(pole);

  const tex = createStreetCanvasTex('#14532d', '#f8fafc', label);
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.55, 0.08),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 }),
  );
  board.position.y = 2.95;
  g.add(board);

  scene.add(g);
}

function addPalmTree(scene: THREE.Scene, x: number, z: number) {
  const tree = new THREE.Group();
  tree.position.set(x, 0.18, z);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.34, 5.2, 7),
    new THREE.MeshStandardMaterial({ color: 0x5c4636, roughness: 0.9 }),
  );
  trunk.position.y = 2.6;
  trunk.castShadow = true;
  tree.add(trunk);

  const frondMat = new THREE.MeshStandardMaterial({ color: 0x355e3b, roughness: 0.82 });
  for (let i = 0; i < 5; i++) {
    const frond = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.8, 5), frondMat);
    frond.position.y = 5.2;
    frond.rotation.z = Math.PI / 3;
    frond.rotation.y = (i * Math.PI * 2) / 5;
    frond.translateY(1.1);
    tree.add(frond);
  }
  scene.add(tree);
}

function addTrafficIntersectionSignal(
  scene: THREE.Scene,
  colliders: BuildingCollider[],
  id: string,
  ix: number,
  iz: number,
  cycleOffset: number,
): TrafficSignalRig {
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.78, roughness: 0.35 });
  const housingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4, roughness: 0.55 });
  const stopLineMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.8,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  // White stop lines across the 4 approaches (~10.5m from intersection center)
  const nsStop = new THREE.PlaneGeometry(14, 0.55);
  nsStop.rotateX(-Math.PI / 2);
  const ewStop = new THREE.PlaneGeometry(0.55, 14);
  ewStop.rotateX(-Math.PI / 2);

  [iz - 10.5, iz + 10.5].forEach((sz) => {
    const line = new THREE.Mesh(nsStop, stopLineMat);
    line.position.set(ix, 0.03, sz);
    scene.add(line);
  });
  [ix - 10.5, ix + 10.5].forEach((sx) => {
    const line = new THREE.Mesh(ewStop, stopLineMat);
    line.position.set(sx, 0.03, iz);
    scene.add(line);
  });

  const nsRedMats: THREE.MeshStandardMaterial[] = [];
  const nsYellowMats: THREE.MeshStandardMaterial[] = [];
  const nsGreenMats: THREE.MeshStandardMaterial[] = [];
  const ewRedMats: THREE.MeshStandardMaterial[] = [];
  const ewYellowMats: THREE.MeshStandardMaterial[] = [];
  const ewGreenMats: THREE.MeshStandardMaterial[] = [];

  const createHead = (isNS: boolean) => {
    const box = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.18, 0.42), housingMat);
    box.add(body);

    const rMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, emissive: 0xef4444, emissiveIntensity: 0.1 });
    const yMat = new THREE.MeshStandardMaterial({ color: 0x422006, emissive: 0xfacc15, emissiveIntensity: 0.1 });
    const gMat = new THREE.MeshStandardMaterial({ color: 0x052e16, emissive: 0x22c55e, emissiveIntensity: 0.1 });

    if (isNS) {
      nsRedMats.push(rMat);
      nsYellowMats.push(yMat);
      nsGreenMats.push(gMat);
    } else {
      ewRedMats.push(rMat);
      ewYellowMats.push(yMat);
      ewGreenMats.push(gMat);
    }

    const bulbGeo = new THREE.SphereGeometry(0.11, 10, 10);
    const addBulbPair = (yOff: number, mat: THREE.MeshStandardMaterial) => {
      [-0.2, 0.2].forEach((faceOff) => {
        const b = new THREE.Mesh(bulbGeo, mat);
        if (isNS) b.position.set(0, yOff, faceOff);
        else b.position.set(faceOff, yOff, 0);
        box.add(b);
      });
    };
    addBulbPair(0.36, rMat);
    addBulbPair(0, yMat);
    addBulbPair(-0.36, gMat);
    return box;
  };

  // Place 2 diagonal corner cantilever poles so both N-S and E-W drivers see crisp overhead/corner signals
  const corners: { px: number; pz: number; armDx: number; armDz: number }[] = [
    { px: ix + 9.2, pz: iz - 9.2, armDx: -2.4, armDz: 0 },
    { px: ix - 9.2, pz: iz + 9.2, armDx: 2.4, armDz: 0 },
  ];

  for (const c of corners) {
    const g = new THREE.Group();
    g.position.set(c.px, 0.18, c.pz);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 5.4, 8), poleMat);
    mast.position.y = 2.7;
    mast.castShadow = true;
    g.add(mast);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(c.armDx) + 0.4, 0.12, 0.12), poleMat);
    arm.position.set(c.armDx * 0.5, 5.15, 0);
    g.add(arm);

    const nsHead = createHead(true);
    nsHead.position.set(c.armDx * 0.9, 4.75, 0);
    g.add(nsHead);

    const ewHead = createHead(false);
    ewHead.position.set(0, 4.2, c.px > ix ? 0.45 : -0.45);
    g.add(ewHead);

    scene.add(g);
    colliders.push({
      minX: c.px - 0.35,
      maxX: c.px + 0.35,
      minZ: c.pz - 0.35,
      maxZ: c.pz + 0.35,
      height: 5.4,
    });
  }

  return {
    id,
    x: ix,
    z: iz,
    cycleOffset,
    nsRedMats,
    nsYellowMats,
    nsGreenMats,
    ewRedMats,
    ewYellowMats,
    ewGreenMats,
  };
}

function addAtmKiosk(
  scene: THREE.Scene,
  colliders: BuildingCollider[],
  x: number,
  z: number,
  rotY: number,
  atmId: string,
  atmName: string,
): THREE.Mesh {
  const g = new THREE.Group();
  g.position.set(x, 0.18, z);
  g.rotation.y = rotY;

  const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x0f3b2e, roughness: 0.4, metalness: 0.28 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.85 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55 });
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.95,
  });

  // Booth & dispenser body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 2.85, 1.35), cabinetMat);
  body.position.y = 1.425;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.25, 1.85), darkMat);
  canopy.position.set(0, 2.9, 0.18);
  canopy.castShadow = true;
  g.add(canopy);

  const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.9, 0.1), darkMat);
  screenFrame.position.set(0, 1.72, 0.68);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.72, 0.08), screenMat);
  screen.position.set(0, 1.72, 0.72);
  g.add(screenFrame, screen);

  // Brushed steel keypad shelf & cash dispenser slot
  const keypad = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.12, 0.34), steelMat);
  keypad.position.set(0, 1.15, 0.78);
  const cashSlot = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.14, 0.1), darkMat);
  cashSlot.position.set(-0.08, 0.9, 0.69);
  const cashGlow = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.04, 0.06),
    new THREE.MeshBasicMaterial({ color: 0x10b981 }),
  );
  cashGlow.position.set(-0.08, 0.9, 0.72);
  g.add(keypad, cashSlot, cashGlow);

  // 24x7 ATM backlit header
  const signTex = createStreetCanvasTex('#062e24', '#38bdf8', '24×7 ATM', 'ROYAL BANK');
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 0.56, 0.12),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.3 }),
  );
  sign.position.set(0, 2.52, 0.7);
  g.add(sign);

  // Ground cyan interaction ring
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.3, 1.65, 22),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.04, 1.35);
  g.add(ring);

  // Invisible raycast hit mesh
  const hitMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 3.0, 2.2),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitMesh.position.set(0, 1.5, 0.25);
  hitMesh.userData = { shopAction: 'atm', atmId, atmName };
  g.add(hitMesh);

  scene.add(g);
  colliders.push({
    minX: x - 1.05,
    maxX: x + 1.05,
    minZ: z - 0.85,
    maxZ: z + 0.85,
    height: 3.0,
  });
  return hitMesh;
}

function addDistrictCourtExterior(
  scene: THREE.Scene,
  colliders: BuildingCollider[],
  interiorLightSpots: InteriorLightSpot[],
  bx: number,
  bz: number,
): CourtComplexRig {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd6c7b2, roughness: 0.52 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xc2b29b, roughness: 0.65 });
  const redSandstoneMat = new THREE.MeshStandardMaterial({ color: 0x8b2e20, roughness: 0.58 });
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.38 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c2d16, roughness: 0.65 });
  const crimsonMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.8 });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.72 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.5 });

  // Grand Walk-In Plinth (34m x 30m) + Ceiling + Open Archway
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(34, 0.36, 30), floorMat);
  plinth.position.set(bx, 0.18, bz - 1);
  plinth.receiveShadow = true;
  scene.add(plinth);

  const wallH = 6.8;
  // North back wall (x: bx-16..bx+16, z: bz-15)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(32, wallH, 0.7), stoneMat);
  backWall.position.set(bx, wallH / 2 + 0.18, bz - 14.8);
  backWall.castShadow = true;
  // West & East exterior walls
  const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.7, wallH, 27), stoneMat);
  westWall.position.set(bx - 16, wallH / 2 + 0.18, bz - 1.5);
  const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.7, wallH, 27), stoneMat);
  eastWall.position.set(bx + 16, wallH / 2 + 0.18, bz - 1.5);

  // South front wall with 6m wide open entrance [bx-3 .. bx+3] at z = bz + 11.8
  const frontL = new THREE.Mesh(new THREE.BoxGeometry(13.0, wallH, 0.7), stoneMat);
  frontL.position.set(bx - 9.5, wallH / 2 + 0.18, bz + 11.8);
  const frontR = new THREE.Mesh(new THREE.BoxGeometry(13.0, wallH, 0.7), stoneMat);
  frontR.position.set(bx + 9.5, wallH / 2 + 0.18, bz + 11.8);
  const frontLintel = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.2, 0.8), stoneMat);
  frontLintel.position.set(bx, 5.9, bz + 11.8);

  const roof = new THREE.Mesh(new THREE.BoxGeometry(33.2, 0.6, 28.0), redSandstoneMat);
  roof.position.set(bx, 7.2, bz - 1.5);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    redSandstoneMat,
  );
  dome.position.set(bx, 7.5, bz - 2);
  const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 1.8, 8), goldMat);
  finial.position.set(bx, 12.2, bz - 2);
  scene.add(backWall, westWall, eastWall, frontL, frontR, frontLintel, roof, dome, finial);

  // Perimeter colliders leaving wide front entrance open
  colliders.push({ minX: bx - 16.4, maxX: bx + 16.4, minZ: bz - 15.3, maxZ: bz - 14.3, height: wallH });
  colliders.push({ minX: bx - 16.4, maxX: bx - 15.6, minZ: bz - 15.0, maxZ: bz + 12.2, height: wallH });
  colliders.push({ minX: bx + 15.6, maxX: bx + 16.4, minZ: bz - 15.0, maxZ: bz + 12.2, height: wallH });
  colliders.push({ minX: bx - 16.4, maxX: bx - 3.0, minZ: bz + 11.4, maxZ: bz + 12.2, height: wallH });
  colliders.push({ minX: bx + 3.0, maxX: bx + 16.4, minZ: bz + 11.4, maxZ: bz + 12.2, height: wallH });

  // Partition walls between Central Atrium and West/East Side Courtrooms (wide 4.8m archways at bz-1..bz+3.8)
  [-6.6, 6.6].forEach((px) => {
    const partN = new THREE.Mesh(new THREE.BoxGeometry(0.45, wallH, 12.5), stoneMat);
    partN.position.set(bx + px, wallH / 2 + 0.18, bz - 8.5);
    const partS = new THREE.Mesh(new THREE.BoxGeometry(0.45, wallH, 8.2), stoneMat);
    partS.position.set(bx + px, wallH / 2 + 0.18, bz + 7.6);
    scene.add(partN, partS);
    colliders.push({ minX: bx + px - 0.3, maxX: bx + px + 0.3, minZ: bz - 14.8, maxZ: bz - 2.2, height: wallH });
    colliders.push({ minX: bx + px - 0.3, maxX: bx + px + 0.3, minZ: bz + 3.4, maxZ: bz + 11.8, height: wallH });
  });

  // Grand Front Portico Columns, Sign & Brass Scales
  [-9.5, -5.5, -3.2, 3.2, 5.5, 9.5].forEach((px) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, 6.8, 10), pillarMat);
    col.position.set(bx + px, 3.6, bz + 13.0);
    col.castShadow = true;
    scene.add(col);
  });
  const signTex = createStreetCanvasTex('#450a0a', '#fbbf24', 'DISTRICT & SESSIONS COURT', 'सत्यमेव जयते · OPEN GALLERY');
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(15.5, 2.1, 0.35),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.32 }),
  );
  sign.position.set(bx, 6.3, bz + 12.6);
  scene.add(sign);

  // Red Carpet & Clerk Typing Desks in Central Atrium
  const carpet = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 24), crimsonMat);
  carpet.position.set(bx, 0.38, bz - 1);
  scene.add(carpet);

  const actors: CourtComplexActor[] = [];

  // 2 Clerk Typing Desks in Central Atrium
  [
    { x: bx - 4.4, z: bz + 5.8, name: 'Court Clerk Ramesh', seed: 610 },
    { x: bx + 4.4, z: bz + 5.8, name: 'Typist Clerk Suresh', seed: 611 },
  ].forEach((cd, idx) => {
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 1.0), woodMat);
    desk.position.set(cd.x, 0.81, cd.z);
    const typewriter = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.25, 0.42), darkMetalMat);
    typewriter.position.set(cd.x, 1.38, cd.z + 0.1);
    const paperStack = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.28), paperMat);
    paperStack.position.set(cd.x + 0.65, 1.36, cd.z);
    scene.add(desk, typewriter, paperStack);
    colliders.push({ minX: cd.x - 1.15, maxX: cd.x + 1.15, minZ: cd.z - 0.55, maxZ: cd.z + 0.55, height: 1.4 });

    const clerkRig = createHumanoidModel({
      shirtColor: idx === 0 ? 0xe2e8f0 : 0xdbeafe,
      pantsColor: 0x334155,
      skinColor: 0xc98b63,
      outfitStyle: 'casual',
    });
    clerkRig.root.position.set(cd.x, 0.36, cd.z - 0.85);
    clerkRig.root.rotation.y = Math.PI;
    scene.add(clerkRig.root);
    actors.push({
      rig: clerkRig,
      kind: 'clerk',
      name: cd.name,
      x: cd.x,
      z: cd.z - 0.85,
      yaw: Math.PI,
      wpIndex: 0,
      seedId: cd.seed,
    });
  });

  // 2 Side Courtrooms (West & East) with Elevated Judge Benches & Live Hearing Actors
  [-11.3, 11.3].forEach((sideOffset, sideIdx) => {
    const scx = bx + sideOffset;
    const dais = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.6, 2.8), woodMat);
    dais.position.set(scx, 0.66, bz - 10.8);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.0, 0.9), woodMat);
    bench.position.set(scx, 1.45, bz - 9.7);
    const benchSpec1 = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.5, 0.85), woodMat);
    benchSpec1.position.set(scx, 0.62, bz + 4.8);
    const benchSpec2 = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.5, 0.85), woodMat);
    benchSpec2.position.set(scx, 0.62, bz + 7.4);
    scene.add(dais, bench, benchSpec1, benchSpec2);
    colliders.push({ minX: scx - 3.4, maxX: scx + 3.4, minZ: bz - 12.2, maxZ: bz - 9.2, height: 2.2 });

    const jRig = createHumanoidModel({
      shirtColor: 0x0f172a,
      pantsColor: 0x0f172a,
      skinColor: 0xc98b63,
      variant: 'judge',
    });
    jRig.root.position.set(scx, 0.96, bz - 11.2);
    jRig.root.rotation.y = Math.PI;
    scene.add(jRig.root);
    actors.push({
      rig: jRig,
      kind: 'judge',
      name: sideIdx === 0 ? 'Magistrate A.K. Verma' : 'Magistrate R.N. Joshi',
      x: scx,
      z: bz - 11.2,
      yaw: Math.PI,
      wpIndex: 0,
      seedId: 620 + sideIdx,
    });

    const lRig = createHumanoidModel({
      shirtColor: 0x111827,
      pantsColor: 0x0f172a,
      skinColor: 0xd19a72,
      variant: 'vakil',
    });
    const lBundle = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.36), paperMat);
    lBundle.position.set(0, -0.26, -0.14);
    lRig.leftArm.add(lBundle);
    lRig.root.position.set(scx - 1.6, 0.36, bz - 6.6);
    lRig.root.rotation.y = 0.25;
    scene.add(lRig.root);
    actors.push({
      rig: lRig,
      kind: 'vakil',
      name: sideIdx === 0 ? 'Adv. Vikram Kulkarni' : 'Adv. Rajesh Tiwari',
      x: scx - 1.6,
      z: bz - 6.6,
      yaw: 0.25,
      wpIndex: 0,
      seedId: 630 + sideIdx,
    });

    const wRig = createHumanoidModel({
      shirtColor: 0xa88f5c,
      pantsColor: 0x8d7548,
      skinColor: 0xc98b63,
      isPolice: sideIdx === 0,
      outfitStyle: sideIdx === 0 ? 'casual' : 'kurta',
    });
    wRig.root.position.set(scx + 1.6, 0.36, bz - 6.6);
    wRig.root.rotation.y = -0.25;
    scene.add(wRig.root);
    actors.push({
      rig: wRig,
      kind: 'witness',
      name: sideIdx === 0 ? 'ASI Harish Yadav' : 'Gawah Santosh',
      x: scx + 1.6,
      z: bz - 6.6,
      yaw: -0.25,
      wpIndex: 0,
      seedId: 640 + sideIdx,
    });
  });

  // 3 Walking Black-Coated Vakils carrying bundles of legal files through the Atrium corridor
  const vakilLoops: { name: string; seed: number; waypoints: { x: number; z: number }[] }[] = [
    {
      name: 'Adv. Manoj Shukla',
      seed: 650,
      waypoints: [
        { x: bx - 2.4, z: bz + 9.2 },
        { x: bx - 2.4, z: bz - 8.5 },
        { x: bx + 2.4, z: bz - 8.5 },
        { x: bx + 2.4, z: bz + 9.2 },
      ],
    },
    {
      name: 'Adv. Pradeep Dubey',
      seed: 651,
      waypoints: [
        { x: bx + 2.0, z: bz + 1.0 },
        { x: bx + 9.2, z: bz + 1.0 },
        { x: bx + 9.2, z: bz - 3.5 },
        { x: bx + 2.0, z: bz - 3.5 },
      ],
    },
    {
      name: 'Adv. Meera Sharma',
      seed: 652,
      waypoints: [
        { x: bx - 2.0, z: bz + 0.5 },
        { x: bx - 9.2, z: bz + 0.5 },
        { x: bx - 9.2, z: bz - 3.5 },
        { x: bx - 2.0, z: bz - 3.5 },
      ],
    },
  ];

  for (const vl of vakilLoops) {
    const rig = createHumanoidModel({
      shirtColor: 0x111827,
      pantsColor: 0x0f172a,
      skinColor: 0xd19a72,
      variant: 'vakil',
    });
    const fileBundle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.38), paperMat);
    fileBundle.position.set(0, -0.28, -0.15);
    rig.leftArm.add(fileBundle);
    const p0 = vl.waypoints[0];
    rig.root.position.set(p0.x, 0.36, p0.z);
    scene.add(rig.root);
    actors.push({
      rig,
      kind: 'vakil',
      name: vl.name,
      waypoints: vl.waypoints,
      wpIndex: 1,
      x: p0.x,
      z: p0.z,
      yaw: 0,
      seedId: vl.seed,
    });
  }

  interiorLightSpots.push(
    { x: bx, y: 6.2, z: bz - 1, color: 0xfef3c7, intensity: 16, distance: 26 },
    { x: bx - 11, y: 6.0, z: bz - 4, color: 0xfef3c7, intensity: 14, distance: 20 },
    { x: bx + 11, y: 6.0, z: bz - 4, color: 0xfef3c7, intensity: 14, distance: 20 },
  );

  return {
    actors,
    atriumCenter: new THREE.Vector3(bx, 0.36, bz),
  };
}

function addCentralJailCompound(
  scene: THREE.Scene,
  colliders: BuildingCollider[],
  interiorLightSpots: InteriorLightSpot[],
  bx: number,
  bz: number,
): CentralJailRig {
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.85 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.65 });
  const yardMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.92 });
  const thanaWallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.62 });
  const thanaStripeMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
  const thanaFloorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.72 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.78, roughness: 0.35 });
  const rustGateMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, metalness: 0.55, roughness: 0.55 });
  const bunkerMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.65 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.55, roughness: 0.4 });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.75 });

  // Compound Floor (42 x 43)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(42, 0.24, 43), yardMat);
  floor.position.set(bx, 0.12, bz + 0.5);
  floor.receiveShadow = true;
  scene.add(floor);

  const wallH = 6.2;
  // North Prison Section spans z: [bz - 21 .. bz + 5.5] (129..155.5)
  // Attached Enterable Thana Section spans z: [bz + 5.5 .. bz + 21.5] (155.5..171.5)
  const partitionZ = bz + 5.5;

  // West Jail Wall (z: bz-21 .. partitionZ)
  const westJailWall = new THREE.Mesh(new THREE.BoxGeometry(1.1, wallH, 26.5), wallMat);
  westJailWall.position.set(bx - 21, wallH / 2, bz - 7.75);
  westJailWall.castShadow = true;
  scene.add(westJailWall);
  colliders.push({ minX: bx - 21.6, maxX: bx - 20.4, minZ: bz - 21.5, maxZ: partitionZ + 0.5, height: wallH });

  // Partition Wall between Jail Yard & Thana with 5m Connecting Prison Gate at x = bx
  const partL = new THREE.Mesh(new THREE.BoxGeometry(18.5, wallH, 1.0), wallMat);
  partL.position.set(bx - 11.75, wallH / 2, partitionZ);
  const partR = new THREE.Mesh(new THREE.BoxGeometry(18.5, wallH, 1.0), wallMat);
  partR.position.set(bx + 11.75, wallH / 2, partitionZ);
  const partLintel = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.5, 1.2), trimMat);
  partLintel.position.set(bx, 5.45, partitionZ);
  scene.add(partL, partR, partLintel);
  colliders.push({ minX: bx - 21.5, maxX: bx - 2.5, minZ: partitionZ - 0.55, maxZ: partitionZ + 0.55, height: wallH });
  colliders.push({ minX: bx + 2.5, maxX: bx + 21.5, minZ: partitionZ - 0.55, maxZ: partitionZ + 0.55, height: wallH });

  const mainGateDoor = new THREE.Mesh(new THREE.BoxGeometry(5.0, 4.6, 0.3), ironMat);
  mainGateDoor.position.set(bx, 2.3, partitionZ);
  scene.add(mainGateDoor);
  const mainGateCollider: BuildingCollider = {
    minX: bx - 2.6,
    maxX: bx + 2.6,
    minZ: partitionZ - 0.65,
    maxZ: partitionZ + 0.65,
    height: 4.8,
  };
  colliders.push(mainGateCollider);

  // North Wall with 4m Warden Back Gate Opening at bx
  const northL = new THREE.Mesh(new THREE.BoxGeometry(19, wallH, 1.1), wallMat);
  northL.position.set(bx - 11.5, wallH / 2, bz - 21);
  const northR = new THREE.Mesh(new THREE.BoxGeometry(19, wallH, 1.1), wallMat);
  northR.position.set(bx + 11.5, wallH / 2, bz - 21);
  const northLintel = new THREE.Mesh(new THREE.BoxGeometry(5, 1.5, 1.3), trimMat);
  northLintel.position.set(bx, 5.45, bz - 21);
  scene.add(northL, northR, northLintel);
  colliders.push({ minX: bx - 21.5, maxX: bx - 2.0, minZ: bz - 21.6, maxZ: bz - 20.4, height: wallH });
  colliders.push({ minX: bx + 2.0, maxX: bx + 21.5, minZ: bz - 21.6, maxZ: bz - 20.4, height: wallH });

  const northGateDoor = new THREE.Mesh(new THREE.BoxGeometry(4.0, 4.6, 0.35), ironMat);
  northGateDoor.position.set(bx, 2.3, bz - 21);
  scene.add(northGateDoor);
  const northGateCollider: BuildingCollider = {
    minX: bx - 2.1,
    maxX: bx + 2.1,
    minZ: bz - 21.7,
    maxZ: bz - 20.3,
    height: 4.8,
  };
  colliders.push(northGateCollider);

  // East Jail Wall (z: bz-21 .. partitionZ) with 4m Weak Service Escape Gate at z = bz - 7.5
  const escapeZ = bz - 7.5;
  const eastN = new THREE.Mesh(new THREE.BoxGeometry(1.1, wallH, 11.5), wallMat);
  eastN.position.set(bx + 21, wallH / 2, bz - 15.25);
  const eastS = new THREE.Mesh(new THREE.BoxGeometry(1.1, wallH, 11.0), wallMat);
  eastS.position.set(bx + 21, wallH / 2, bz + 0.0);
  const eastLintel = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.5, 5), trimMat);
  eastLintel.position.set(bx + 21, 5.45, escapeZ);
  scene.add(eastN, eastS, eastLintel);
  colliders.push({ minX: bx + 20.4, maxX: bx + 21.6, minZ: bz - 21.5, maxZ: escapeZ - 2.0, height: wallH });
  colliders.push({ minX: bx + 20.4, maxX: bx + 21.6, minZ: escapeZ + 2.0, maxZ: partitionZ + 0.5, height: wallH });

  const eastGateDoor = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.6, 4.0), rustGateMat);
  eastGateDoor.position.set(bx + 21, 2.3, escapeZ);
  scene.add(eastGateDoor);
  const eastGateCollider: BuildingCollider = {
    minX: bx + 20.3,
    maxX: bx + 21.7,
    minZ: escapeZ - 2.1,
    maxZ: escapeZ + 2.1,
    height: 4.8,
  };
  colliders.push(eastGateCollider);

  // Jail Signboard over Connecting Prison Arch
  const jailSignTex = createStreetCanvasTex('#1e293b', '#f59e0b', 'BHARAT CENTRAL JAIL', 'HIGH SECURITY CORRECTIONAL FACILITY');
  const jailSign = new THREE.Mesh(
    new THREE.BoxGeometry(11.5, 1.8, 0.35),
    new THREE.MeshStandardMaterial({ map: jailSignTex, roughness: 0.38 }),
  );
  jailSign.position.set(bx, 6.2, partitionZ + 0.4);
  scene.add(jailSign);

  // 4 Corner Watchtowers with Rotating Searchlight Spotlights along Jail Yard perimeter
  const watchtowerBeams: THREE.Group[] = [];
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  [
    [-19.5, -19.5],
    [19.5, -19.5],
    [-19.5, 3.8],
    [19.5, 3.8],
  ].forEach(([tx, tz], tIdx) => {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(3.0, 9.2, 3.0), trimMat);
    tower.position.set(bx + tx, 4.6, bz + tz);
    tower.castShadow = true;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.5, 3.8), ironMat);
    roof.position.set(bx + tx, 9.45, bz + tz);
    const searchHead = new THREE.Group();
    searchHead.position.set(bx + tx, 8.9, bz + tz);
    const lampBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.65), darkMetalMat);
    const beamCone = new THREE.Mesh(new THREE.ConeGeometry(4.2, 16, 12, 1, true), beamMat.clone());
    beamCone.rotation.x = Math.PI * 0.62;
    beamCone.position.set(0, -3.2, -6.5);
    searchHead.add(lampBox, beamCone);
    searchHead.rotation.y = tIdx * 1.4;
    watchtowerBeams.push(searchHead);
    scene.add(tower, roof, searchHead);
  });

  const addJailStationBoard = (
    sx: number,
    sz: number,
    rotY: number,
    bgHex: string,
    fgHex: string,
    line1: string,
    line2: string,
    beaconHex: number,
  ) => {
    const tex = createStreetCanvasTex(bgHex, fgHex, line1, line2);
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.15, 0.16),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, emissive: beaconHex, emissiveIntensity: 0.22 }),
    );
    board.position.set(sx, 3.05, sz);
    board.rotation.y = rotY;
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), ironMat);
    post.position.set(sx, 1.5, sz);
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 10, 10),
      new THREE.MeshBasicMaterial({ color: beaconHex }),
    );
    orb.position.set(sx, 3.9, sz);
    scene.add(board, post, orb);
  };

  // Interior Station 1: Enterable Barracks Cell Block (Bunk Bed + Functional Cell Toilet + Lockable Bar Door)
  const cellRoof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.38, 10.4), bunkerMat);
  cellRoof.position.set(bx - 16.4, 4.35, escapeZ);
  cellRoof.castShadow = true;
  const cellBackW = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.2, 10.2), bunkerMat);
  cellBackW.position.set(bx - 19.6, 2.2, escapeZ);
  const cellNorthW = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.2, 0.45), bunkerMat);
  cellNorthW.position.set(bx - 16.4, 2.2, escapeZ - 5.0);
  const cellSouthW = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.2, 0.45), bunkerMat);
  cellSouthW.position.set(bx - 16.4, 2.2, escapeZ + 5.0);
  // East cell wall with 3.2m central doorway [escapeZ - 1.6 .. escapeZ + 1.6]
  const cellEastN = new THREE.Mesh(new THREE.BoxGeometry(0.42, 4.2, 3.4), bunkerMat);
  cellEastN.position.set(bx - 13.1, 2.2, escapeZ - 3.3);
  const cellEastS = new THREE.Mesh(new THREE.BoxGeometry(0.42, 4.2, 3.4), bunkerMat);
  cellEastS.position.set(bx - 13.1, 2.2, escapeZ + 3.3);
  const cellEastLintel = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.9, 3.4), trimMat);
  cellEastLintel.position.set(bx - 13.1, 3.85, escapeZ);
  scene.add(cellRoof, cellBackW, cellNorthW, cellSouthW, cellEastN, cellEastS, cellEastLintel);

  colliders.push({ minX: bx - 19.9, maxX: bx - 19.3, minZ: escapeZ - 5.2, maxZ: escapeZ + 5.2, height: 4.4 });
  colliders.push({ minX: bx - 19.8, maxX: bx - 13.0, minZ: escapeZ - 5.25, maxZ: escapeZ - 4.75, height: 4.4 });
  colliders.push({ minX: bx - 19.8, maxX: bx - 13.0, minZ: escapeZ + 4.75, maxZ: escapeZ + 5.25, height: 4.4 });
  colliders.push({ minX: bx - 13.35, maxX: bx - 12.85, minZ: escapeZ - 5.1, maxZ: escapeZ - 1.6, height: 4.4 });
  colliders.push({ minX: bx - 13.35, maxX: bx - 12.85, minZ: escapeZ + 1.6, maxZ: escapeZ + 5.1, height: 4.4 });

  // Sliding Cell Bar Door (open during day, locks shut during 20:30-06:00 Night Lockup)
  const cellGateDoor = new THREE.Group();
  for (let bzBar = -1.35; bzBar <= 1.35; bzBar += 0.34) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 3.3, 6), ironMat);
    bar.position.set(0, 1.75, bzBar);
    cellGateDoor.add(bar);
  }
  const cellGateFrame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 3.1), ironMat);
  cellGateFrame.position.set(0, 1.8, 0);
  cellGateDoor.add(cellGateFrame);
  cellGateDoor.position.set(bx - 13.1, 0.24, escapeZ - 3.0); // Open by default in day
  scene.add(cellGateDoor);
  const cellGateCollider: BuildingCollider = {
    minX: bx - 13.35,
    maxX: bx - 12.85,
    minZ: escapeZ - 1.65,
    maxZ: escapeZ + 1.65,
    height: 4.2,
  };
  colliders.push(cellGateCollider);

  // Bunk Bed inside Cell (North-West corner of barracks cell)
  const bunkPostMat = ironMat;
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.85 });
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
  const bunkFrame = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.14, 1.15), bunkPostMat);
  bunkFrame.position.set(bx - 17.6, 0.78, escapeZ - 3.2);
  const bunkMattress = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.16, 1.05), mattressMat);
  bunkMattress.position.set(bx - 17.6, 0.92, escapeZ - 3.2);
  const bunkPillow = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.72), pillowMat);
  bunkPillow.position.set(bx - 18.3, 1.04, escapeZ - 3.2);
  const topBunk = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.14, 1.15), bunkPostMat);
  topBunk.position.set(bx - 17.6, 2.02, escapeZ - 3.2);
  const topMattress = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.16, 1.05), mattressMat);
  topMattress.position.set(bx - 17.6, 2.16, escapeZ - 3.2);
  scene.add(bunkFrame, bunkMattress, bunkPillow, topBunk, topMattress);
  colliders.push({ minX: bx - 18.7, maxX: bx - 16.5, minZ: escapeZ - 3.85, maxZ: escapeZ - 2.55, height: 2.3 });

  const bunkRing = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 1.08, 22),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }),
  );
  bunkRing.rotation.x = -Math.PI / 2;
  bunkRing.position.set(bx - 16.4, 0.27, escapeZ - 2.1);
  scene.add(bunkRing);
  addJailStationBoard(bx - 12.7, escapeZ - 2.8, Math.PI / 2, '#0c4a6e', '#bae6fd', '1. CELL BUNK [E]', 'SLEEP NIGHT (+FD INTEREST)', 0x38bdf8);

  // Functional Steel/Porcelain Cell Toilet + Privacy Screen (South-West corner of barracks cell)
  const toiletPorcelain = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 });
  const toiletBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.44, 10), toiletPorcelain);
  toiletBase.position.set(bx - 18.2, 0.46, escapeZ + 3.4);
  const toiletSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.3, 0.08, 10), toiletPorcelain);
  toiletSeat.position.set(bx - 18.2, 0.7, escapeZ + 3.4);
  const toiletTank = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.52, 0.56), toiletPorcelain);
  toiletTank.position.set(bx - 18.6, 1.0, escapeZ + 3.4);
  const privacyHalfWall = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 0.14), bunkerMat);
  privacyHalfWall.position.set(bx - 17.9, 0.94, escapeZ + 2.3);
  const toiletRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.85, 18),
    new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide }),
  );
  toiletRing.rotation.x = -Math.PI / 2;
  toiletRing.position.set(bx - 16.8, 0.27, escapeZ + 3.2);
  scene.add(toiletBase, toiletSeat, toiletTank, privacyHalfWall, toiletRing);

  // Interior Station 2: South-West Carpentry & Gardening Workshop Yard
  const workBench = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.05, 1.8), woodMat);
  workBench.position.set(bx - 8.5, 0.7, bz + 2.2);
  const timberPlanks = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 0.7), woodMat);
  timberPlanks.position.set(bx - 8.5, 1.32, bz + 2.2);
  const gardenSoil = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.24, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 }),
  );
  gardenSoil.position.set(bx - 4.2, 0.36, bz + 2.2);
  const gardenGreens = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.22, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 }),
  );
  gardenGreens.position.set(bx - 4.2, 0.54, bz + 2.2);
  scene.add(workBench, timberPlanks, gardenSoil, gardenGreens);
  colliders.push({ minX: bx - 10.6, maxX: bx - 6.4, minZ: bz + 1.3, maxZ: bz + 3.1, height: 1.2 });

  const workRing = new THREE.Mesh(
    new THREE.RingGeometry(1.2, 1.75, 24),
    new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide }),
  );
  workRing.rotation.x = -Math.PI / 2;
  workRing.position.set(bx - 8.5, 0.27, bz - 0.3);
  scene.add(workRing);
  addJailStationBoard(bx - 8.5, bz + 2.5, Math.PI, '#064e3b', '#a7f3d0', '2. WORKSHOP [E]', 'CARPENTRY & GARDEN (+RS 2K)', 0x10b981);

  // Courtyard Mess Bench with Steel Thalis & Exercise Bar
  const messTable = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.82, 1.15), woodMat);
  messTable.position.set(bx - 5.2, 0.65, bz - 13.8);
  const thaliMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.75, roughness: 0.28 });
  [-6.2, -5.2, -4.2].forEach((tx) => {
    const thali = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.04, 12), thaliMat);
    thali.position.set(bx + tx, 1.08, bz - 13.8);
    scene.add(thali);
  });
  scene.add(messTable);
  colliders.push({ minX: bx - 7.1, maxX: bx - 3.3, minZ: bz - 14.4, maxZ: bz - 13.2, height: 1.0 });

  // Interior Station 3: North Warden Office & Jailer NPC
  const wardenDesk = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.15, 1.5), woodMat);
  wardenDesk.position.set(bx, 0.72, bz - 15.0);
  scene.add(wardenDesk);
  colliders.push({ minX: bx - 2.4, maxX: bx + 2.4, minZ: bz - 15.8, maxZ: bz - 14.2, height: 1.3 });

  const wardenRig = createHumanoidModel({
    shirtColor: 0x334155,
    pantsColor: 0x1e293b,
    skinColor: 0xc98b63,
    variant: 'jailer',
  });
  wardenRig.root.position.set(bx, 0.24, bz - 16.5);
  wardenRig.root.rotation.y = Math.PI;
  scene.add(wardenRig.root);

  const wardenRing = new THREE.Mesh(
    new THREE.RingGeometry(1.2, 1.75, 24),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }),
  );
  wardenRing.rotation.x = -Math.PI / 2;
  wardenRing.position.set(bx, 0.27, bz - 12.7);
  scene.add(wardenRing);
  addJailStationBoard(bx, bz - 16.0, 0, '#78350f', '#fde68a', '3. JAILER MAHENDRA [E]', 'BRIBE FOR NIGHT EXIT', 0xf59e0b);

  // Interior Station 4: Weak East Gate + Drainage Grate Escape Marker
  const drainGrate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 1.5), ironMat);
  drainGrate.position.set(bx + 18.8, 0.25, escapeZ + 1.8);
  const escapeRing = new THREE.Mesh(
    new THREE.RingGeometry(1.2, 1.75, 24),
    new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide }),
  );
  escapeRing.rotation.x = -Math.PI / 2;
  escapeRing.position.set(bx + 18.2, 0.27, escapeZ);
  scene.add(drainGrate, escapeRing);
  addJailStationBoard(bx + 20.1, escapeZ, -Math.PI / 2, '#7f1d1d', '#fecaca', '4. WEAK GATE / GRATE [E]', 'FREE YARD ESCAPE WINDOW', 0xef4444);

  // 2 Patrolling Prison Guards inside Jail Yard
  const coneGeo = new THREE.CircleGeometry(7.2, 18, -Math.PI / 2 - Math.PI / 5, (Math.PI * 2) / 5);
  coneGeo.rotateX(-Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const guardPatrolDefs: { waypoints: { x: number; z: number }[] }[] = [
    {
      waypoints: [
        { x: bx + 6.5, z: bz - 13.5 },
        { x: bx + 6.5, z: bz + 1.5 },
        { x: bx + 13.2, z: bz + 1.5 },
        { x: bx + 13.2, z: bz - 13.5 },
      ],
    },
    {
      waypoints: [
        { x: bx - 8.5, z: bz - 11.0 },
        { x: bx + 2.5, z: bz - 11.0 },
        { x: bx + 2.5, z: bz - 2.0 },
        { x: bx - 8.5, z: bz - 2.0 },
      ],
    },
  ];

  const guards: JailGuardVisual[] = guardPatrolDefs.map((def) => {
    const rig = createHumanoidModel({
      shirtColor: 0x4b5563,
      pantsColor: 0x374151,
      skinColor: 0xd19a72,
      variant: 'prison_guard',
    });
    rig.lathiProp.visible = true;
    const coneMesh = new THREE.Mesh(coneGeo, coneMat.clone());
    coneMesh.position.set(0, 0.08, 0);
    coneMesh.rotation.y = Math.PI;
    rig.root.add(coneMesh);
    const start = def.waypoints[0];
    rig.root.position.set(start.x, 0.24, start.z);
    scene.add(rig.root);
    return {
      rig,
      coneMesh,
      waypoints: def.waypoints,
      wpIndex: 1,
      x: start.x,
      z: start.z,
      yaw: 0,
    };
  });

  // 7 Diverse Fellow Inmates inside Central Jail (5 regular + 2 hostile rivals)
  const inmateDefs: {
    id: string;
    name: string;
    role: JailInmateVisual['role'];
    ally: boolean;
    isRival: boolean;
    maxHp: number;
    bribeCost: number;
    shirt: number;
    pants: number;
    outfit: 'casual' | 'kurta';
    yardPos: { x: number; z: number; yaw: number };
    workPos: { x: number; z: number; yaw: number };
    nightPos: { x: number; z: number; yaw: number };
    seed: number;
  }[] = [
    {
      id: 'chhotu-ally',
      name: 'Chhotu Mechanic',
      role: 'ally',
      ally: true,
      isRival: false,
      maxHp: 100,
      bribeCost: 0,
      shirt: 0xe2e8f0,
      pants: 0x475569,
      outfit: 'casual',
      yardPos: { x: bx + 2.8, z: bz - 2.6, yaw: -Math.PI * 0.45 },
      workPos: { x: bx - 6.8, z: bz + 0.6, yaw: Math.PI },
      nightPos: { x: bx - 14.6, z: escapeZ - 3.0, yaw: 0 },
      seed: 801,
    },
    {
      id: 'shera',
      name: 'Shera Pahalwan',
      role: 'exercise',
      ally: false,
      isRival: false,
      maxHp: 100,
      bribeCost: 0,
      shirt: 0xf1f5f9,
      pants: 0x334155,
      outfit: 'casual',
      yardPos: { x: bx + 1.8, z: bz - 9.2, yaw: 0.4 },
      workPos: { x: bx - 9.8, z: bz + 0.4, yaw: Math.PI },
      nightPos: { x: bx - 14.6, z: escapeZ - 0.8, yaw: Math.PI / 2 },
      seed: 802,
    },
    {
      id: 'dada-bhiku',
      name: 'Dada Bhiku',
      role: 'eat',
      ally: false,
      isRival: false,
      maxHp: 100,
      bribeCost: 0,
      shirt: 0xd6d3d1,
      pants: 0x57534e,
      outfit: 'kurta',
      yardPos: { x: bx - 5.2, z: bz - 12.6, yaw: Math.PI },
      workPos: { x: bx - 4.4, z: bz + 0.5, yaw: Math.PI },
      nightPos: { x: bx - 15.8, z: escapeZ + 0.6, yaw: -Math.PI / 2 },
      seed: 803,
    },
    {
      id: 'kaidi-raju',
      name: 'Kaidi Raju',
      role: 'workshop',
      ally: false,
      isRival: false,
      maxHp: 100,
      bribeCost: 0,
      shirt: 0xcbd5e1,
      pants: 0x475569,
      outfit: 'casual',
      yardPos: { x: bx - 7.8, z: bz - 2.2, yaw: 0.3 },
      workPos: { x: bx - 8.5, z: bz + 0.8, yaw: Math.PI },
      nightPos: { x: bx - 17.6, z: escapeZ - 1.0, yaw: 0 },
      seed: 804,
    },
    {
      id: 'lala-bhai',
      name: 'Lala Bhai',
      role: 'chat',
      ally: false,
      isRival: false,
      maxHp: 100,
      bribeCost: 0,
      shirt: 0xfef3c7,
      pants: 0x475569,
      outfit: 'kurta',
      yardPos: { x: bx - 4.2, z: bz - 6.8, yaw: -0.5 },
      workPos: { x: bx - 5.5, z: bz - 0.2, yaw: Math.PI },
      nightPos: { x: bx - 15.2, z: escapeZ + 2.2, yaw: Math.PI },
      seed: 805,
    },
    {
      id: 'rival-kaalia',
      name: 'Kaalia Bhaiya (Rival)',
      role: 'rival',
      ally: false,
      isRival: true,
      maxHp: 75,
      bribeCost: 500,
      shirt: 0x991b1b,
      pants: 0x1e293b,
      outfit: 'casual',
      yardPos: { x: bx + 8.6, z: bz - 6.8, yaw: Math.PI * 0.5 },
      workPos: { x: bx - 1.5, z: bz - 1.2, yaw: Math.PI },
      nightPos: { x: bx - 17.2, z: escapeZ + 2.4, yaw: 0 },
      seed: 806,
    },
    {
      id: 'rival-billa',
      name: 'Billa Don (Rival)',
      role: 'rival',
      ally: false,
      isRival: true,
      maxHp: 95,
      bribeCost: 900,
      shirt: 0x7f1d1d,
      pants: 0x0f172a,
      outfit: 'kurta',
      yardPos: { x: bx + 11.4, z: bz - 12.2, yaw: -Math.PI * 0.35 },
      workPos: { x: bx + 5.8, z: bz - 3.6, yaw: 0.4 },
      nightPos: { x: bx - 17.8, z: escapeZ - 2.6, yaw: Math.PI * 0.5 },
      seed: 807,
    },
  ];

  const inmates: JailInmateVisual[] = inmateDefs.map((def) => {
    const rig = createHumanoidModel({
      shirtColor: def.shirt,
      pantsColor: def.pants,
      skinColor: 0xc98b63,
      outfitStyle: def.outfit,
    });
    rig.root.position.set(def.yardPos.x, 0.24, def.yardPos.z);
    rig.root.rotation.y = def.yardPos.yaw;
    scene.add(rig.root);
    return {
      id: def.id,
      rig,
      name: def.name,
      role: def.role,
      ally: def.ally,
      isRival: def.isRival,
      hp: def.maxHp,
      maxHp: def.maxHp,
      bribeCost: def.bribeCost,
      bribed: false,
      defeated: false,
      attackCooldown: 0,
      staggerTimer: 0,
      alerted: false,
      yardPos: def.yardPos,
      workPos: def.workPos,
      nightPos: def.nightPos,
      x: def.yardPos.x,
      z: def.yardPos.z,
      yaw: def.yardPos.yaw,
      seedId: def.seed,
    };
  });

  // =========================================================================
  // ATTACHED ENTERABLE POLICE STATION (THANA NO. 4) z: [partitionZ .. bz+21.5]
  // =========================================================================
  const thanaZStart = partitionZ;
  const thanaZEnd = bz + 21.5;
  const thanaDepth = thanaZEnd - thanaZStart;
  const thanaMidZ = (thanaZStart + thanaZEnd) * 0.5;
  const thanaH = 5.2;

  const thanaFloor = new THREE.Mesh(new THREE.BoxGeometry(41.6, 0.28, thanaDepth), thanaFloorMat);
  thanaFloor.position.set(bx, 0.14, thanaMidZ);
  thanaFloor.receiveShadow = true;
  const thanaRoof = new THREE.Mesh(new THREE.BoxGeometry(42.2, 0.45, thanaDepth + 0.6), trimMat);
  thanaRoof.position.set(bx, thanaH + 0.2, thanaMidZ);

  // West & East Thana outer walls
  const tWest = new THREE.Mesh(new THREE.BoxGeometry(0.7, thanaH, thanaDepth), thanaWallMat);
  tWest.position.set(bx - 20.8, thanaH / 2, thanaMidZ);
  const tEast = new THREE.Mesh(new THREE.BoxGeometry(0.7, thanaH, thanaDepth), thanaWallMat);
  tEast.position.set(bx + 20.8, thanaH / 2, thanaMidZ);
  // Blue police band around Thana exterior
  const tSouthL = new THREE.Mesh(new THREE.BoxGeometry(17.8, thanaH, 0.7), thanaWallMat);
  tSouthL.position.set(bx - 12.1, thanaH / 2, thanaZEnd);
  const tSouthR = new THREE.Mesh(new THREE.BoxGeometry(17.8, thanaH, 0.7), thanaWallMat);
  tSouthR.position.set(bx + 12.1, thanaH / 2, thanaZEnd);
  const tSouthLintel = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.7, 0.8), thanaStripeMat);
  tSouthLintel.position.set(bx, 4.45, thanaZEnd);
  scene.add(thanaFloor, thanaRoof, tWest, tEast, tSouthL, tSouthR, tSouthLintel);

  // Thana Exterior Colliders (leaving 6m wide open entrance at [bx-3 .. bx+3], z = thanaZEnd)
  colliders.push({ minX: bx - 21.3, maxX: bx - 20.3, minZ: thanaZStart, maxZ: thanaZEnd + 0.4, height: thanaH });
  colliders.push({ minX: bx + 20.3, maxX: bx + 21.3, minZ: thanaZStart, maxZ: thanaZEnd + 0.4, height: thanaH });
  colliders.push({ minX: bx - 21.3, maxX: bx - 3.0, minZ: thanaZEnd - 0.4, maxZ: thanaZEnd + 0.4, height: thanaH });
  colliders.push({ minX: bx + 3.0, maxX: bx + 21.3, minZ: thanaZEnd - 0.4, maxZ: thanaZEnd + 0.4, height: thanaH });

  // Iconic Illuminated Thana Board + Red/Blue Porch Lights
  const thanaSignTex = createStreetCanvasTex('#0f172a', '#38bdf8', 'BHARAT POLICE THANA · NO. 4', 'FIR DESK · LOCKUP · CENTRAL JAIL');
  const thanaSign = new THREE.Mesh(
    new THREE.BoxGeometry(15.2, 1.9, 0.3),
    new THREE.MeshStandardMaterial({ map: thanaSignTex, roughness: 0.3 }),
  );
  thanaSign.position.set(bx, 4.5, thanaZEnd + 0.52);
  const porchBeaconR = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.25, 0.35),
    new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  );
  porchBeaconR.position.set(bx - 3.6, 4.4, thanaZEnd + 0.55);
  const porchBeaconB = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.25, 0.35),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
  );
  porchBeaconB.position.set(bx + 3.6, 4.4, thanaZEnd + 0.55);
  scene.add(thanaSign, porchBeaconR, porchBeaconB);

  // Center Duty Officer Desk + Wireless Radio + Landline Phone + FIR Registers
  const dutyDeskZ = bz + 12.2;
  const dutyDesk = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.05, 1.25), woodMat);
  dutyDesk.position.set(bx, 0.78, dutyDeskZ);
  const wirelessBox = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.42, 0.46), darkMetalMat);
  wirelessBox.position.set(bx - 1.9, 1.5, dutyDeskZ + 0.15);
  const radioAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.65, 6), darkMetalMat);
  radioAntenna.position.set(bx - 2.15, 1.92, dutyDeskZ + 0.15);
  const thanaRadioLedMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
  const radioLed = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), thanaRadioLedMat);
  radioLed.position.set(bx - 1.75, 1.56, dutyDeskZ + 0.39);
  const landlinePhone = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.36), darkMetalMat);
  landlinePhone.position.set(bx + 1.85, 1.4, dutyDeskZ + 0.15);
  const firStack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.38), paperMat);
  firStack.position.set(bx + 0.4, 1.44, dutyDeskZ + 0.1);
  scene.add(dutyDesk, wirelessBox, radioAntenna, radioLed, landlinePhone, firStack);
  colliders.push({ minX: bx - 3.25, maxX: bx + 3.25, minZ: dutyDeskZ - 0.68, maxZ: dutyDeskZ + 0.68, height: 1.4 });

  const thanaDeskRing = new THREE.Mesh(
    new THREE.RingGeometry(1.0, 1.45, 22),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }),
  );
  thanaDeskRing.rotation.x = -Math.PI / 2;
  thanaDeskRing.position.set(bx, 0.3, dutyDeskZ + 2.2);
  scene.add(thanaDeskRing);

  // Waiting Benches in West Thana Hall
  [-15.5, -10.5].forEach((wx) => {
    const wBench = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.55, 0.9), woodMat);
    wBench.position.set(bx + wx, 0.52, bz + 17.6);
    scene.add(wBench);
    colliders.push({ minX: bx + wx - 1.8, maxX: bx + wx + 1.8, minZ: bz + 17.1, maxZ: bz + 18.1, height: 0.9 });
  });

  // East Twin Iron-Bar Lockup Cells (x: bx+6 .. bx+19.4, z: bz+6.4 .. bz+13.6)
  const cellDivWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, thanaH, 7.2), thanaWallMat);
  cellDivWall.position.set(bx + 12.7, thanaH / 2, bz + 10.0);
  const cellWestWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, thanaH, 7.2), thanaWallMat);
  cellWestWall.position.set(bx + 6.0, thanaH / 2, bz + 10.0);
  scene.add(cellDivWall, cellWestWall);
  colliders.push({ minX: bx + 5.75, maxX: bx + 6.25, minZ: bz + 6.4, maxZ: bz + 13.7, height: thanaH });
  colliders.push({ minX: bx + 12.45, maxX: bx + 12.95, minZ: bz + 6.4, maxZ: bz + 13.7, height: thanaH });

  // Vertical Iron Bars along Lockup Cell South Front (z = bz + 13.5)
  const cellFrontZ = bz + 13.5;
  for (let barX = bx + 6.4; barX <= bx + 19.6; barX += 0.42) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.8, 6), ironMat);
    bar.position.set(barX, 2.1, cellFrontZ);
    scene.add(bar);
  }
  const barBeam = new THREE.Mesh(new THREE.BoxGeometry(14.0, 1.3, 0.35), trimMat);
  barBeam.position.set(bx + 13.0, 4.55, cellFrontZ);
  scene.add(barBeam);
  colliders.push({ minX: bx + 6.0, maxX: bx + 20.2, minZ: cellFrontZ - 0.3, maxZ: cellFrontZ + 0.3, height: thanaH });

  // Cell Stone Bunks inside Cell 1 & Cell 2
  const c1Bunk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.52, 1.1), wallMat);
  c1Bunk.position.set(bx + 9.2, 0.52, bz + 8.0);
  const c2Bunk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.52, 1.1), wallMat);
  c2Bunk.position.set(bx + 16.0, 0.52, bz + 8.0);
  scene.add(c1Bunk, c2Bunk);

  // Thana NPCs (Duty Officer, Bustling Constables, Complainants, Lockup Guard, & 2 Dynamic Lockup Prisoner Slots)
  const thanaActors: ThanaActor[] = [];

  const dutyOfficerRig = createHumanoidModel({
    shirtColor: 0xa88f5c,
    pantsColor: 0x8d7548,
    skinColor: 0xc98b63,
    isPolice: true,
  });
  dutyOfficerRig.root.position.set(bx, 0.28, dutyDeskZ - 1.35);
  scene.add(dutyOfficerRig.root);
  thanaActors.push({
    rig: dutyOfficerRig,
    kind: 'duty',
    name: 'SI Devendra Singh (Duty Officer)',
    baseX: bx,
    baseZ: dutyDeskZ - 1.35,
    x: bx,
    z: dutyDeskZ - 1.35,
    yaw: Math.PI,
    wpIndex: 0,
    active: true,
    seedId: 701,
  });

  // Walking Constables carrying FIR files inside Thana
  const thanaWalkers: {
    kind: 'constable' | 'complainant';
    name: string;
    seed: number;
    shirt: number;
    pants: number;
    isPolice: boolean;
    outfit?: 'casual' | 'kurta';
    waypoints: { x: number; z: number }[];
  }[] = [
    {
      kind: 'constable',
      name: 'Constable Rajesh',
      seed: 702,
      shirt: 0xa88f5c,
      pants: 0x8d7548,
      isPolice: true,
      waypoints: [
        { x: bx - 12.5, z: bz + 12.5 },
        { x: bx - 4.5, z: bz + 12.5 },
        { x: bx - 4.5, z: bz + 17.5 },
        { x: bx - 12.5, z: bz + 17.5 },
      ],
    },
    {
      kind: 'constable',
      name: 'Hawaldar Brijesh',
      seed: 703,
      shirt: 0xa88f5c,
      pants: 0x8d7548,
      isPolice: true,
      waypoints: [
        { x: bx + 4.8, z: bz + 16.0 },
        { x: bx + 16.5, z: bz + 16.0 },
        { x: bx + 16.5, z: bz + 19.0 },
        { x: bx + 4.8, z: bz + 19.0 },
      ],
    },
    {
      kind: 'complainant',
      name: 'Fariyadi Mukesh',
      seed: 704,
      shirt: 0xf8fafc,
      pants: 0x334155,
      isPolice: false,
      outfit: 'kurta',
      waypoints: [
        { x: bx - 7.5, z: bz + 15.2 },
        { x: bx - 1.5, z: bz + 15.2 },
      ],
    },
    {
      kind: 'complainant',
      name: 'Naagarik Anwar',
      seed: 705,
      shirt: 0xe0f2fe,
      pants: 0x1e293b,
      isPolice: false,
      outfit: 'casual',
      waypoints: [
        { x: bx - 16.5, z: bz + 14.0 },
        { x: bx - 10.0, z: bz + 14.0 },
      ],
    },
  ];

  for (const tw of thanaWalkers) {
    const rig = createHumanoidModel({
      shirtColor: tw.shirt,
      pantsColor: tw.pants,
      skinColor: 0xc98b63,
      isPolice: tw.isPolice,
      outfitStyle: tw.outfit ?? 'casual',
    });
    if (tw.kind === 'constable') {
      const fileClip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.36), paperMat);
      fileClip.position.set(0, -0.26, -0.16);
      rig.leftArm.add(fileClip);
    }
    const p0 = tw.waypoints[0];
    rig.root.position.set(p0.x, 0.28, p0.z);
    scene.add(rig.root);
    thanaActors.push({
      rig,
      kind: tw.kind,
      name: tw.name,
      baseX: p0.x,
      baseZ: p0.z,
      waypoints: tw.waypoints,
      wpIndex: 1,
      x: p0.x,
      z: p0.z,
      yaw: 0,
      active: true,
      seedId: tw.seed,
    });
  }

  // Lockup Duty Constable standing/pacing in front of iron bars questioning prisoners
  const lockupGuardRig = createHumanoidModel({
    shirtColor: 0xa88f5c,
    pantsColor: 0x8d7548,
    skinColor: 0xc98b63,
    isPolice: true,
  });
  lockupGuardRig.lathiProp.visible = true;
  lockupGuardRig.root.position.set(bx + 12.6, 0.28, cellFrontZ + 1.45);
  scene.add(lockupGuardRig.root);
  const thanaLockupConstable: ThanaActor = {
    rig: lockupGuardRig,
    kind: 'constable',
    name: 'Hawaldar Pramod',
    baseX: bx + 12.6,
    baseZ: cellFrontZ + 1.45,
    x: bx + 12.6,
    z: cellFrontZ + 1.45,
    yaw: 0,
    wpIndex: 0,
    active: true,
    seedId: 706,
  };
  thanaActors.push(thanaLockupConstable);

  // 2 Dynamic Lockup Prisoner Slots (0, 1, or 2 shown dynamically by GameEngine)
  const thanaPrisoners: ThanaActor[] = [
    {
      name: 'Kaidi Bunty',
      x: bx + 7.4,
      z: bz + 9.8,
      shirt: 0x64748b,
      seed: 710,
      waypoints: [
        { x: bx + 7.2, z: bz + 9.4 },
        { x: bx + 10.6, z: bz + 10.2 },
      ],
    },
    {
      name: 'Kaidi Pappu',
      x: bx + 16.0,
      z: bz + 10.6,
      shirt: 0x78716c,
      seed: 711,
      waypoints: [
        { x: bx + 14.4, z: bz + 11.8 },
        { x: bx + 17.6, z: bz + 10.2 },
      ],
    },
  ].map((p) => {
    const rig = createHumanoidModel({
      shirtColor: p.shirt,
      pantsColor: 0x334155,
      skinColor: 0xc98b63,
      outfitStyle: 'casual',
    });
    rig.root.position.set(p.x, 0.28, p.z);
    scene.add(rig.root);
    const actor: ThanaActor = {
      rig,
      kind: 'prisoner',
      name: p.name,
      baseX: p.x,
      baseZ: p.z,
      waypoints: p.waypoints,
      wpIndex: 1,
      x: p.x,
      z: p.z,
      yaw: Math.PI,
      active: true,
      seedId: p.seed,
    };
    thanaActors.push(actor);
    return actor;
  });

  // Cell-front Inspector Review Table & Chair + Arresting Inspector (animated during THANA_LOCKUP)
  const reviewTable = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.78, 0.7), woodMat);
  reviewTable.position.set(bx + 9.2, 0.67, cellFrontZ + 1.35);
  const reviewFile = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.3), paperMat);
  reviewFile.position.set(bx + 9.2, 1.09, cellFrontZ + 1.35);
  const reviewChairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.1, 0.54), woodMat);
  reviewChairSeat.position.set(bx + 9.2, 0.72, cellFrontZ + 2.15);
  const reviewChairBack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.58, 0.08), woodMat);
  reviewChairBack.position.set(bx + 9.2, 1.02, cellFrontZ + 2.38);
  scene.add(reviewTable, reviewFile, reviewChairSeat, reviewChairBack);

  const inspectorRig = createHumanoidModel({
    shirtColor: 0xa88f5c,
    pantsColor: 0x8d7548,
    skinColor: 0xd19a72,
    isPolice: true,
  });
  const inspFile = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.36), paperMat);
  inspFile.position.set(0, -0.26, -0.15);
  inspectorRig.leftArm.add(inspFile);
  inspectorRig.root.position.set(bx - 1.8, 0.28, dutyDeskZ - 1.25);
  inspectorRig.root.rotation.y = Math.PI;
  scene.add(inspectorRig.root);
  const thanaInspectorActor: ThanaActor = {
    rig: inspectorRig,
    kind: 'inspector',
    name: 'Inspector Vijay Rathore',
    baseX: bx - 1.8,
    baseZ: dutyDeskZ - 1.25,
    x: bx - 1.8,
    z: dutyDeskZ - 1.25,
    yaw: Math.PI,
    wpIndex: 0,
    active: true,
    seedId: 712,
  };
  thanaActors.push(thanaInspectorActor);

  interiorLightSpots.push(
    { x: bx, y: 4.5, z: thanaMidZ + 1.5, color: 0xe0f2fe, intensity: 16, distance: 28 },
    { x: bx + 12.5, y: 4.4, z: bz + 11.5, color: 0xfef3c7, intensity: 12, distance: 18 },
  );

  return {
    guards,
    inmates,
    watchtowerBeams,
    mainGateDoor,
    northGateDoor,
    eastGateDoor,
    cellGateDoor,
    mainGateCollider,
    northGateCollider,
    eastGateCollider,
    cellGateCollider,
    bunkPos: new THREE.Vector3(bx - 16.4, 0.24, escapeZ - 2.1),
    toiletPos: new THREE.Vector3(bx - 16.8, 0.24, escapeZ + 3.2),
    cellInsidePos: new THREE.Vector3(bx - 15.2, 0.24, escapeZ),
    workshopPos: new THREE.Vector3(bx - 8.5, 0.24, bz - 0.3),
    wardenPos: new THREE.Vector3(bx, 0.24, bz - 12.7),
    escapePos: new THREE.Vector3(bx + 18.2, 0.24, escapeZ),
    yardCenter: new THREE.Vector3(bx, 0.24, bz - 5),
    releaseOutsidePos: new THREE.Vector3(bx, 0.18, bz + 26.5),
    bribeOutsidePos: new THREE.Vector3(bx, 0.18, bz - 28),
    escapeOutsidePos: new THREE.Vector3(bx + 28.5, 0.18, escapeZ),
    thanaDeskPos: new THREE.Vector3(bx, 0.28, dutyDeskZ + 2.2),
    thanaLockupCellPos: new THREE.Vector3(bx + 8.8, 0.28, bz + 11.5),
    thanaInspectorPos: new THREE.Vector3(bx + 9.2, 0.28, cellFrontZ + 2.05),
    thanaDoorwayPos: new THREE.Vector3(bx, 0.18, thanaZEnd + 3.0),
    thanaActors,
    thanaPrisoners,
    thanaLockupConstable,
    thanaInspectorActor,
    thanaRadioLedMat,
  };
}

/**
 * Isolated 3D Indian District & Sessions Courtroom Interior Stage at (520, 0, 0).
 * Houses elevated Judge Bench, Brass Scales, Judge, Defense Vakil, Arresting Police Inspector,
 * Wooden Kathgara (Witness Box) for the player, and Gallery Benches.
 */
export function createDistrictCourtroomStage(scene: THREE.Scene): CourtroomStageRig {
  const cx = 520;
  const cz = 0;
  const root = new THREE.Group();
  root.position.set(cx, 0, cz);

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x3b281c, roughness: 0.55 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe7dcc8, roughness: 0.72 });
  const teakMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.55 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.22 });
  const crimsonMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.78 });

  // Enclosed Courtroom Shell (22m wide x 7.5m tall x 20m deep)
  const floor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.3, 20), floorMat);
  floor.position.set(0, -0.15, 0);
  floor.receiveShadow = true;
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 20), wallMat);
  ceiling.position.set(0, 7.6, 0);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 7.6, 0.5), wallMat);
  backWall.position.set(0, 3.8, -9.8);
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(22, 7.6, 0.5), wallMat);
  frontWall.position.set(0, 3.8, 9.8);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7.6, 20), wallMat);
  leftWall.position.set(-10.8, 3.8, 0);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7.6, 20), wallMat);
  rightWall.position.set(10.8, 3.8, 0);
  root.add(floor, ceiling, backWall, frontWall, leftWall, rightWall);

  // Teakwood Wainscoting along walls
  const backWainscot = new THREE.Mesh(new THREE.BoxGeometry(21.4, 2.3, 0.14), teakMat);
  backWainscot.position.set(0, 1.15, -9.48);
  root.add(backWainscot);

  // District Court Emblem & Plaque behind Judge
  const courtSignTex = createStreetCanvasTex('#450a0a', '#fbbf24', 'DISTRICT & SESSIONS COURT', 'सत्यमेव जयते');
  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 1.65, 0.18),
    new THREE.MeshStandardMaterial({
      map: courtSignTex,
      emissiveMap: courtSignTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.35,
      roughness: 0.32,
    }),
  );
  plaque.position.set(0, 5.1, -9.4);
  root.add(plaque);

  // Elevated Judge Dais & Carved Mahogany Bench
  const dais = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.85, 4.2), teakMat);
  dais.position.set(0, 0.425, -6.2);
  const bench = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.25, 1.1), railMat);
  bench.position.set(0, 1.45, -4.6);
  const benchTop = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.14, 1.25), teakMat);
  benchTop.position.set(0, 2.12, -4.6);
  const soundBlock = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.08, 12), teakMat);
  soundBlock.position.set(0.55, 2.22, -4.3);
  const scalesPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.65, 8), goldMat);
  scalesPole.position.set(-1.8, 2.5, -4.4);
  const scalesBeam = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.04), goldMat);
  scalesBeam.position.set(-1.8, 2.8, -4.4);
  root.add(dais, bench, benchTop, soundBlock, scalesPole, scalesBeam);

  // Judge Humanoid on dais facing +Z
  const judgeRig = createHumanoidModel({
    shirtColor: 0x0f172a,
    pantsColor: 0x0f172a,
    skinColor: 0xc98b63,
    variant: 'judge',
  });
  judgeRig.root.position.set(0, 0.85, -5.8);
  judgeRig.root.rotation.y = Math.PI;
  // Wooden Gavel held in Judge's right hand
  const gavelHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.32, 8), railMat);
  gavelHandle.rotation.x = Math.PI / 2;
  gavelHandle.position.set(0, 0, -0.14);
  const gavelHead = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.18, 10), teakMat);
  gavelHead.rotation.z = Math.PI / 2;
  gavelHead.position.set(0, 0, -0.28);
  judgeRig.weaponMount.add(gavelHandle, gavelHead);
  root.add(judgeRig.root);

  // Wooden Kathgara (Witness Box) at (0, 0.25, 1.5) relative to stage
  const kFloor = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.25, 2.3), teakMat);
  kFloor.position.set(0, 0.125, 1.5);
  root.add(kFloor);
  // 4 corner posts + top rails
  [
    [-1.02, 0.45],
    [1.02, 0.45],
    [-1.02, 2.55],
    [1.02, 2.55],
  ].forEach(([px, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.35, 0.14), railMat);
    post.position.set(px, 0.92, pz);
    root.add(post);
  });
  const kFrontRail = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.14, 0.16), railMat);
  kFrontRail.position.set(0, 1.55, 0.45);
  const kLeftRail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 2.15), railMat);
  kLeftRail.position.set(-1.02, 1.55, 1.5);
  const kRightRail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 2.15), railMat);
  kRightRail.position.set(1.02, 1.55, 1.5);
  const kFrontPanel = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.05, 0.1), teakMat);
  kFrontPanel.position.set(0, 0.78, 0.45);
  const kLeftPanel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.05, 1.9), teakMat);
  kLeftPanel.position.set(-1.02, 0.78, 1.5);
  const kRightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.05, 1.9), teakMat);
  kRightPanel.position.set(1.02, 0.78, 1.5);
  root.add(kFrontRail, kLeftRail, kRightRail, kFrontPanel, kLeftPanel, kRightPanel);

  // Defense Lawyer (Vakil) Stand on West side
  const lawyerDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 1.1), railMat);
  lawyerDesk.position.set(-4.2, 0.5, -1.2);
  lawyerDesk.rotation.y = 0.4;
  root.add(lawyerDesk);

  const lawyerRig = createHumanoidModel({
    shirtColor: 0x111827,
    pantsColor: 0x0f172a,
    skinColor: 0xd19a72,
    variant: 'vakil',
  });
  lawyerRig.root.position.set(-4.2, 0, -0.35);
  lawyerRig.root.rotation.y = 0.45;
  root.add(lawyerRig.root);

  // Arresting Police Inspector Stand on East side
  const inspDesk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 1.1), railMat);
  inspDesk.position.set(4.2, 0.5, -1.2);
  inspDesk.rotation.y = -0.4;
  root.add(inspDesk);

  const inspectorRig = createHumanoidModel({
    shirtColor: 0xa88f5c,
    pantsColor: 0x8d7548,
    skinColor: 0xc98b63,
    isPolice: true,
  });
  inspectorRig.root.position.set(4.2, 0, -0.35);
  inspectorRig.root.rotation.y = -0.45;
  root.add(inspectorRig.root);

  // Public Gallery Benches + Red Carpet Aisle
  const carpet = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 13.0), crimsonMat);
  carpet.position.set(0, 0.02, 2.2);
  root.add(carpet);
  [5.0, 7.2].forEach((bz) => {
    [-4.8, 4.8].forEach((bx) => {
      const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.45, 0.75), railMat);
      benchSeat.position.set(bx, 0.45, bz);
      const benchBack = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.55, 0.12), railMat);
      benchBack.position.set(bx, 0.9, bz + 0.34);
      root.add(benchSeat, benchBack);
    });
  });

  // Overhead Brass Ceiling Fan
  const fanGroup = new THREE.Group();
  fanGroup.position.set(0, 6.7, -0.5);
  const fanRod = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), goldMat);
  fanRod.position.y = 0.7;
  const fanHub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 12), teakMat);
  fanGroup.add(fanRod, fanHub);
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.04, 0.26), teakMat);
    const angle = (i * Math.PI * 2) / 3;
    blade.position.set(Math.cos(angle) * 0.95, 0, Math.sin(angle) * 0.95);
    blade.rotation.y = -angle;
    fanGroup.add(blade);
  }
  root.add(fanGroup);

  scene.add(root);

  return {
    root,
    judgeRig,
    lawyerRig,
    inspectorRig,
    fanGroup,
    kathgaraPos: new THREE.Vector3(cx, 0.25, cz + 1.5),
    lightAnchor: new THREE.Vector3(cx, 6.4, cz - 1.2),
  };
}

/**
 * Builds an Indian Police Prisoner Transport Van (barred rear windows + red/blue beacon)
 * for the Busted -> Thana -> District Court -> Thana/Jail custody cutscenes.
 */
export function createPrisonerVan(): VehicleRig {
  const root = new THREE.Group();
  const navyMat = new THREE.MeshStandardMaterial({ color: 0x0f2547, roughness: 0.42, metalness: 0.35 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.32 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.15, metalness: 0.6 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.3 });

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.45, 5.6), ironMat);
  chassis.position.y = 0.52;
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.22, 1.45, 1.85), whiteMat);
  cab.position.set(0, 1.42, -1.65);
  cab.castShadow = true;
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.68, 0.12), glassMat);
  windshield.position.set(0, 1.62, -2.56);
  const cargoBody = new THREE.Mesh(new THREE.BoxGeometry(2.28, 1.75, 3.45), navyMat);
  cargoBody.position.set(0, 1.58, 0.92);
  cargoBody.castShadow = true;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.32, 0.24, 3.46), whiteMat);
  stripe.position.set(0, 1.25, 0.92);

  // Iron-barred rear prisoner cage windows along both sides
  [-1.16, 1.16].forEach((sx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 2.2), ironMat);
    frame.position.set(sx, 1.85, 0.92);
    root.add(frame);
    for (let bz = -0.05; bz <= 1.9; bz += 0.28) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.62, 6), whiteMat);
      bar.position.set(sx * 1.01, 1.85, bz);
      root.add(bar);
    }
  });

  // Roof beacon bar
  const lightBarRed = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.22, 0.28),
    new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  );
  lightBarRed.position.set(-0.32, 2.28, -1.6);
  const lightBarBlue = new THREE.Mesh(
    new THREE.BoxGeometry(0.48, 0.22, 0.28),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
  );
  lightBarBlue.position.set(0.32, 2.28, -1.6);

  root.add(chassis, cab, windshield, cargoBody, stripe, lightBarRed, lightBarBlue);

  const wheels: THREE.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 14);
  wheelGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.32, 10);
  rimGeo.rotateZ(Math.PI / 2);
  [
    [-1.15, -1.72],
    [1.15, -1.72],
    [-1.15, 1.65],
    [1.15, 1.65],
  ].forEach(([wx, wz]) => {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(wx, 0.42, wz);
    const r = new THREE.Mesh(rimGeo, rimMat);
    w.add(r);
    root.add(w);
    wheels.push(w);
  });

  return { root, wheels, lightBarRed, lightBarBlue };
}

function createSwastikOrShubhLabhTex(mode: 'shubh' | 'labh' | 'swastik' | 'welcome'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = mode === 'welcome' ? 384 : 192;
  c.height = mode === 'welcome' ? 128 : 192;
  const ctx = c.getContext('2d')!;
  if (mode === 'welcome') {
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, c.width - 16, c.height - 16);
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 46px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WELCOME', c.width / 2, c.height / 2);
  } else if (mode === 'swastik') {
    ctx.fillStyle = '#fff7ed';
    ctx.fillRect(0, 0, 192, 192);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 176, 176);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(96, 40);
    ctx.lineTo(96, 152);
    ctx.moveTo(40, 96);
    ctx.lineTo(152, 96);
    ctx.moveTo(96, 40);
    ctx.lineTo(148, 40);
    ctx.moveTo(152, 96);
    ctx.lineTo(152, 148);
    ctx.moveTo(96, 152);
    ctx.lineTo(44, 152);
    ctx.moveTo(40, 96);
    ctx.lineTo(40, 44);
    ctx.stroke();
    ctx.fillStyle = '#dc2626';
    [
      [66, 66],
      [126, 66],
      [66, 126],
      [126, 126],
    ].forEach(([dx, dy]) => {
      ctx.beginPath();
      ctx.arc(dx, dy, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(0, 0, 192, 192);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 176, 176);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 54px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(mode === 'shubh' ? 'शुभ' : 'लाभ', 96, 78);
    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(mode === 'shubh' ? 'SHUBH' : 'LABH', 96, 140);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createDeityPaintingTex(deity: 'krishna' | 'ram' | 'ganesha'): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 320;
  const ctx = c.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 130, 18, 128, 150, 170);
  if (deity === 'krishna') {
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.55, '#1d4ed8');
    grad.addColorStop(1, '#0f172a');
  } else if (deity === 'ram') {
    grad.addColorStop(0, '#fde68a');
    grad.addColorStop(0.55, '#ea580c');
    grad.addColorStop(1, '#431407');
  } else {
    grad.addColorStop(0, '#fed7aa');
    grad.addColorStop(0.55, '#b91c1c');
    grad.addColorStop(1, '#450a0a');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 320);

  // Sacred golden aura halo
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(128, 128, 66, 0, Math.PI * 2);
  ctx.stroke();

  if (deity === 'krishna') {
    // Lord Krishna torso + blue face + golden crown + peacock feather + flute
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(70, 260);
    ctx.lineTo(186, 260);
    ctx.lineTo(164, 172);
    ctx.lineTo(92, 172);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(128, 132, 34, 0, Math.PI * 2);
    ctx.fill();
    // Crown & peacock feather
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(102, 86, 52, 18);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.ellipse(144, 62, 14, 24, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.arc(144, 62, 6, 0, Math.PI * 2);
    ctx.fill();
    // Flute
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(78, 166);
    ctx.lineTo(182, 148);
    ctx.stroke();
  } else if (deity === 'ram') {
    // Shree Ram emerald/saffron robe + golden crown + kodand bow
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(70, 260);
    ctx.lineTo(186, 260);
    ctx.lineTo(166, 170);
    ctx.lineTo(90, 170);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(128, 132, 33, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(100, 102);
    ctx.lineTo(128, 62);
    ctx.lineTo(156, 102);
    ctx.closePath();
    ctx.fill();
    // Tilak & Bow
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(126, 110, 4, 14);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(182, 165, 58, -1.2, 1.2);
    ctx.stroke();
  } else {
    // Lord Ganesha saffron dhoti + elephant head, ears & curved trunk + mukut
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(128, 224, 52, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.ellipse(82, 134, 24, 34, -0.2, 0, Math.PI * 2);
    ctx.ellipse(174, 134, 24, 34, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fdba74';
    ctx.beginPath();
    ctx.arc(128, 132, 36, 0, Math.PI * 2);
    ctx.fill();
    // Trunk
    ctx.strokeStyle = '#fdba74';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(128, 136);
    ctx.quadraticCurveTo(128, 180, 104, 184);
    ctx.stroke();
    // Golden Crown + Tilak
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(102, 100);
    ctx.lineTo(128, 62);
    ctx.lineTo(154, 100);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(128, 114, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
  ctx.fillRect(14, 274, 228, 34);
  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 20px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    deity === 'krishna' ? 'SHREE KRISHNA' : deity === 'ram' ? 'SHREE RAM' : 'SHREE GANESHA',
    128,
    291,
  );

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function addMarigoldGarland(parent: THREE.Group, startX: number, endX: number, y: number, z: number, sag = 0.45): void {
  const saffronMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.55 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
  const flowerGeo = new THREE.SphereGeometry(0.16, 8, 8);
  const leafGeo = new THREE.BoxGeometry(0.14, 0.22, 0.05);

  const count = Math.max(8, Math.round(Math.abs(endX - startX) * 2.2));
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const fx = THREE.MathUtils.lerp(startX, endX, t);
    const fy = y - Math.sin(t * Math.PI) * sag;
    const f = new THREE.Mesh(flowerGeo, i % 2 === 0 ? saffronMat : goldMat);
    f.position.set(fx, fy, z);
    parent.add(f);
    if (i % 3 === 1) {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(fx, fy - 0.14, z);
      parent.add(leaf);
    }
  }
}

function addIndianFamilyHouse(
  scene: THREE.Scene,
  colliders: BuildingCollider[],
  interiorLightSpots: InteriorLightSpot[],
  bx: number,
  bz: number,
): IndianFamilyHouseRig {
  const g = new THREE.Group();
  const creamWallMat = new THREE.MeshStandardMaterial({ color: 0xf5ebe0, roughness: 0.72 });
  const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.78 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.75 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35 });
  const courtyardMat = new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.82 });
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3416, roughness: 0.58 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.35 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.78, roughness: 0.25 });
  const sofaMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.75 });

  // Compound courtyard plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(38, 0.26, 38), courtyardMat);
  plinth.position.set(bx, 0.13, bz);
  plinth.receiveShadow = true;
  g.add(plinth);

  // Compound perimeter walls (with 8m open front entrance at z = bz + 18.6, x: bx-4..bx+4)
  const compFrontL = new THREE.Mesh(new THREE.BoxGeometry(15, 2.2, 0.5), creamWallMat);
  compFrontL.position.set(bx - 11.5, 1.25, bz + 18.6);
  const compFrontR = new THREE.Mesh(new THREE.BoxGeometry(15, 2.2, 0.5), creamWallMat);
  compFrontR.position.set(bx + 11.5, 1.25, bz + 18.6);
  const compBack = new THREE.Mesh(new THREE.BoxGeometry(38, 2.3, 0.5), creamWallMat);
  compBack.position.set(bx, 1.3, bz - 18.6);
  const compLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.3, 37.5), creamWallMat);
  compLeft.position.set(bx - 18.6, 1.3, bz);
  const compRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.3, 37.5), creamWallMat);
  compRight.position.set(bx + 18.6, 1.3, bz);
  g.add(compFrontL, compFrontR, compBack, compLeft, compRight);
  colliders.push({ minX: bx - 19, maxX: bx - 4, minZ: bz + 18.2, maxZ: bz + 19.0, height: 2.3 });
  colliders.push({ minX: bx + 4, maxX: bx + 19, minZ: bz + 18.2, maxZ: bz + 19.0, height: 2.3 });
  colliders.push({ minX: bx - 19, maxX: bx + 19, minZ: bz - 19.0, maxZ: bz - 18.2, height: 2.3 });
  colliders.push({ minX: bx - 19, maxX: bx - 18.2, minZ: bz - 18.6, maxZ: bz + 18.6, height: 2.3 });
  colliders.push({ minX: bx + 18.2, maxX: bx + 19, minZ: bz - 18.6, maxZ: bz + 18.6, height: 2.3 });

  // Compound entrance pillars + arch + Marigold garland + open iron gate leaves
  [-4.3, 4.3].forEach((px) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 4.2, 1.1), sandstoneMat);
    pillar.position.set(bx + px, 2.2, bz + 18.6);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 1.4), roofMat);
    cap.position.set(bx + px, 4.45, bz + 18.6);
    g.add(pillar, cap);
  });
  const gateArch = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.55, 0.7), roofMat);
  gateArch.position.set(bx, 4.35, bz + 18.6);
  g.add(gateArch);
  addMarigoldGarland(g, bx - 4.0, bx + 4.0, 4.0, bz + 19.05, 0.42);

  // Welcome sign above outer gate
  const welcomeTex = createSwastikOrShubhLabhTex('welcome');
  const welcomeBoard = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.05, 0.2),
    new THREE.MeshStandardMaterial({
      map: welcomeTex,
      emissiveMap: welcomeTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.35,
      roughness: 0.35,
    }),
  );
  welcomeBoard.position.set(bx, 4.95, bz + 18.7);
  g.add(welcomeBoard);

  // Open wrought-iron gate leaves swung inward cleanly (walkable)
  [-4.0, 4.0].forEach((gx) => {
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.4, 3.2), ironMat);
    leaf.position.set(bx + gx, 1.4, bz + 16.9);
    g.add(leaf);
  });

  // Prominent Custom House Nameplate beside entrance pillar (dynamically updated canvas)
  const nameplateCanvas = document.createElement('canvas');
  nameplateCanvas.width = 512;
  nameplateCanvas.height = 176;
  const nameplateCtx = nameplateCanvas.getContext('2d')!;
  const nameplateTex = new THREE.CanvasTexture(nameplateCanvas);
  nameplateTex.colorSpace = THREE.SRGBColorSpace;
  nameplateTex.anisotropy = 4;

  const drawNameplate = (houseName: string) => {
    const cleanName = (houseName || 'Apna Ghar').trim().slice(0, 28);
    nameplateCtx.fillStyle = '#3b1c08';
    nameplateCtx.fillRect(0, 0, 512, 176);
    nameplateCtx.strokeStyle = '#f59e0b';
    nameplateCtx.lineWidth = 10;
    nameplateCtx.strokeRect(8, 8, 496, 160);
    nameplateCtx.strokeStyle = '#fde68a';
    nameplateCtx.lineWidth = 2;
    nameplateCtx.strokeRect(18, 18, 476, 140);
    nameplateCtx.fillStyle = '#fcd34d';
    nameplateCtx.font = 'bold 20px sans-serif';
    nameplateCtx.textAlign = 'center';
    nameplateCtx.textBaseline = 'middle';
    nameplateCtx.fillText('✦ SUBH GRAH PRAVESH · WELCOME ✦', 256, 46);
    nameplateCtx.fillStyle = '#ffffff';
    nameplateCtx.font = 'bold 42px serif';
    nameplateCtx.fillText(cleanName, 256, 108, 456);
    nameplateTex.needsUpdate = true;
  };
  drawNameplate('Apna Ghar');

  const nameplateMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 1.5, 0.22),
    new THREE.MeshStandardMaterial({
      map: nameplateTex,
      emissiveMap: nameplateTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.42,
      roughness: 0.25,
      metalness: 0.35,
    }),
  );
  nameplateMesh.position.set(bx + 6.9, 2.55, bz + 18.85);
  g.add(nameplateMesh);

  // Main House Floor (20m wide x 18m deep, centered at (bx, bz))
  const houseFloor = new THREE.Mesh(new THREE.BoxGeometry(20.4, 0.36, 18.4), floorMat);
  houseFloor.position.set(bx, 0.18, bz);
  houseFloor.receiveShadow = true;
  g.add(houseFloor);

  // House Walls: Back, Left, Right, and Front with wide 5m open doorway (bx-2.5 .. bx+2.5)
  const houseBack = new THREE.Mesh(new THREE.BoxGeometry(20.4, 5.2, 0.7), creamWallMat);
  houseBack.position.set(bx, 2.78, bz - 9.0);
  houseBack.castShadow = true;
  const houseLeft = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.2, 18.4), creamWallMat);
  houseLeft.position.set(bx - 10.0, 2.78, bz);
  houseLeft.castShadow = true;
  const houseRight = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.2, 18.4), creamWallMat);
  houseRight.position.set(bx + 10.0, 2.78, bz);
  houseRight.castShadow = true;
  const houseFrontL = new THREE.Mesh(new THREE.BoxGeometry(7.7, 5.2, 0.7), creamWallMat);
  houseFrontL.position.set(bx - 6.35, 2.78, bz + 9.0);
  const houseFrontR = new THREE.Mesh(new THREE.BoxGeometry(7.7, 5.2, 0.7), creamWallMat);
  houseFrontR.position.set(bx + 6.35, 2.78, bz + 9.0);
  const houseHeader = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.5, 0.75), sandstoneMat);
  houseHeader.position.set(bx, 4.65, bz + 9.0);
  const houseRoof = new THREE.Mesh(new THREE.BoxGeometry(22.2, 0.7, 20.6), roofMat);
  houseRoof.position.set(bx, 5.7, bz + 0.3);
  houseRoof.castShadow = true;
  g.add(houseBack, houseLeft, houseRight, houseFrontL, houseFrontR, houseHeader, houseRoof);

  colliders.push({ minX: bx - 10.4, maxX: bx + 10.4, minZ: bz - 9.4, maxZ: bz - 8.6, height: 5.4 });
  colliders.push({ minX: bx - 10.4, maxX: bx - 9.6, minZ: bz - 9.2, maxZ: bz + 9.2, height: 5.4 });
  colliders.push({ minX: bx + 9.6, maxX: bx + 10.4, minZ: bz - 9.2, maxZ: bz + 9.2, height: 5.4 });
  colliders.push({ minX: bx - 10.4, maxX: bx - 2.5, minZ: bz + 8.6, maxZ: bz + 9.4, height: 5.4 });
  colliders.push({ minX: bx + 2.5, maxX: bx + 10.4, minZ: bz + 8.6, maxZ: bz + 9.4, height: 5.4 });

  // Inner partition wall separating Bedroom (East wing) with wide walkable doorway
  const bedroomDiv = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.8, 10.5), creamWallMat);
  bedroomDiv.position.set(bx + 2.8, 2.58, bz - 3.6);
  g.add(bedroomDiv);
  colliders.push({ minX: bx + 2.5, maxX: bx + 3.1, minZ: bz - 8.8, maxZ: bz + 1.6, height: 4.8 });

  // Auspicious Shubh Labh & Swastik Plaques + Marigold Door Toran + Veranda Welcome Mat
  const shubhMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.1, 0.14),
    new THREE.MeshStandardMaterial({ map: createSwastikOrShubhLabhTex('shubh'), roughness: 0.4 }),
  );
  shubhMesh.position.set(bx - 3.3, 2.8, bz + 9.42);
  const labhMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.1, 0.14),
    new THREE.MeshStandardMaterial({ map: createSwastikOrShubhLabhTex('labh'), roughness: 0.4 }),
  );
  labhMesh.position.set(bx + 3.3, 2.8, bz + 9.42);
  const swastikMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 1.15, 0.16),
    new THREE.MeshStandardMaterial({ map: createSwastikOrShubhLabhTex('swastik'), roughness: 0.35 }),
  );
  swastikMesh.position.set(bx, 4.62, bz + 9.44);
  g.add(shubhMesh, labhMesh, swastikMesh);

  addMarigoldGarland(g, bx - 2.5, bx + 2.5, 3.85, bz + 9.5, 0.38);

  // Living Room Sofa Set, Carpet, Center Table
  const rug = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.05, 4.2), sofaMat);
  rug.position.set(bx - 2.8, 0.38, bz + 1.6);
  const sofa = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.95, 1.3), sofaMat);
  sofa.position.set(bx - 2.8, 0.82, bz + 3.6);
  const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 1.2), woodMat);
  coffeeTable.position.set(bx - 2.8, 0.64, bz + 1.5);
  g.add(rug, sofa, coffeeTable);
  colliders.push({ minX: bx - 4.9, maxX: bx - 0.7, minZ: bz + 2.9, maxZ: bz + 4.3, height: 1.0 });

  // 3 Framed Hindu Deity Paintings in Living Room (Lord Krishna, Lord Ram, Lord Ganesha)
  const deities: { deity: 'krishna' | 'ram' | 'ganesha'; x: number; y: number; z: number; ry: number }[] = [
    { deity: 'krishna', x: bx - 3.0, y: 2.95, z: bz - 8.58, ry: 0 },
    { deity: 'ram', x: bx - 0.1, y: 2.95, z: bz - 8.58, ry: 0 },
    { deity: 'ganesha', x: bx - 9.58, y: 2.95, z: bz - 0.5, ry: Math.PI / 2 },
  ];
  for (const d of deities) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.95, 2.35, 0.14), goldMat);
    frame.position.set(d.x, d.y, d.z);
    frame.rotation.y = d.ry;
    const deityTex = createDeityPaintingTex(d.deity);
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 2.1),
      new THREE.MeshStandardMaterial({
        map: deityTex,
        emissiveMap: deityTex,
        emissive: 0xffffff,
        emissiveIntensity: 0.22,
        roughness: 0.45,
      }),
    );
    art.position.set(0, 0, 0.08);
    frame.add(art);
    g.add(frame);
  }

  // Home Puja Corner (North-West corner of Living Room)
  const pujaPos = new THREE.Vector3(bx - 7.2, 0.36, bz - 5.2);
  const mandirBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.35, 1.3), woodMat);
  mandirBase.position.set(bx - 7.6, 1.02, bz - 7.6);
  const mandirRoof = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1.15, 4), goldMat);
  mandirRoof.rotation.y = Math.PI / 4;
  mandirRoof.position.set(bx - 7.6, 2.35, bz - 7.6);
  const diyaGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xfef08a }),
  );
  diyaGlow.position.set(bx - 7.6, 1.82, bz - 7.1);
  const pujaRing = new THREE.Mesh(
    new THREE.RingGeometry(1.0, 1.35, 24),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide }),
  );
  pujaRing.rotation.x = -Math.PI / 2;
  pujaRing.position.set(pujaPos.x, 0.39, pujaPos.z);
  g.add(mandirBase, mandirRoof, diyaGlow, pujaRing);
  colliders.push({ minX: bx - 8.8, maxX: bx - 6.4, minZ: bz - 8.4, maxZ: bz - 6.8, height: 2.5 });

  // Bedroom (East Wing: Double Bed + Quilt + Pillows + Bedside Lamp)
  const bedPos = new THREE.Vector3(bx + 6.4, 0.36, bz - 2.6);
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.65, 3.8), woodMat);
  bedFrame.position.set(bx + 7.4, 0.68, bz - 6.2);
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(3.15, 0.3, 3.55),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.78 }),
  );
  mattress.position.set(bx + 7.4, 1.12, bz - 6.2);
  const quilt = new THREE.Mesh(
    new THREE.BoxGeometry(3.18, 0.14, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }),
  );
  quilt.position.set(bx + 7.4, 1.24, bz - 5.5);
  const bedRing = new THREE.Mesh(
    new THREE.RingGeometry(1.0, 1.35, 24),
    new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide }),
  );
  bedRing.rotation.x = -Math.PI / 2;
  bedRing.position.set(bedPos.x, 0.39, bedPos.z);
  g.add(bedFrame, mattress, quilt, bedRing);
  colliders.push({ minX: bx + 5.6, maxX: bx + 9.2, minZ: bz - 8.2, maxZ: bz - 4.2, height: 1.4 });

  // Wardrobe / Almirah (South-West Living Room corner)
  const wardrobePos = new THREE.Vector3(bx - 7.0, 0.36, bz + 5.2);
  const almirah = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.1, 2.6), woodMat);
  almirah.position.set(bx - 9.0, 1.9, bz + 5.2);
  const almirahMirror = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 2.2, 0.9),
    new THREE.MeshStandardMaterial({ color: 0xbae6fd, metalness: 0.85, roughness: 0.15 }),
  );
  almirahMirror.position.set(bx - 8.32, 2.0, bz + 5.2);
  const wardrobeRing = new THREE.Mesh(
    new THREE.RingGeometry(1.0, 1.35, 24),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }),
  );
  wardrobeRing.rotation.x = -Math.PI / 2;
  wardrobeRing.position.set(wardrobePos.x, 0.39, wardrobePos.z);
  g.add(almirah, almirahMirror, wardrobeRing);
  colliders.push({ minX: bx - 9.65, maxX: bx - 8.35, minZ: bz + 3.85, maxZ: bz + 6.55, height: 3.1 });

  // Warm interior lighting registration
  interiorLightSpots.push({ x: bx, y: 4.5, z: bz + 0.5, color: 0xffedd5, intensity: 22, distance: 26 });

  scene.add(g);

  return {
    spawnPos: new THREE.Vector3(bx, 0.18, bz + 20.6),
    pujaPos,
    bedPos,
    wardrobePos,
    homeCenter: new THREE.Vector3(bx, 0.36, bz),
    nameplateMesh,
    updateNameplate: drawNameplate,
  };
}




