document.addEventListener("DOMContentLoaded", () => {
    try {
        startAudioVisuals();
    } catch (ex) {
        showNote('error', ex.toString());
    }
});

function initAudioVisualization(stream) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 256; 

    const canvas = document.getElementById('audioCanvas');

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

    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
    
        ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
        analyser.getByteFrequencyData(dataArray);
        const barWidth = canvas.width / 40;
        const middleY = canvas.height / 2 ; 
    
        
        ctx.beginPath();
        ctx.moveTo(0, middleY);
        ctx.lineTo(canvas.width, middleY);
        ctx.strokeStyle = '#fff';  
        ctx.lineWidth = 2;
        ctx.stroke();
    
        
        for (let i = 0; i < dataArray.length; i++) {
            
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
    
            
            ctx.fillRect(x, middleY - barHeight, barWidth, barHeight); 
            ctx.fillRect(x, middleY, barWidth, barHeight); 
        }
    }

    drawVisualizer();
}

function startAudioVisuals() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
          initAudioVisualization(stream); 
      })
      .catch(function(err) {
          console.error('Error accessing microphone: ', err);
      });
}
