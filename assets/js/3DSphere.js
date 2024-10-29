
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const geometry = new THREE.SphereGeometry(1, 32, 32); 
const material = new THREE.MeshBasicMaterial({
    color: 0x00aaff, 
    wireframe: true 
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);


const controls = new THREE.OrbitControls(camera, renderer.domElement);


controls.enableZoom = true;
controls.enableDamping = true;  
controls.dampingFactor = 0.25;  
controls.minDistance = 1;       
controls.maxDistance = 10;      
controls.enablePan = false;     
controls.touches = {
    ONE: THREE.TOUCH.ROTATE,    
    TWO: THREE.TOUCH.DOLLY_ROTATE 
};

camera.position.z = 3;

function animate() {
    requestAnimationFrame(animate);

    controls.update(); 
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

animate();
