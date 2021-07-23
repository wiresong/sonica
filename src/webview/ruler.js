import { halfstepToFrequency, seventhInterval } from './utils';


export class Ruler {
  constructor(node, index, position) {
    this.node = node;
    this.playing = false;
    this.setPosition(index, position);
  }

  setPosition(index, position) {
    this.position = position;
    this.frequency = halfstepToFrequency(seventhInterval(index) - 12);
  }

  update(cursor, currentTime) {
    this.playing = cursor > this.position;
    if (this.playing) {
      this.node.frequency.linearRampToValueAtTime(this.frequency, currentTime + 0.2);
    } else {
      this.node.frequency.linearRampToValueAtTime(0, currentTime + 0.2);
    }
  }
}
