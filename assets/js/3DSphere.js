let is3DShopInit = false;
let scene, camera, renderer, controls, raycaster, mouse;
const shopsData = [
    { name: "Electronics", position: { x: -200, y: 25, z: -200 }, items: [] },
    { name: "Books", position: { x: 200, y: 25, z: -200 }, items: [] },
    { name: "Clothing", position: { x: -200, y: 25, z: 200 }, items: [] },
    { name: "Sports", position: { x: 200, y: 25, z: 200 }, items: [] }
];
let selectedShop = null;

function init3DScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 150, 500);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("earth-container").appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2;
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(100, 200, 100);
    scene.add(light);
    
    createShops();
    animate();
    
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("click", onMouseClick);
}

function createShops() {
    shopsData.forEach((shop, index) => {
        const shopMesh = new THREE.Mesh(
            new THREE.BoxGeometry(100, 50, 100),
            new THREE.MeshLambertMaterial({ color: 0x8b5a2b })
        );
        shopMesh.position.set(shop.position.x, shop.position.y, shop.position.z);
        shopMesh.userData = { index };
        scene.add(shopMesh);
    });
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const shopIndex = intersects[0].object.userData.index;
        selectedShop = shopsData[shopIndex];
        showAddItemForm(selectedShop.name);
    }
}

function showAddItemForm(shopName) {
    document.getElementById("shopNameLabel").textContent = shopName;
    document.getElementById("addItemForm").style.display = "block";
}

function handleAddItemSubmit(event) {
    event.preventDefault();
    const itemName = document.getElementById("itemName").value;
    const itemPrice = document.getElementById("itemPrice").value;
    const itemMedia = document.getElementById("itemMedia").files[0];
    
    if (!itemMedia || itemMedia.size > 300 * 1024) {
        alert("Media file must be under 300KB.");
        return;
    }
    
    selectedShop.items.push({
        name: itemName,
        price: itemPrice,
        media: URL.createObjectURL(itemMedia)
    });
    
    document.getElementById("addItemForm").reset();
    document.getElementById("addItemForm").style.display = "none";
    selectedShop = null;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("addItemForm").addEventListener("submit", handleAddItemSubmit);
    init3DScene();
});
