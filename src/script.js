import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const parameters = {};
parameters.count = 100000;
parameters.size = 0.02;
parameters.radius = 3;
parameters.spin = 1;
parameters.branches = 3;
parameters.randomness = 0.2;
parameters.power = 3;
parameters.insideColor = "#ff6030";
parameters.outsideColor = "#1b3984";

let particleGeometry = null;
let particles = null;
let particleMaterial = null;

const galaxyGenerator = () => {
  /**
   * Geometry
   */
  if (particles != null) {
    particleGeometry.dispose();
    particleMaterial.dispose();
    scene.remove(particles);
  }
  particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * parameters.radius;
    const angle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
    const branchesAngle = radius * parameters.spin;
    const randomX =
      Math.pow(Math.random(), parameters.power) *
      radius *
      parameters.randomness *
      (Math.random() < 0.5 ? 1 : -1);
    const randomY =
      Math.pow(Math.random(), parameters.power) *
      radius *
      parameters.randomness *
      (Math.random() < 0.5 ? 1 : -1);
    const randomZ =
      Math.pow(Math.random(), parameters.power) *
      radius *
      parameters.randomness *
      (Math.random() < 0.5 ? 1 : -1);
    positions[i3] = Math.cos(angle + branchesAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(angle + branchesAngle) * radius + randomZ;

    //Colors
    const colorInside = new THREE.Color(parameters.insideColor);
    const colorOutside = new THREE.Color(parameters.outsideColor);
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  /**
   * Material
   */

  particleMaterial = new THREE.PointsMaterial();
  particleMaterial.size = parameters.size;
  particleMaterial.sizeAttenuation = true;
  particleMaterial.depthWrite = false;
  particleMaterial.blending = THREE.AdditiveBlending;
  particleMaterial.vertexColors = true;

  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
};

galaxyGenerator();

gui
  .add(parameters, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(galaxyGenerator);

gui
  .add(parameters, "radius")
  .min(1)
  .max(20)
  .step(0.1)
  .onFinishChange(galaxyGenerator);

gui
  .add(parameters, "branches")
  .min(1)
  .max(10)
  .step(1)
  .onFinishChange(galaxyGenerator);

gui
  .add(parameters, "spin")
  .min(1)
  .max(10)
  .step(0.01)
  .onFinishChange(galaxyGenerator);

gui
  .add(parameters, "randomness")
  .min(0)
  .max(2)
  .step(0.01)
  .onFinishChange(galaxyGenerator);
gui
  .add(parameters, "power")
  .min(1)
  .max(10)
  .step(0.01)
  .onFinishChange(galaxyGenerator);

gui.addColor(parameters, "insideColor").onFinishChange(galaxyGenerator);
gui.addColor(parameters, "outsideColor").onFinishChange(galaxyGenerator);
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
