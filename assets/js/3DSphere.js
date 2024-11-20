let scene, camera, renderer, controls, orbitControl;
const shopsData = [
    { name: "Electronics", position: { x: -200, y: 50, z: -200 }, items: [] },
    { name: "Books", position: { x: 200, y: 50, z: -200 }, items: [] },
    { name: "Clothing", position: { x: -200, y: 50, z: 200 }, items: [] },
    { name: "Sports", position: { x: 200, y: 50, z: 200 }, items: [] },
    { name: "Home Decor", position: { x: -150, y: 50, z: -150 }, items: [] },
    { name: "Toys", position: { x: 150, y: 50, z: -150 }, items: [] },
    { name: "Food", position: { x: -150, y: 50, z: 150 }, items: [] },
    { name: "Gifts", position: { x: 150, y: 50, z: 150 }, items: [] }
];
let selectedShopIndex = null;

function init3DScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    const earthContainer = document.getElementById("earth-container");
    earthContainer.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    camera.position.set(500, 1200, 1500);
    scene.add(new THREE.AmbientLight(0x404040));
    
    animate();
    window.addEventListener("resize", onWindowResize);

    setupShops();
    setupAddItemForm();
}

function setupShops() {
    shopsData.forEach((shop, index) => {
        const shopMesh = new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50), new THREE.MeshBasicMaterial({ color: 0x888888 }));
        shopMesh.position.set(shop.position.x, shop.position.y, shop.position.z);
        shopMesh.userData = { index };
        scene.add(shopMesh);

        shopMesh.onClick = () => {
            selectedShopIndex = index;
            showAddItemForm(shop.name);
        };
    });
}

function setupAddItemForm() {
    const form = document.createElement("form");
    form.id = "addItemForm";
    form.innerHTML = `
        <label>Shop: <span id="shopNameLabel"></span></label><br>
        <label>Item Name: <input type="text" id="itemName" required></label><br>
        <label>Price: <input type="number" id="itemPrice" required></label><br>
        <label>Image/Video (Max 300KB): <input type="file" id="itemMedia" accept="image/*,video/*" required></label><br>
        <button type="submit">Add Item</button>
    `;
    document.body.appendChild(form);
    form.style.display = "none";

    form.addEventListener("submit", handleAddItemSubmit);
}

function showAddItemForm(shopName) {
    document.getElementById("shopNameLabel").textContent = shopName;
    document.getElementById("addItemForm").style.display = "block";
}

async function handleAddItemSubmit(event) {
    event.preventDefault();

    const itemName = document.getElementById("itemName").value;
    const itemPrice = document.getElementById("itemPrice").value;
    const itemMedia = document.getElementById("itemMedia").files[0];
    
    if (!itemMedia || itemMedia.size > 300 * 1024) {
        alert("Media file is required and must be under 300KB.");
        return;
    }

    const item = { name: itemName, price: itemPrice, media: URL.createObjectURL(itemMedia) };
    shopsData[selectedShopIndex].items.push(item);

    // Save item data to server or local directory
    saveItemData(shopsData[selectedShopIndex].name, item);

    document.getElementById("addItemForm").reset();
    document.getElementById("addItemForm").style.display = "none";
    selectedShopIndex = null;
}

function saveItemData(shopName, item) {
    const formData = new FormData();
    formData.append("shopName", shopName);
    formData.append("itemName", item.name);
    formData.append("itemPrice", item.price);
    formData.append("itemMedia", item.media);

    fetch("api/save-item.php", { method: "POST", body: formData })
        .then(response => response.json())
        .then(data => console.log("Item saved:", data))
        .catch(error => console.error("Error saving item:", error));
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

document.addEventListener("click", (event) => {
    const mouse = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0 && intersects[0].object.onClick) {
        intersects[0].object.onClick();
    }
});
