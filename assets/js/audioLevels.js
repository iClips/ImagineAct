let isVisualizerCircular = false;

function initAudioVisualization(stream) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 256;

    const canvas = document.getElementById('audioCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }

    const ctx = canvas.getContext('2d'); // ✅ Ensure ctx is initialized before use
    if (!ctx) {
        console.error("Could not get canvas context!");
        return;
    }

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    analyser.getByteFrequencyData(new Uint8Array(analyser.frequencyBinCount)); // Pre-fetch to ensure data array is initialized

    // Check for circular visualizer
    if (canvas) {
        canvas.classList.add('circular');
        isVisualizerCircular = true;
        drawCircularVisualizer(); // ✅ Now safe to call
    }

    function drawCircularVisualizer() {
        requestAnimationFrame(drawCircularVisualizer);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 3;

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
}

function startAudioVisuals() {
    try {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => initAudioVisualization(stream))
            .catch(err => console.error('Error accessing microphone: ', err));
    } catch (ex) {
        console.error('Error starting audio visualization:', ex);
    }
}
