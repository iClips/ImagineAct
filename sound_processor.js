class SoundProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.port.onmessage = (event) => {
            this.port.postMessage(this.getFrequencyData());
        };
    }

    getFrequencyData() {
        const frequencyData = new Uint8Array(this.port.currentFrameLength);
        this.port.audioContext.analyser.getByteFrequencyData(frequencyData);
        return frequencyData;
    }

    process(inputs, outputs, parameters) {
        return true; 
    }
}

registerProcessor('sound-processor', SoundProcessor);
