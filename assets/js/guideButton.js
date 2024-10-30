let progress = 0;
let progressInterval;

const instructions = document.getElementById("instructions");
const progressIndicator = document.getElementById("progressIndicator");
const progressCircle = document.getElementById("progressCircle");

// Create markers every 17 seconds
for (let i = 0; i < 4; i++) {
    const marker = document.createElement('div');
    const angle = (i * 17 * 360 / 68) * (Math.PI / 180); 
    const x = 75 * Math.cos(angle) + 75; 
    const y = 75 * Math.sin(angle) + 75; 
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
    marker.classList.add('marker');
    document.body.appendChild(marker);
}

function startVisualization() {
    instructions.innerText = "Step 1: Visualize the scenario - imagine the setting, cashier, and product.";
    progressIndicator.innerText = "Visualizing...";
}

function startEmotion() {
    instructions.innerText = "Step 2: Add emotions - feel the excitement as if it's real.";
    progressIndicator.innerText = "Feeling...";
}

function startCommand() {
    instructions.innerText = "Step 3: Release and voice your command to complete the purchase.";
    progressIndicator.innerText = "Ready to Command...";
}

function resetButton() {
    clearInterval(progressInterval);
    progress = 0;
    instructions.innerText = "Press and hold to start your voice-command purchase.";
    progressIndicator.innerText = "";
    progressCircle.style.borderTopColor = "transparent"; // Reset progress
}

// Button hold logic
const guideButton = document.getElementById("voiceButton");

guideButton.addEventListener("mousedown", startGuidedVCPurchase);
guideButton.addEventListener("mouseup", resetButton);    
guideButton.addEventListener("touchstart", startGuidedVCPurchase);
guideButton.addEventListener("touchend", resetButton);

function startGuidedVCPurchase() {
    progressInterval = setInterval(() => {
        progress += 1;
        if (progress <= 33) {
            startVisualization();
        } else if (progress <= 66) {
            startEmotion();
        } else if (progress <= 100) {
            startCommand();
        }

        // Update progress circle
        if (progress <= 68) {
            progressCircle.style.borderTopColor = "#4caf50"; // Light up progress
        }
        if (progress >= 68) {
            clearInterval(progressInterval);
            promptVoiceCommand();
        }
    }, 1000);
}
function promptVoiceCommand() {
    instructions.innerText = "Listening for command... please speak clearly.";
    guideButton.style.background = "#555";
}