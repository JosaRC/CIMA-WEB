import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { animate, frame, motionValue, press } from 'motion';
import { pixel } from '../analytics/pixel.js';

export function initForklift3D(containerElement) {
  if (!containerElement) return;

  const canvas = containerElement.querySelector('canvas');
  if (!canvas) return;

  const ORBIT_SPEED = 0.08;
  const MAX_RELEASE_SPEED = 2.2;

  // Renderer con tone mapping fílmico
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 150);
  camera.position.set(4.2, 2.4, 5.8);

  // --- SHADER DE CIELO PROCEDURAL CON REFLEXIÓN DE ESTUDIO ---
  const skyShader = `
    varying vec3 vDirection;
    uniform vec3 sunDirection;
    uniform float sunAngularSize;
    uniform vec3 sunColor;
    uniform float sunIntensity;
    uniform vec3 zenithColor;
    uniform float cloudCoverage;
    uniform vec3 horizonColor;
    uniform float cloudScale;
    uniform vec3 groundColor;
    uniform float groundScale;

    float hash(vec2 point) {
      vec3 q = fract(vec3(point.x, point.y, point.x) * 0.1031);
      q += dot(q, q.yzx + 33.33);
      return fract((q.x + q.y) * q.z);
    }

    float valueNoise(vec2 point) {
      vec2 cell = floor(point);
      vec2 local = fract(point);
      vec2 weight = local * local * (3.0 - 2.0 * local);
      float a = hash(cell);
      float b = hash(cell + vec2(1.0, 0.0));
      float c = hash(cell + vec2(0.0, 1.0));
      float d = hash(cell + vec2(1.0, 1.0));
      return mix(mix(a, b, weight.x), mix(c, d, weight.x), weight.y);
    }

    float fbm(vec2 point) {
      float sum = 0.0;
      float amplitude = 0.5;
      for (int octave = 0; octave < 4; octave++) {
        sum += amplitude * valueNoise(point);
        point = point * 2.03 + vec2(17.0, 9.0);
        amplitude *= 0.5;
      }
      return sum;
    }

    vec2 cloudLayer(vec3 direction, vec3 sun) {
      float height = max(direction.y, 0.035);
      vec2 plane = direction.xz / height * cloudScale;
      float base = fbm(plane);
      float detail = fbm(plane * 2.8 + vec2(base * 1.4));
      float density = smoothstep(
        cloudCoverage,
        cloudCoverage + 0.28,
        base * 0.75 + detail * 0.35
      );
      float horizonFade = smoothstep(0.0, 0.12, direction.y);
      float lit = pow(
        clamp(dot(direction, sun) * 0.5 + 0.5, 0.0, 1.0),
        3.0
      );
      return vec2(density * horizonFade, lit);
    }

    float checkerBox(vec2 point, vec2 width) {
      vec2 pattern =
        2.0 *
        (
          abs(fract((point - 0.5 * width) * 0.5) - 0.5) -
          abs(fract((point + 0.5 * width) * 0.5) - 0.5)
        ) /
        width;
      return 0.5 - 0.5 * pattern.x * pattern.y;
    }

    vec3 ground(vec3 direction, vec3 sun) {
      float depth = max(-direction.y, 0.001);
      vec2 plane = direction.xz / depth * groundScale;
      float fade = 1.0 / (1.0 + dot(plane, plane) * 0.005);
      vec3 color =
        groundColor *
        (
          1.0 +
          checkerBox(plane, fwidth(plane) + vec2(1e-3)) * 2.6
        );
      color *= 0.85 + fbm(plane * 0.25) * 0.5;
      color +=
        sunColor *
        0.05 *
        clamp(
          dot(normalize(vec3(plane.x, 0.0, plane.y)), sun),
          0.0,
          1.0
        );
      return mix(horizonColor * 0.22, color, fade);
    }

    void main() {
      vec3 direction = normalize(vDirection);
      vec3 sun = normalize(sunDirection);
      float up = clamp(direction.y, 0.0, 1.0);
      vec3 color = mix(
        horizonColor,
        zenithColor,
        pow(up, 0.75)
      );
      float sunDot = clamp(dot(direction, sun), 0.0, 1.0);
      color += sunColor * pow(sunDot, 50.0) * 0.25;
      color += sunColor * pow(sunDot, 650.0) * 0.8;
      float disk = smoothstep(
        cos(sunAngularSize * 2.2),
        cos(sunAngularSize),
        sunDot
      );
      color += sunColor * sunIntensity * disk;

      vec2 cloud = cloudLayer(direction, sun);
      vec3 cloudColor = mix(
        vec3(0.24, 0.28, 0.38),
        sunColor * 1.05,
        cloud.y
      );
      color = mix(color, cloudColor, cloud.x * (1.0 - disk));

      float horizon = smoothstep(-0.14, 0.02, direction.y);
      color = mix(ground(direction, sun), color, horizon);
      gl_FragColor = vec4(color, 1.0);

      #ifdef TONEMAP_SKY
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      #endif
    }
  `;

  const skyVertexShader = `
    varying vec3 vDirection;
    void main() {
      vDirection = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const skyUniforms = {
    sunDirection: { value: new THREE.Vector3(-0.72, 0.35, -0.6).normalize() },
    sunAngularSize: { value: 0.022 },
    sunColor: { value: new THREE.Color().setRGB(1.0, 0.92, 0.78) },
    sunIntensity: { value: 20 },
    zenithColor: { value: new THREE.Color().setRGB(0.04, 0.09, 0.22) },
    cloudCoverage: { value: 0.52 },
    horizonColor: { value: new THREE.Color().setRGB(0.26, 0.36, 0.54) },
    cloudScale: { value: 0.85 },
    groundColor: { value: new THREE.Color().setRGB(0.04, 0.045, 0.055) },
    groundScale: { value: 4.8 },
  };

  function createSkyMaterial(toneMapped) {
    return new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      vertexShader: skyVertexShader,
      fragmentShader: skyShader,
      defines: toneMapped ? { TONEMAP_SKY: "" } : {},
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped,
    });
  }

  const skyGeometry = new THREE.SphereGeometry(60, 48, 24);
  const sky = new THREE.Mesh(skyGeometry, createSkyMaterial(true));
  sky.frustumCulled = false;
  scene.add(sky);

  // Cubemap Environment para reflejos realistas
  const environmentScene = new THREE.Scene();
  const environmentSky = new THREE.Mesh(skyGeometry, createSkyMaterial(false));
  environmentScene.add(environmentSky);

  const environmentTarget = new THREE.WebGLCubeRenderTarget(512, {
    type: THREE.HalfFloatType,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
  });
  const environmentCamera = new THREE.CubeCamera(0.1, 120, environmentTarget);
  environmentCamera.update(renderer, environmentScene);
  scene.environment = environmentTarget.texture;

  // --- LUCES DE ESTUDIO Y TRABAJO ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
  keyLight.position.set(5, 8, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x7ea2d6, 1.2);
  fillLight.position.set(-5, 4, -4);
  scene.add(fillLight);

  // Piso reflectante industrial
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c10,
    roughness: 0.35,
    metalness: 0.4
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -0.01;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // Rejilla de estudio sutil
  const gridHelper = new THREE.GridHelper(20, 20, 0xf59e0b, 0x1f2937);
  gridHelper.position.y = 0.001;
  scene.add(gridHelper);

  // --- MATERIALES DEL MONTACARGAS ---
  const chassisMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf59e0b, // Amarillo Industrial CIMA
    metalness: 0.75,
    roughness: 0.22,
    clearcoat: 0.45,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.4,
  });

  const steelDarkMat = new THREE.MeshStandardMaterial({
    color: 0x181c24,
    metalness: 0.85,
    roughness: 0.35,
  });

  const chromeForksMat = new THREE.MeshPhysicalMaterial({
    color: 0xdde3ea,
    metalness: 0.98,
    roughness: 0.08,
    reflectivity: 0.95,
    envMapIntensity: 1.6
  });

  const rubberTireMat = new THREE.MeshStandardMaterial({
    color: 0x111317,
    roughness: 0.85,
    metalness: 0.08
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.8,
    roughness: 0.3
  });

  const lightGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

  const beaconAmberMat = new THREE.MeshBasicMaterial({
    color: 0xffa500
  });

  // --- GRUPO PRINCIPAL DEL MONTACARGAS ---
  const forkliftGroup = new THREE.Group();
  scene.add(forkliftGroup);

  // 1. Chasis Base
  const chassisBaseGeo = new THREE.BoxGeometry(2.2, 0.55, 1.3);
  const chassisBase = new THREE.Mesh(chassisBaseGeo, chassisMaterial);
  chassisBase.position.set(0, 0.45, 0);
  chassisBase.castShadow = true;
  chassisBase.receiveShadow = true;
  forkliftGroup.add(chassisBase);

  // 2. Contrapeso Trasero Curvado
  const counterweightGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.7, 16, 1, false, -Math.PI / 2, Math.PI);
  const counterweight = new THREE.Mesh(counterweightGeo, chassisMaterial);
  counterweight.rotation.y = Math.PI / 2;
  counterweight.position.set(-1.05, 0.58, 0);
  counterweight.castShadow = true;
  forkliftGroup.add(counterweight);

  // Placa CIMA en Contrapeso Trasero
  const cimaPlateGeo = new THREE.BoxGeometry(0.04, 0.22, 0.7);
  const cimaPlateMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.2
  });
  const cimaPlate = new THREE.Mesh(cimaPlateGeo, cimaPlateMat);
  cimaPlate.position.set(-1.18, 0.65, 0);
  forkliftGroup.add(cimaPlate);

  // 3. Jaula de Protección ROPS (4 postes tubulares + techo de rejilla)
  const cagePillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.45, 12);
  const p1 = new THREE.Mesh(cagePillarGeo, steelDarkMat);
  p1.position.set(0.65, 1.45, 0.55);
  p1.castShadow = true;
  forkliftGroup.add(p1);

  const p2 = new THREE.Mesh(cagePillarGeo, steelDarkMat);
  p2.position.set(0.65, 1.45, -0.55);
  p2.castShadow = true;
  forkliftGroup.add(p2);

  const p3 = new THREE.Mesh(cagePillarGeo, steelDarkMat);
  p3.position.set(-0.65, 1.45, 0.55);
  p3.castShadow = true;
  forkliftGroup.add(p3);

  const p4 = new THREE.Mesh(cagePillarGeo, steelDarkMat);
  p4.position.set(-0.65, 1.45, -0.55);
  p4.castShadow = true;
  forkliftGroup.add(p4);

  // Techo de la jaula
  const roofRimGeo = new THREE.BoxGeometry(1.35, 0.05, 1.15);
  const roofRim = new THREE.Mesh(roofRimGeo, steelDarkMat);
  roofRim.position.set(0, 2.18, 0);
  roofRim.castShadow = true;
  forkliftGroup.add(roofRim);

  // Barras de rejilla superior
  for (let b = -0.45; b <= 0.45; b += 0.15) {
    const barGeo = new THREE.BoxGeometry(1.28, 0.03, 0.04);
    const bar = new THREE.Mesh(barGeo, steelDarkMat);
    bar.position.set(0, 2.18, b);
    forkliftGroup.add(bar);
  }

  // Baliza Ámbar Estroboscópica sobre el techo
  const beaconGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.14, 12);
  const beaconMesh = new THREE.Mesh(beaconGeo, beaconAmberMat);
  beaconMesh.position.set(-0.35, 2.3, 0);
  forkliftGroup.add(beaconMesh);

  // 4. Asiento Ergonómico y Volante
  const seatBaseGeo = new THREE.BoxGeometry(0.48, 0.12, 0.44);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e2024, roughness: 0.9 });
  const seatBase = new THREE.Mesh(seatBaseGeo, seatMat);
  seatBase.position.set(-0.15, 0.85, 0);
  forkliftGroup.add(seatBase);

  const seatBackGeo = new THREE.BoxGeometry(0.1, 0.55, 0.44);
  const seatBack = new THREE.Mesh(seatBackGeo, seatMat);
  seatBack.position.set(-0.35, 1.12, 0);
  seatBack.rotation.z = -0.12;
  forkliftGroup.add(seatBack);

  // Columna de dirección y Volante
  const steerColumnGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8);
  const steerColumn = new THREE.Mesh(steerColumnGeo, steelDarkMat);
  steerColumn.position.set(0.35, 1.05, 0);
  steerColumn.rotation.z = -0.45;
  forkliftGroup.add(steerColumn);

  const wheelGeo = new THREE.TorusGeometry(0.14, 0.022, 8, 20);
  const wheelMesh = new THREE.Mesh(wheelGeo, steelDarkMat);
  wheelMesh.position.set(0.24, 1.25, 0);
  wheelMesh.rotation.y = Math.PI / 2;
  wheelMesh.rotation.x = -0.45;
  forkliftGroup.add(wheelMesh);

  // Palancas hidráulicas
  for (let l = -0.15; l <= 0.15; l += 0.1) {
    const leverGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6);
    const lever = new THREE.Mesh(leverGeo, steelDarkMat);
    lever.position.set(0.32, 1.05, 0.28 + l);
    lever.rotation.z = 0.25;
    forkliftGroup.add(lever);

    const leverKnobGeo = new THREE.SphereGeometry(0.026, 8, 8);
    const knob = new THREE.Mesh(leverKnobGeo, chassisMaterial);
    knob.position.set(0.29, 1.16, 0.28 + l);
    forkliftGroup.add(knob);
  }

  // Tanque de Gas LP trasero
  const tankGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.75, 16);
  const tankMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
  const tankMesh = new THREE.Mesh(tankGeo, tankMat);
  tankMesh.position.set(-0.72, 1.1, 0);
  tankMesh.rotation.x = Math.PI / 2;
  tankMesh.castShadow = true;
  forkliftGroup.add(tankMesh);

  // 5. MÁSTIL VERTICAL FRONTAL
  const mastOuterGroup = new THREE.Group();
  mastOuterGroup.position.set(1.15, 0, 0);
  forkliftGroup.add(mastOuterGroup);

  // Rieles verticales de acero
  const railGeo = new THREE.BoxGeometry(0.09, 2.3, 0.1);
  const railL = new THREE.Mesh(railGeo, steelDarkMat);
  railL.position.set(0, 1.25, 0.38);
  railL.castShadow = true;
  mastOuterGroup.add(railL);

  const railR = new THREE.Mesh(railGeo, steelDarkMat);
  railR.position.set(0, 1.25, -0.38);
  railR.castShadow = true;
  mastOuterGroup.add(railR);

  // Travesaños del mástil
  const crossGeo = new THREE.BoxGeometry(0.08, 0.08, 0.82);
  const crossTop = new THREE.Mesh(crossGeo, steelDarkMat);
  crossTop.position.set(0, 2.35, 0);
  mastOuterGroup.add(crossTop);

  const crossMid = new THREE.Mesh(crossGeo, steelDarkMat);
  crossMid.position.set(0, 1.25, 0);
  mastOuterGroup.add(crossMid);

  // Pistón Hidráulico Central Cromado
  const pistonGeo = new THREE.CylinderGeometry(0.045, 0.045, 2.1, 16);
  const pistonMesh = new THREE.Mesh(pistonGeo, chromeForksMat);
  pistonMesh.position.set(-0.02, 1.2, 0);
  mastOuterGroup.add(pistonMesh);

  // 6. CARRO PORTA-HORQUILLAS Y HORQUILLAS ELEVABLES
  const carriageGroup = new THREE.Group();
  carriageGroup.position.set(0.08, 0.22, 0); // Posición inicial baja
  mastOuterGroup.add(carriageGroup);

  // Placa soporte del carro
  const backrestGeo = new THREE.BoxGeometry(0.06, 0.7, 0.76);
  const backrest = new THREE.Mesh(backrestGeo, steelDarkMat);
  backrest.position.set(0, 0.35, 0);
  backrest.castShadow = true;
  carriageGroup.add(backrest);

  // Uñas / Horquillas forjadas de acero cromado reflectivo
  function createFork(zPos) {
    const forkGroup = new THREE.Group();

    // Vástago vertical de la horquilla
    const verticalShank = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.68, 0.1),
      chromeForksMat
    );
    verticalShank.position.set(0.04, 0.34, 0);
    verticalShank.castShadow = true;
    forkGroup.add(verticalShank);

    // Hoja horizontal (tine) larga
    const horizontalBlade = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.04, 0.1),
      chromeForksMat
    );
    horizontalBlade.position.set(0.64, 0.02, 0);
    horizontalBlade.castShadow = true;
    forkGroup.add(horizontalBlade);

    forkGroup.position.set(0, 0, zPos);
    return forkGroup;
  }

  const forkL = createFork(0.24);
  const forkR = createFork(-0.24);
  carriageGroup.add(forkL);
  carriageGroup.add(forkR);

  // Carga demostrativa en horquillas: Tarima industrial de madera con caja CIMA
  const palletGroup = new THREE.Group();
  palletGroup.position.set(0.68, 0.06, 0);

  const palletWoodMat = new THREE.MeshStandardMaterial({ color: 0x926644, roughness: 0.8 });
  const palletPlankGeo = new THREE.BoxGeometry(0.9, 0.028, 0.9);
  const palletPlank = new THREE.Mesh(palletPlankGeo, palletWoodMat);
  palletGroup.add(palletPlank);

  // Caja de carga automotriz con marca CIMA
  const cargoBoxGeo = new THREE.BoxGeometry(0.75, 0.65, 0.75);
  const cargoBoxMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.4,
    roughness: 0.4
  });
  const cargoBox = new THREE.Mesh(cargoBoxGeo, cargoBoxMat);
  cargoBox.position.set(0, 0.35, 0);
  cargoBox.castShadow = true;
  palletGroup.add(cargoBox);

  // Franja reflectante en la caja
  const stripeGeo = new THREE.BoxGeometry(0.76, 0.1, 0.76);
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2 });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(0, 0.35, 0);
  palletGroup.add(stripe);

  carriageGroup.add(palletGroup);

  // 7. FAROS DE TRABAJO FRONTALES LED CON FOCOS REALES
  const headlampGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const headlampL = new THREE.Mesh(headlampGeo, lightGlowMat);
  headlampL.position.set(1.15, 1.9, 0.45);
  forkliftGroup.add(headlampL);

  const headlampR = new THREE.Mesh(headlampGeo, lightGlowMat);
  headlampR.position.set(1.15, 1.9, -0.45);
  forkliftGroup.add(headlampR);

  const spotLightL = new THREE.SpotLight(0xffffff, 4.5, 12, Math.PI / 5, 0.4, 1);
  spotLightL.position.set(1.2, 1.9, 0.45);
  spotLightL.target.position.set(5, 0, 0.45);
  forkliftGroup.add(spotLightL);
  forkliftGroup.add(spotLightL.target);

  const spotLightR = new THREE.SpotLight(0xffffff, 4.5, 12, Math.PI / 5, 0.4, 1);
  spotLightR.position.set(1.2, 1.9, -0.45);
  spotLightR.target.position.set(5, 0, -0.45);
  forkliftGroup.add(spotLightR);
  forkliftGroup.add(spotLightR.target);

  // 8. RUEDAS INDUSTRIALES
  function createWheel(radius, width, xPos, zPos) {
    const wheelGroup = new THREE.Group();

    // Llanta de caucho
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
    const tireMesh = new THREE.Mesh(tireGeo, rubberTireMat);
    tireMesh.rotation.x = Math.PI / 2;
    tireMesh.castShadow = true;
    wheelGroup.add(tireMesh);

    // Rin central
    const rimGeo = new THREE.CylinderGeometry(radius * 0.58, radius * 0.58, width + 0.01, 16);
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    wheelGroup.add(rimMesh);

    // Pernos / Maza
    const hubGeo = new THREE.CylinderGeometry(radius * 0.24, radius * 0.24, width + 0.03, 12);
    const hubMesh = new THREE.Mesh(hubGeo, steelDarkMat);
    hubMesh.rotation.x = Math.PI / 2;
    wheelGroup.add(hubMesh);

    wheelGroup.position.set(xPos, radius, zPos);
    forkliftGroup.add(wheelGroup);
    return wheelGroup;
  }

  // Ruedas delanteras motrices de alta tracción
  createWheel(0.38, 0.26, 0.78, 0.65);
  createWheel(0.38, 0.26, 0.78, -0.65);

  // Ruedas traseras directrices
  createWheel(0.28, 0.22, -0.82, 0.54);
  createWheel(0.28, 0.22, -0.82, -0.54);

  // Centrar y posicionar en el suelo
  forkliftGroup.position.y = 0;

  // --- CONTROLES Y FÍSICA MOTION INERCIAL (IDÉNTICO AL SNIPPET DEL USUARIO) ---
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.minDistance = 3.5;
  controls.maxDistance = 14;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // No hundirse en el piso

  function runOrbitMotion(controls) {
    const orbitYaw = motionValue(controls.getAzimuthalAngle());
    const orbitVelocity = motionValue(ORBIT_SPEED);
    let previousAzimuth = controls.getAzimuthalAngle();
    let unwrappedYaw = previousAzimuth;
    let velocityAnimation;
    let dragging = false;

    function sampleOrbitYaw() {
      const azimuth = controls.getAzimuthalAngle();
      let change = azimuth - previousAzimuth;
      if (change > Math.PI) change -= Math.PI * 2;
      if (change < -Math.PI) change += Math.PI * 2;
      unwrappedYaw += change;
      previousAzimuth = azimuth;
      orbitYaw.set(unwrappedYaw);
    }

    function transferDragVelocity() {
      const releaseVelocity = Math.max(
        -MAX_RELEASE_SPEED,
        Math.min(MAX_RELEASE_SPEED, orbitYaw.getVelocity())
      );
      orbitVelocity.set(releaseVelocity);
      velocityAnimation = animate(orbitVelocity, ORBIT_SPEED, {
        duration: 2.4,
        ease: [0.16, 1, 0.3, 1],
      });
    }

    press(canvas, () => {
      dragging = true;
      velocityAnimation?.stop();
      velocityAnimation = undefined;
      sampleOrbitYaw();

      // Disparar evento de interacción en 3D
      pixel.trackInteract3D('drag_start', { yaw: controls.getAzimuthalAngle().toFixed(2) });

      return () => {
        if (!dragging) return;
        dragging = false;
        transferDragVelocity();
        pixel.trackInteract3D('drag_release', { yaw: controls.getAzimuthalAngle().toFixed(2) });
      };
    });

    frame.update(({ delta }) => {
      const seconds = Math.min(Math.max(0, delta) / 1000, 0.05);

      if (!dragging) {
        controls.rotateLeft(-orbitVelocity.get() * seconds);
      }

      controls.update();
      sampleOrbitYaw();
    }, true);
  }

  runOrbitMotion(controls);

  // --- REDIMENSIONAMIENTO RESPONSIVO ---
  function resize() {
    const width = canvas.parentElement.clientWidth || canvas.clientWidth || 600;
    const height = canvas.parentElement.clientHeight || canvas.clientHeight || 450;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  new ResizeObserver(resize).observe(canvas.parentElement || canvas);
  resize();

  // --- LOOP DE RENDERIZADO CON FRAME MOTION ---
  let beaconTime = 0;
  frame.render(() => {
    sky.position.copy(camera.position);

    // Animación de baliza ámbar parpadeante
    beaconTime += 0.05;
    const beaconPulse = Math.sin(beaconTime * 6) > 0.2 ? 1 : 0.2;
    beaconAmberMat.color.setRGB(1.0 * beaconPulse, 0.65 * beaconPulse, 0);

    renderer.render(scene, camera);
  }, true);

  // --- API DE CONTROL EXPUESTA PARA LA TARJETA INTERACTIVA ---
  let isElevated = false;
  let lightsOn = true;

  return {
    toggleElevation: () => {
      isElevated = !isElevated;
      const targetY = isElevated ? 1.45 : 0.22;
      animate(carriageGroup.position.y, targetY, {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          carriageGroup.position.y = latest;
        }
      });
      pixel.trackInteract3D('toggle_mast_elevation', { isElevated, targetY });
      return isElevated;
    },

    toggleLights: () => {
      lightsOn = !lightsOn;
      spotLightL.intensity = lightsOn ? 4.5 : 0;
      spotLightR.intensity = lightsOn ? 4.5 : 0;
      headlampL.material = lightsOn ? lightGlowMat : steelDarkMat;
      headlampR.material = lightsOn ? lightGlowMat : steelDarkMat;
      pixel.trackInteract3D('toggle_led_headlights', { lightsOn });
      return lightsOn;
    },

    setChassisColor: (hexColor, colorName = 'Personalizado') => {
      chassisMaterial.color.set(hexColor);
      rimMat.color.set(hexColor);
      pixel.trackInteract3D('change_chassis_color', { colorName, hex: hexColor });
    },

    resetCamera: () => {
      camera.position.set(4.2, 2.4, 5.8);
      controls.target.set(0, 0.8, 0);
      controls.update();
      pixel.trackInteract3D('reset_camera_view');
    }
  };
}
