// Basic setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Floor
const floorGeometry = new THREE.PlaneGeometry(200, 200);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Controls (first-person)
const controls = new THREE.PointerLockControls(camera, document.body);
document.body.addEventListener("click", () => {
  controls.lock();
});

// WASD movement
const keys = {};
document.addEventListener("keydown", (e) => keys[e.code] = true);
document.addEventListener("keyup", (e) => keys[e.code] = false);

let velocity = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);

  // Movement speed
  const speed = 0.1;
  velocity.set(0, 0, 0);

  if (keys["KeyW"]) velocity.z -= speed;
  if (keys["KeyS"]) velocity.z += speed;
  if (keys["KeyA"]) velocity.x -= speed;
  if (keys["KeyD"]) velocity.x += speed;

  controls.moveRight(velocity.x);
  controls.moveForward(-velocity.z);

  renderer.render(scene, camera);
}
animate();
awd