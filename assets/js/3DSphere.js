let is3DShopInit = false;
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


function _init3DScene() {
    scene = new THREE.Scene();
    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);  // Allow user to move around with mouse

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
    console.log('clicked');
    const mouse = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    const raycaster = new THREE.Raycaster();
    if (camera && mouse) {
        raycaster.setFromCamera(mouse, camera);
    } else {
        showNote('error' , "Raycaster cannot set from camera. Mouse or camera error.");
        return;
    }

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0 && intersects[0].object.onClick) {
        intersects[0].object.onClick();
    }
    document.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        try {
            raycaster.setFromCamera(mouse, camera);
        } catch (error) {
            console.error('Raycaster error:', error);
        }
    });
    
});


function createMaterial(name, color, scene) {
    const material = new BABYLON.StandardMaterial(name, scene);
    material.diffuseColor = color;
    return material;
}

function getColorByName(colorName) {
    const colorMap = {
        red: BABYLON.Color3.Red(),
        green: BABYLON.Color3.Green(),
        blue: BABYLON.Color3.Blue(),
        yellow: BABYLON.Color3.Yellow(),
        orange: new BABYLON.Color3(1.0, 0.647, 0.0), // Custom orange color
        purple: new BABYLON.Color3(0.5, 0.0, 0.5) // Custom purple color
    };
    return colorMap[colorName.toLowerCase()] || BABYLON.Color3.White(); // Default to white if color not found
}

function init3DScene() {
    const canvas = document.createElement('canvas');
    document.getElementById('earth-container').appendChild(canvas);

    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    const camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 5, -10), scene);
    camera.attachControl(canvas, true); 
    camera.speed = 0.5;

   const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseColor = BABYLON.Color3.Gray();
    ground.material = groundMaterial;

   const shop1 = BABYLON.MeshBuilder.CreateBox("shop1", { width: 10, height: 5, depth: 10 }, scene);
    shop1.position = new BABYLON.Vector3(-15, 2.5, 0);
    const shop1Material = new BABYLON.StandardMaterial("shop1Material", scene);
    shop1Material.diffuseColor = BABYLON.Color3.Blue();
    shop1.material = shop1Material;

    const shop2 = BABYLON.MeshBuilder.CreateBox("shop2", { width: 10, height: 5, depth: 10 }, scene);
    shop2.position = new BABYLON.Vector3(15, 2.5, 0);
    const shop2Material = new BABYLON.StandardMaterial("shop2Material", scene);
    shop2Material.diffuseColor = BABYLON.Color3.Red();
    shop2.material = shop2Material;

    // Add shelves inside the shops
    function createShelf(position, parent, scene) {
        const shelf = BABYLON.MeshBuilder.CreateBox("shelf", { width: 1, height: 5, depth: 3 }, scene);
        shelf.position = position;
        shelf.parent = parent;
        const shelfMaterial = new BABYLON.StandardMaterial("shelfMaterial", scene);
        shelfMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.1);
        shelf.material = shelfMaterial;
    }

    createShelf(new BABYLON.Vector3(-3, 1.5, -2), shop1, scene);
    createShelf(new BABYLON.Vector3(3, 1.5, -2), shop1, scene);

    createShelf(new BABYLON.Vector3(-3, 1.5, -2), shop2, scene);
    createShelf(new BABYLON.Vector3(3, 1.5, -2), shop2, scene);

    // Add checkout points
    function createCheckoutPoint(position, parent, scene) {
        const counter = BABYLON.MeshBuilder.CreateBox("counter", { width: 2, height: 1, depth: 1 }, scene);
        counter.position = position;
        counter.parent = parent;
        const counterMaterial = new BABYLON.StandardMaterial("counterMaterial", scene);
        counterMaterial.diffuseColor = BABYLON.Color3.Green();
        counter.material = counterMaterial;
    }

    createCheckoutPoint(new BABYLON.Vector3(0, 0.5, 4), shop1, scene);
    createCheckoutPoint(new BABYLON.Vector3(0, 0.5, 4), shop2, scene);

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);

    engine.runRenderLoop(() => {
        scene.render();
    });

    // Resize handling
    window.addEventListener('resize', () => {
        engine.resize();
    });

    is3DShopInit = true;
}

function onCloseContent(event, id) {
    event.stopPropagation();  // Prevents the parent click event from triggering
    const content = document.querySelector(`#${id}-container`);
    content.style.display = "none";  // Hide the content
}