let scene, camera, renderer, planet, controls, orbitControl;

document.addEventListener('DOMContentLoaded', () => {
    orbitControl = document.getElementById('orbitControl');
    orbitControl.addEventListener('mousedown', (event) => {
        isDragging = true;
        orbitControl.style.pointerEvents = 'none'; // Disable pointer events on the circle
    });
    orbitControl.addEventListener('mousemove', (event) => {
        if (isDragging) {
            // Calculate mouse movement
            const deltaX = event.movementX;
            const deltaY = event.movementY;
    
            // Update orbit controls based on mouse movement
            controls.rotateLeft(deltaX * 0.01);
            controls.rotateUp(deltaY * 0.01);
        }
    });        
    orbitControl.addEventListener('click', (event) => {
        if (event.button === 0) { // Left mouse button
            zoomIntoBuilding();
        }
    });
});

function init3DSphere() {
    if (scene) {
        return;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('earth-container').appendChild(renderer.domElement);

    const floorGrid = new THREE.GridHelper(500, 20);
    scene.add(floorGrid);

    const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
    scene.add(ambientLight);

    // Create top light (directional light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light
    directionalLight.position.set(0, 50, 0); // Position the light above the scene
    directionalLight.castShadow = true; // Optional: enable shadows
    scene.add(directionalLight);

    // Create left side grid
    const leftGrid = new THREE.GridHelper(500, 20);
    leftGrid.rotation.z = Math.PI / 2; // Rotate to face the left side
    leftGrid.position.x = -250; // Move left to align with the floor grid
    leftGrid.position.y = 250; // Set height to 0 to align with the floor
    scene.add(leftGrid);

    // Create back side grid
    const backGrid = new THREE.GridHelper(500, 20);
    backGrid.rotation.x = Math.PI / 2;
    backGrid.position.z = -250;
    backGrid.position.y = 250; 
    scene.add(backGrid);

    // Create a sphere representing the earth
    const geometry = new THREE.SphereGeometry(100, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x00aaff, 
        wireframe: true 
    });
    planet = new THREE.Mesh(geometry, material);
    planet.position.y = 100;
    scene.add(planet);

    // Create the mall building
    const mallGeometry = new THREE.BoxGeometry(1, 0.5, 1); // Mall size
    const mallMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const mall = new THREE.Mesh(mallGeometry, mallMaterial);
    // mall.position.y = 200.5; // Position the mall above the sphere
    // scene.add(mall);

    mall.position.set(0, 100 + 30 / 2, 0); // Adjust Y to be above the sphere
    planet.add(mall); // Attach building to the earth


    // Create shops inside the mall
    const shopGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // Each shop size
    const shopMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });

    for (let i = 0; i < 27; i++) {
        const shop = new THREE.Mesh(shopGeometry, shopMaterial);
        // Calculate positions for shops (random layout)
        shop.position.x = (Math.random() - 0.5) * 1.5; // Random x position
        shop.position.y = 0; // On ground level
        shop.position.z = (Math.random() - 0.5) * 1.5; // Random z position
        mall.add(shop);
    }

    // OrbitControls to enable zoom and rotation
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true; 
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enablePan = true;

    // Camera position
    camera.position.set(0, 200, 500);
    camera.lookAt(0, 100, 0);

    // Add event listeners for dragging (to rotate sphere)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    function onMouseDown(event) {
        isDragging = true;
    }

    function onMouseMove(event) {
        if (isDragging) {
            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y,
            };
            // Rotate the sphere
            planet.rotation.y += deltaMove.x * 0.01; // Rotate based on mouse movement
            planet.rotation.x += deltaMove.y * 0.01; // Rotate based on mouse movement
        }
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY,
        };
    }

    function onMouseUp() {
        isDragging = false;
    }

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Handle touch events for mobile
    let touchStart = { x: 0, y: 0 };
    let isTouching = false;

    function onTouchStart(event) {
        isTouching = true;
        touchStart.x = event.touches[0].clientX;
        touchStart.y = event.touches[0].clientY;
    }

    function onTouchMove(event) {
        if (isTouching) {
            const deltaMove = {
                x: event.touches[0].clientX - touchStart.x,
                y: event.touches[0].clientY - touchStart.y,
            };
            // Rotate the sphere
            planet.rotation.y += deltaMove.x * 0.01; // Rotate based on touch movement
            planet.rotation.x += deltaMove.y * 0.01; // Rotate based on touch movement
        }
    }

    function onTouchEnd() {
        isTouching = false;
    }

    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    animate();
}

function zoomIntoBuilding() {
    // Animate the camera moving towards the building
    const targetPosition = new THREE.Vector3(0, 100, 0); // Target position to look at
    const targetCameraPosition = new THREE.Vector3(0, 100, 30); // Position to zoom into

    // Animate the camera movement
    const duration = 2000; // Animation duration in milliseconds
    const startTime = performance.now();

    function animateZoom(timestamp) {
        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / duration, 1); // Normalize to [0, 1]

        // Interpolate between the start position and target position
        camera.position.lerp(targetCameraPosition, progress);
        camera.lookAt(targetPosition);

        if (progress < 1) {
            requestAnimationFrame(animateZoom); // Continue animating until complete
        }
    }

    requestAnimationFrame(animateZoom);
}

let isDragging = false;


window.addEventListener('mouseup', () => {
    isDragging = false;
    orbitControl.style.pointerEvents = 'auto'; // Re-enable pointer events
});

function handleKeyDown(event) {
    const key = event.key; // Get the key that was pressed

    // Move the sphere based on key presses
    switch (key) {
        case 'ArrowUp':    // Move up
            planet.position.y += 1;
            break;
        case 'ArrowDown':  // Move down
            planet.position.y -= 1;
            break;
        case 'ArrowLeft':  // Move left
            planet.position.x -= 1;
            break;
        case 'ArrowRight': // Move right
            planet.position.x += 1;
            break;
        case 'w':         // Move forward (in Z)
            planet.position.z -= 1;
            break;
        case 's':         // Move backward (in Z)
            planet.position.z += 1;
            break;
    }
}

// Add event listener for keydown events
window.addEventListener('keydown', handleKeyDown);

function animate() {
    requestAnimationFrame(animate);
    controls.update(); 
    // sphere.position.x += 0.1;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    if (renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
});