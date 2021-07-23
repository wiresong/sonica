import { halfstepToFrequency, seventhInterval } from './utils';


export class Ruler {
  constructor(context, index, position) {
    this.context = context;
    this.position = position;
    this.node = context.createOscillator();
    this.node.frequency.value = 0;
    this.node.start();
    this.node.connect(context.destination);
    this.frequency = halfstepToFrequency(seventhInterval(index) - 12);
    this.playing = false;
  }

  setPosition(index, position) {
    this.position = position;
    this.frequency = halfstepToFrequency(seventhInterval(index) - 12);
  }

  update(cursor) {
    this.playing = cursor > this.position;
    if (this.playing) {
      this.node.frequency.linearRampToValueAtTime(this.frequency, this.context.currentTime + 0.2);
    } else {
      this.node.frequency.linearRampToValueAtTime(0, this.context.currentTime + 0.2);
    }
  }
}
