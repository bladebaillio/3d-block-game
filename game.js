// ===== Scene & Camera =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 10); // start above floor, away from cube

// ===== Renderer =====
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== Floor =====
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshBasicMaterial({ color: 0x228b22 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1;
scene.add(floor);

// ===== Cube =====
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshBasicMaterial({ color: 0xff0000 })
);
cube.position.set(0, 1, 0);
scene.add(cube);

// ===== PointerLockControls =====
const controls = new THREE.PointerLockControls(camera, document.body);
const instructions = document.getElementById("instructions");
instructions.addEventListener("click", () => controls.lock());

controls.addEventListener("lock", () => instructions.style.display = "none");
controls.addEventListener("unlock", () => instructions.style.display = "block");

// ===== WASD Movement =====
const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);
const speed = 0.1;

// ===== Animate Loop =====
function animate() {
  requestAnimationFrame(animate);

  // WASD movement
  const direction = new THREE.Vector3();
  controls.getDirection(direction);
  direction.y = 0;
  direction.normalize();

  const right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0,1,0));

  const newPos = camera.position.clone();
  if (keys["KeyW"]) newPos.add(direction.clone().multiplyScalar(speed));
  if (keys["KeyS"]) newPos.add(direction.clone().multiplyScalar(-speed));
  if (keys["KeyA"]) newPos.add(right.clone().multiplyScalar(-speed));
  if (keys["KeyD"]) newPos.add(right.clone().multiplyScalar(speed));

  camera.position.copy(newPos);

  // Rotate cube for visual feedback
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();

// ===== Handle Window Resize =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
