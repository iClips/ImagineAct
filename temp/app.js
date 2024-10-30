// Scene, Camera, and Renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a sphere (Earth)
const geometry = new THREE.SphereGeometry(1, 32, 32); // Sphere with radius 1
const material = new THREE.MeshBasicMaterial({
    color: 0x00aaff, // Blue color for simplicity
    wireframe: true  // Use wireframe to see the structure
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(planet);

// OrbitControls to enable zoom and rotation
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Adjust the zoom and rotation limits
controls.enableZoom = true;
controls.enableDamping = true;  // Smooth damping (inertia)
controls.dampingFactor = 0.25;  // Controls the inertia effect
controls.minDistance = 1;       // Minimum zoom (close to the sphere)
controls.maxDistance = 10;      // Maximum zoom (far from the sphere)
controls.enablePan = false;     // Disable panning to focus on rotation
controls.touches = {
    ONE: THREE.TOUCH.ROTATE,    // One-finger rotates the sphere
    TWO: THREE.TOUCH.DOLLY_ROTATE // Two-finger zooms and rotates
};

// Position the camera initially
camera.position.z = 3;

// Rotation and rendering
function animate() {
    requestAnimationFrame(animate);

    controls.update(); // Update controls to allow rotation and zoom
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Start the animation loop
animate();
