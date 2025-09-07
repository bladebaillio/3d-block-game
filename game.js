// ===== Scene & Camera =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 10); // above floor, away from walls

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
scene.add(floor);

// ===== Walls =====
const walls = [];
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });

const wallData = [
  { x: 0, y: 1, z: -10, w: 20, h: 2, d: 1 },
  { x: 5, y: 1, z: -5, w: 1, h: 2, d: 10 },
  { x: -5, y: 1, z: -5, w: 1, h: 2, d: 10 },
  { x: 0, y: 1, z: -20, w: 20, h: 2, d: 1 }
];

wallData.forEach(w => {
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(w.w, w.h, w.d),
    wallMaterial
  );
  wall.position.set(w.x, w.y, w.z);
  scene.add(wall);
  walls.push(wall);
});

// ===== Cubes =====
const cubes = [];
for (let i = 0; i < 5; i++) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  cube.position.set(Math.random() * 20 - 10, 1, Math.random() * -30);
  scene.add(cube);
  cubes.push(cube);
}

// ===== Controls =====
const controls = new THREE.PointerLockControls(camera, document.body);
const instructions = document.getElementById("instructions");
instructions.addEventListener("click", () => controls.lock());
controls.addEventListener('lock', () => instructions.style.display = 'none');
controls.addEventListener('unlock', () => instructions.style.display = 'block');

const keys = {};
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);
const speed = 0.2;

// ===== Collision Detection =====
function checkCollision(newPos) {
  const playerBox = new THREE.Box3().setFromCenterAndSize(
    newPos,
    new THREE.Vector3(1, 2, 1)
  );

  for (const wall of walls) {
    const wallBox = new THREE.Box3().setFromObject(wall);
    if (playerBox.intersectsBox(wallBox)) return true;
  }

  for (const cube of cubes) {
    const cubeBox = new THREE.Box3().setFromObject(cube);
    if (playerBox.intersectsBox(cubeBox)) return true;
  }

  return false;
}

// ===== Animate Loop =====
function animate() {
  requestAnimationFrame(animate);

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

  if (!checkCollision(newPos)) camera.position.copy(newPos);

  cubes.forEach(c => c.rotation.y += 0.01);

  renderer.render(scene, camera);
}
animate();

// ===== Handle Window Resize =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
