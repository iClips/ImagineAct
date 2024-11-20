let isVisualizerCircular = false;

function initAudioVisualization(stream) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 256;

    const canvas = document.getElementById('audioCanvas');
    if (canvas) {

        canvas.addEventListener('click', () => {
            if (!isVisualizerCircular) {
                canvas.classList.add('circular');
                drawCircularVisualizer();                
                isVisualizerCircular = true;
            } else {
                canvas.classList.remove('circular');
                drawVisualizer();
                isVisualizerCircular = false;
            }
        });        
    }
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const frequencyBoost = 1.6;

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
    
    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        analyser.getByteFrequencyData(dataArray);
        const barWidth = canvas.width / 40;
        const middleY = canvas.height / 2;

        ctx.beginPath();
        ctx.moveTo(0, middleY);
        ctx.lineTo(canvas.width, middleY);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        for (let i = 0; i < dataArray.length; i++) {
            const normalizedFrequency = Math.pow(dataArray[i] / 255, frequencyBoost);
            const fluctuation = Math.sin(Date.now() / 200) * 5; // Pulsating effect
            const barHeight = normalizedFrequency * middleY + fluctuation;

            const root = document.documentElement;
            let barColor = '#00ff00';
            if (root) {
                const styles = getComputedStyle(root);
                barColor = styles.getPropertyValue('--button-hover-background').trim();
            }

            const gradient = ctx.createLinearGradient(0, middleY - barHeight, 0, middleY + barHeight);
            gradient.addColorStop(0, '#00ff00');
            gradient.addColorStop(1, '#ff0000');
            ctx.fillStyle = gradient;
            ctx.shadowBlur = 10;
            ctx.shadowColor = barColor;

            const x = i * barWidth;

            ctx.fillRect(x, middleY - barHeight, barWidth, barHeight);
            ctx.fillRect(x, middleY, barWidth, barHeight);
        }
    }

    drawVisualizer();
}

function startAudioVisuals() {
    try {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(function(stream) {
              initAudioVisualization(stream); 
          })
          .catch(function(err) {
              console.error('Error accessing microphone: ', err);
          });        
    } catch (ex) {
        showNote('error', ex.toString());
    }
}

