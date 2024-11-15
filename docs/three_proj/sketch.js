
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer;
let points = [];
let fftN = 512;
let maxTiempos = 10;
let frecuenciasHistoria = new Array(maxTiempos);
let amplitudHistoria = new Array(maxTiempos);
let vertices = [];
let spheres = [];
let analyser;
let clock;

// Setup inicial
function init() {
  // Configurar la escena
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x323232);

  // Configurar la cámara
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 500;

  // Configurar el renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Controlar la órbita
  const controls = new OrbitControls(camera, renderer.domElement);

  // Configurar luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(0, 500, 500);
  scene.add(pointLight);

  // Configurar la geometría inicial
  vertices = esferaFibonacci(0, 0, 0, 200, 1600);
  createVertices(vertices);

  // Configurar GUI
  const gui = new dat.GUI();
  gui.add(parameters, 'radio', 0, 400).name('Radio').onChange(updateSphere);
  gui.add(parameters, 'npuntos', 0, 2000).name('N Puntos').onChange(updateSphere);
  gui.add(parameters, 'delta', 0, 0.1).name('Delta').step(0.001);

  // Configurar el audio
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const audioLoader = new THREE.AudioLoader();
  const audio = new THREE.Audio(listener);
  audioLoader.load('../common/music/canc.ogg', (buffer) => {
    audio.setBuffer(buffer);
    audio.setLoop(true);
    audio.play();
  });

  analyser = new THREE.AudioAnalyser(audio, fftN);

  clock = new THREE.Clock();

  animate();
}

const parameters = {
  radio: 200,
  npuntos: 1600,
  delta: 0.03,
};

function esferaFibonacci(x0, y0, z0, r, n) {
  let v = [];
  let goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < n; i++) {
    let theta = (2 * Math.PI * i) / goldenRatio;
    let phi = Math.acos(1 - (2 * (i + 0.5)) / n);
    let x = x0 + r * Math.cos(theta) * Math.sin(phi);
    let y = y0 + r * Math.sin(theta) * Math.sin(phi);
    let z = z0 + r * Math.cos(phi);
    v.push(new THREE.Vector3(x, y, z));
  }
  return v;
}

function createVertices(vertices) {
  const geometry = new THREE.SphereGeometry(1, 8, 8);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });

  // Limpiar cualquier esfera anterior
  spheres.forEach((sphere) => scene.remove(sphere));
  spheres = [];

  vertices.forEach((vertex) => {
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(vertex);
    scene.add(sphere);
    spheres.push(sphere);
  });
}

function updateSphere() {
  vertices = esferaFibonacci(0, 0, 0, parameters.radio, parameters.npuntos);
  createVertices(vertices);
}

function animate() {
  requestAnimationFrame(animate);

  let time = clock.getElapsedTime();

  // Actualizar frecuencias de sonido
  let espectro = analyser.getFrequencyData();
  let amplitudes = analyser.getAverageFrequency();

  frecuenciasHistoria[time % maxTiempos] = espectro;
  amplitudHistoria[time % maxTiempos] = amplitudes;

  // Actualizar las esferas basándose en la música
  spheres.forEach((sphere, index) => {
    const v_normal = vertices[index].clone().normalize();
    const offset = (espectro[index % fftN] / 255) * 60;
    const v_final = vertices[index].clone().add(v_normal.multiplyScalar(offset));
    sphere.position.copy(v_final);
  });

  renderer.render(scene, camera);
}

init();

// Incluir las referencias a las bibliotecas de Three.js y dat.GUI desde un CDN en el HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/dat.gui@0.7.6/build/dat.gui.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/examples/js/controls/OrbitControls.js"></script>
// Asegúrate de que OrbitControls se carga después de la biblioteca principal de Three.js y está disponible en el ámbito global.
// Asegúrate de que OrbitControls se carga después de la biblioteca principal de Three.js.
