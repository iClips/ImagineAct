function initAudioVisualization(stream) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 256; // Resolution for frequency data

    const canvas = document.getElementById('audioCanvas');
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Canvas setup

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;  // Update canvas width to match its parent
        canvas.height = canvas.offsetHeight; // Update height if needed
    }
    
    // Call resizeCanvas initially and on window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const frequencyBoost = 1.6; 

    // Assuming you have access to an analyser node from your Web Audio API setup
    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
    
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    
        analyser.getByteFrequencyData(dataArray);
    
        const barWidth = canvas.width / 20;
        const middleY = canvas.height / 2 ; // Middle line for symmetry
    
        // Draw horizontal line (stroke)
        ctx.beginPath();
        ctx.moveTo(0, middleY);
        ctx.lineTo(canvas.width, middleY);
        ctx.strokeStyle = '#fff';  // White stroke for the middle line
        ctx.lineWidth = 2;
        ctx.stroke();
    
        // Draw the vertical bars (symmetrical)
        for (let i = 0; i < dataArray.length; i++) {
            // Apply exponential scaling to boost higher frequencies
            const normalizedFrequency = Math.pow(dataArray[i] / 255, frequencyBoost);
            
            const barHeight = normalizedFrequency * middleY;
    
            const root = document.documentElement;
            let barColor = '#00ff00';
            if (root) {
                const styles = getComputedStyle(root);
                barColor = styles.getPropertyValue('--button-hover-background').trim();
            }

            ctx.fillStyle = barColor;  
            
            const x = i * barWidth;
    
            // Draw top and bottom bars
            ctx.fillRect(x, middleY - barHeight, barWidth, barHeight); // Top
            ctx.fillRect(x, middleY, barWidth, barHeight); // Bottom
        }
    }

    drawVisualizer();
}

// Get microphone input and start visualization
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {
      initAudioVisualization(stream); // Pass stream directly
  })
  .catch(function(err) {
      console.error('Error accessing microphone: ', err);
  });
