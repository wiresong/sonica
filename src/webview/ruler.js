import { halfstepToFrequency, seventhInterval } from './utils';


export class Ruler {
    constructor({ context, destination, index, position }) {
        this.context = context;
        this.node = null;
        this.destination = destination;
        this.intermediateGain = this.context.createGain();
        this.intermediateGain.connect(destination);
        this.setPosition(index, position);
    }

    setPosition(index, position) {
        this.position = position;
        this.frequency = halfstepToFrequency(seventhInterval(index) - 12);
    }

    update(cursor) {
        let shouldPlay = cursor > this.position;
        if (shouldPlay) {
            this.maybeStartPlaying();
        } else {
            this.maybeStopPlaying();
        }
    }

    maybeStartPlaying() {
        if (this.playing) {
            return;
        }

        let ct = this.context.currentTime;
        this.node = this.context.createOscillator();
        this.node.frequency.value = 100;
        this.node.frequency.exponentialRampToValueAtTime(this.frequency, ct + 0.03);
        this.node.start();
        this.intermediateGain.gain.value = 1.0;
        this.node.connect(this.intermediateGain);
        this.playing = true;
    }

    maybeStopPlaying() {
        if (!this.playing) {
            return;
        }

        let ct = this.context.currentTime;
        this.intermediateGain.gain.value = 1.0;
        this.intermediateGain.gain.exponentialRampToValueAtTime(0.00001, ct + 0.03);
        this.node.stop(ct + 0.04);
        this.node = null;
        this.playing = false;
    }
}
