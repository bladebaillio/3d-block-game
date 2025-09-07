// Scene + Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(light);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x228b22 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Cube
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
cube.position.set(0, 1, -5);
scene.add(cube);

// Controls
const controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener("click", () => controls.lock());

const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

const speed = 0.1;

// Animate loop
function animate() {
  requestAnimationFrame(animate);

  // Movement
  const direction = new THREE.Vector3();
  controls.getDirection(direction);
  direction.y = 0;
  direction.normalize();

  if (keys["KeyW"]) camera.position.add(direction.clone().multiplyScalar(speed));
  if (keys["KeyS"]) camera.position.add(direction.clone().multiplyScalar(-speed));
  if (keys["KeyA"]) {
    const right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0));
    camera.position.add(right.multiplyScalar(-speed));
  }
  if (keys["KeyD"]) {
    const right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0));
    camera.position.add(right.multiplyScalar(speed));
  }

  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
