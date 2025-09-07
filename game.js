// ===== Scene & Camera =====
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 5); // above the floor

// ===== Renderer =====
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===== Spinning Cube =====
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2,2,2),
  new THREE.MeshBasicMaterial({color:0xff0000})
);
scene.add(cube);

// ===== Floor =====
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200,200),
  new THREE.MeshBasicMaterial({color:0x228b22})
);
floor.rotation.x = -Math.PI/2;
floor.position.y = -1;
scene.add(floor);

// ===== Animate =====
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();

// ===== Resize =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
