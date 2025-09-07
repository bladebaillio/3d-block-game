// ======= Scene & Camera =======
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5);

// ======= Renderer =======
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======= Lights =======
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
light.position.set(0, 20, 0);
scene.add(light);

// ======= Floor =======
const floorGeometry = new THREE.PlaneGeometry(200, 200);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ======= Walls & Obstacles =======
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
const walls = [];
const wallPositions = [
  { x: 0, y: 1, z: -10, w: 20, h: 2, d: 1 },
  { x: 5, y: 1, z: -5, w: 1, h: 2, d: 10 },
  { x: -5, y: 1, z: -5, w: 1, h: 2, d: 10 }
];

wallPositions.forEach(pos => {
  const geo = new THREE.BoxGeometry(pos.w, pos.h, pos.d);
  const wall = new THREE.Mesh(geo, wallMaterial);
  wall.position.set(pos.x, pos.y, pos.z);
  scene.add(wall);
  walls.push(wall);
});

// ======= Test Cubes =======
const cubes = [];
for (let i = 0; i < 5; i++) {
  const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
  const cubeMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.position.set(Math.random() * 20 - 10, 1, Math.random() * -20);
  scene.add(cube);
  cubes.push(cube);
}

// ======= Controls =======
const controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener("click", () => controls.lock());

const keys = {};
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

const velocity = new THREE.Vector3();
const speed = 0.2;

// ======= Collision Helper =======
function checkCollision(newPosition) {
  const playerBox = new THREE.Box3().setFromCenterAndSize(
    newPosition,
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

// ======= Movement =======
function moveControls() {
  const move = new THREE.Vector3();
  if (keys["KeyW"]) move.z -= speed;
  if (keys["KeyS"]) move.z += speed;
  if (keys["KeyA"]) move.x -= speed;
  if (keys["KeyD"]) move.x += speed;

  // Calculate potential new position
  const direction = new THREE.Vector3();
  controls.getDirection(direction);
  const forward = new THREE.Vector3(direction.x, 0, direction.z).normalize();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

  const newPos = camera.position.clone();
  newPos.add(forward.clone().multiplyScalar(-move.z));
  newPos.add(right.clone().multiplyScalar(move.x));

  if (!checkCollision(newPos)) {
    camera.position.copy(newPos);
  }
}

// ======= Animate Loop =======
function animate() {
  requestAnimationFrame(animate);

  moveControls();

  // Spin cubes for fun
  cubes.forEach(c => c.rotation.y += 0.01);

  renderer.render(scene, camera);
}
animate();

// ======= Window Resize =======
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
