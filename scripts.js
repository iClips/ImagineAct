document.addEventListener('DOMContentLoaded', () => {
    let balance = 0;
    let username = '';
    let recognition;
    let isListening = false;  

    const startButton = document.getElementById('startButton');
    const loginButton = document.getElementById('loginButton');
    const speakButton = document.getElementById('speakButton');
    const balanceAmount = document.getElementById('balanceAmount');

    const startScreen = document.getElementById('startScreen');
    const loginScreen = document.getElementById('loginScreen');
    const gameScreen = document.getElementById('gameScreen');

    const keywordRegex = /(\bbuy\b)|(\d+)|([a-zA-Z]+)/g; // Regex to match "buy", numbers, and item names
    
    function processRecognizedText(text) {
        const matches = text.match(keywordRegex);
        if (matches) {
            let action = '';
            let item = '';
            let price = 0;
            let highlightedText = '';
    
            matches.forEach(match => {
                if (match.toLowerCase() === 'buy') {
                    action = match;
                    highlightedText += `<span style="color: green; font-weight: bold;">${match}</span> `;
                } else if (!isNaN(match)) {
                    price = parseFloat(match);
                    highlightedText += `<span style="color: blue; font-weight: bold;">${match}</span> `;
                } else {
                    item = match;
                    highlightedText += `<span style="color: orange; font-weight: bold;">${match}</span> `;
                }
            });
    
            document.getElementById('recognizedTextLabel').innerHTML = highlightedText;
    
            if (action === 'buy' && item && price > 0) {
                if (balance >= price) {
                    balance -= price;
                    purchaseList.push({ item, price });
                    updatePurchaseList();
                    updateBalance();
                } else {
                    showInsufficientBalanceMessage();
                    disableMic();
                }
            }
        }
    }
    // Create the Babylon.js scene
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

    function setupScene() {
        const canvas = document.getElementById("renderCanvas");
        const engine = new BABYLON.Engine(canvas, true);
        const scene = new BABYLON.Scene(engine);

        // Create a basic camera and light
        const camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 4, 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);

        // Create the 3D cube
        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);

        // Create materials for each side
        const colors = ["Red", "Green", "Blue", "Yellow", "Orange", "Purple"];
        const materials = colors.map(colorName => {
            return createMaterial(colorName + "Mat", getColorByName(colorName), scene);
        });

        // Apply MultiMaterial to box
        const multiMaterial = new BABYLON.MultiMaterial("multi", scene);
        multiMaterial.subMaterials = materials;
        box.material = multiMaterial;

        // Setup SubMeshes
        const faceCount = 6;
        for (let i = 0; i < faceCount; i++) {
            box.subMeshes.push(new BABYLON.SubMesh(i, 0, box.getTotalVertices(), i * 6, 6, box));
            box.subMeshes[i].materialIndex = i;
        }

        // Render loop
        engine.runRenderLoop(() => {
            scene.render();
        });

        // Handle browser resize
        window.addEventListener('resize', () => {
            engine.resize();
        });
    }

    // Believe algorithm
    let beliefScore = 100;  // Start with a baseline belief score

    function updateBelief(amountSpent) {
        beliefScore += (amountSpent > 50) ? 10 : -5;
        checkBeliefLevel();
    }

    function checkBeliefLevel() {
        if (beliefScore > 150) {
            console.log("High belief detected, doubling the balance!");
            balance *= 2;
        } else if (beliefScore < 50) {
            console.log("Low belief detected, decreasing the balance!");
            balance *= 0.5;
        }
    }

    // Purchase logic
    let purchaseList = [];

    function updatePurchaseListUI() {
        const listElement = document.getElementById("purchaseList");
        listElement.innerHTML = "";
        purchaseList.forEach(purchase => {
            const li = document.createElement("li");
            li.textContent = `${purchase.item}: ${purchase.amount}`;
            listElement.appendChild(li);
        });
    }

    function showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    startButton.addEventListener('click', () => {
        showScreen('loginScreen');
    });

    loginButton.addEventListener('click', () => {
        username = document.getElementById('username').value;
        const initialDeposit = parseFloat(document.getElementById('initialDeposit').value);
        if (username && !isNaN(initialDeposit) && initialDeposit > 0) {
            balance = initialDeposit;
            updateBalance();
            showScreen('gameScreen');
            // setupScene();
        } else {
            alert('Please enter a valid username and balance.');
        }
    });

    // speakButton.addEventListener('mousedown', () => {
    //     startListening();
    // });

    // speakButton.addEventListener('mouseup', () => {
    //     stopListening();
    // });
    
    // For mobile devices
    speakButton.addEventListener('touchstart', () => {
        startListening();
    });
    
    speakButton.addEventListener('touchend', () => {
        stopListening();
    });
    
    function updateBalance() {
        const balanceElement = document.getElementById('balanceAmount');
        balanceElement.textContent = balance;
    }
    
    function showInsufficientBalanceMessage() {
        document.getElementById('output').textContent = 'Insufficient balance to make this purchase.';
    }
    
    function disableMic() {
        const micButton = document.getElementById('micButton');
        micButton.disabled = true;
    }

    function addPurchase(item, amount) {
        console.log('adding purchase: ' + item + " " + amount);
        const li = document.createElement('li');
        li.innerHTML = `${item} - R${amount.toFixed(2)} <button onclick="removePurchase(this, ${amount})">Remove</button>`;
        purchaseList.appendChild(li);
        balance -= amount;
        updateBalance();

        purchaseList.push({ item, amount });
        updatePurchaseListUI();
    }

    window.removePurchase = function(button, amount) {
        const li = button.parentNode;
        purchaseList.removeChild(li);
        balance += amount;
        updateBalance();
    };

    function startListening() {
        isListening = true;
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;  // Keep listening until the user releases the button
        recognition.onresult = function(event) {
            const spokenText = event.results[event.results.length - 1][0].transcript.toLowerCase();
            processVoiceCommand(spokenText);
        };
        recognition.start();
    }

    function stopListening() {
        isListening = false;
        if (recognition) {
            recognition.stop();
        }
    }

    function processVoiceCommand(command) {
        document.getElementById('output').textContent = "command: " + command;
        const purchaseRegex = /buy (\w+) for (\d+)\s*rands?/;
        const match = purchaseRegex.exec(command);
        
        if (match) {
            const item = match[1];
            const amount = parseFloat(match[2]);
            addPurchase(item, amount);
        } else {
            alert("Could not recognize your command. Please try again.");
        }
    }

    // Show the About popup
    document.getElementById('aboutLink').addEventListener('click', function(event) {
        event.preventDefault();
        document.getElementById('aboutPopup').style.display = 'block';
    });

    // Close the About popup
    document.getElementById('popupClose').addEventListener('click', function() {
        document.getElementById('aboutPopup').style.display = 'none';
    });

    // Close the popup if clicked outside
    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('aboutPopup')) {
            document.getElementById('aboutPopup').style.display = 'none';
        }
    });
});
