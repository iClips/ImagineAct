let isVisualizerCircular = false;

function initAudMon(stream) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 256;

    const canvas = document.getElementById('audMonCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const frequencyBoost = 1.6;
    const motifWidth = 100;
    const motifHeight = 300;
    const gapX = 50;
    const gapY = 50;

    function drawVisualizerAndPattern() {
        requestAnimationFrame(drawVisualizerAndPattern);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Monster logo seamless pattern
        drawSeamlessPattern(ctx, canvas.width, canvas.height, motifWidth, motifHeight, gapX, gapY);

        // Draw audio visualizer
        analyser.getByteFrequencyData(dataArray);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 3;

        dataArray.forEach((value, i) => {
            const angle = (i / dataArray.length) * Math.PI * 2;
            const barLength = radius + value / 100;
            const x1 = centerX + radius * Math.cos(angle);
            const y1 = centerY + radius * Math.sin(angle);
            const x2 = centerX + barLength * Math.cos(angle);
            const y2 = centerY + barLength * Math.sin(angle);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(${value}, 255, 0, 0.8)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    drawVisualizerAndPattern();
}

function drawCircularVisualizer(){
    requestAnimationFrame(() => drawCircularVisualizer());

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    analyser.getByteFrequencyData(dataArray);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3

    dataArray.forEach((value, i) => {
        const angle = (i / dataArray.length) * Math.PI * 2;
        const barLength = radius + value / 10;
        const x1 = centerX + radius * Math.cos(angle);
        const y1 = centerY + radius * Math.sin(angle);
        const x2 = centerX + barLength * Math.cos(angle);
        const y2 = centerY + barLength * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${value}, 255, 0, 0.8)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

// Function to draw a seamless pattern
function drawSeamlessPattern(context, canvasWidth, canvasHeight, motifWidth, motifHeight, gapX, gapY) {
    for (let y = -motifHeight; y < canvasHeight + motifHeight; y += motifHeight + gapY) {
        for (let x = -motifWidth; x < canvasWidth + motifWidth; x += motifWidth + gapX) {
            context.save();
            context.translate(x + motifWidth / 2, y + motifHeight / 2);
            context.rotate((Math.random() * Math.PI) / 6 - Math.PI / 12);
            context.translate(-motifWidth / 2, -motifHeight / 2);
            drawMotif(context, motifWidth, motifHeight);
            context.restore();
        }
    }
}

// Function to draw the Monster claw mark motif
function drawMotif(context, width, height) {
    context.fillStyle = 'green'; // Iconic Monster green
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(width * 0.2, height);
    context.lineTo(width * 0.4, 0);
    context.lineTo(width * 0.6, height);
    context.lineTo(width * 0.8, 0);
    context.lineTo(width, height);
    context.closePath();
    context.fill();
}

// Start audio visualization with Monster pattern
function startAudMon() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => initAudMon(stream))
        .catch(err => console.error('Error accessing microphone:', err));
}

document.addEventListener('DOMContentLoaded', startAudMon);
