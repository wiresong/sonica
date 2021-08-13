import { click } from '../files';
import { FileNode, halfstepToFrequency, normalize, Range, seventhInterval } from '../utils';

import { Feature } from './feature';

export class Cursor extends Feature {
  constructor(globalState) {
    super(globalState);
    this.rulerNodes = [];
    this.lastLineNumber = null;
    this.click = new FileNode(this.context, this.globalGain, click);
  }

  run(state) {
    this.updateRulers(state);
    this.handleLineChange(state);
    this.handleCursorAndRulers(state);
    this.lastLineNumber = state.lineNumber;
  }

  updateRulers(state) {
    for (const [index, position] of state.rulers.entries()) {
      if (this.rulerNodes[index] !== undefined) {
        this.rulerNodes[index].setPosition(index, position);
      } else {
        this.rulerNodes.push(new RulerNode({ context: this.context, destination: this.globalGain, index, position }));
      }
    }
    // Delete any extraneous nodes...
    for (let i = state.rulers.length; i < this.rulerNodes.length; i++) {
      this.rulerNodes[i].maybeStopPlaying();
    }
    this.rulerNodes.splice(state.rulers.length);
  }

  handleLineChange(state) {
    console.log("last line number:" + this.lastLineNumber + ", line number:" + state.lineNumber);
    if (this.rulerNodes.length === 0) return;
    if (state.lineNumber !== this.lastLineNumber && state.lineLength > state.rulers[0]) {
      this.click.play();
    }
  }

  handleCursorAndRulers(state) {
    if (this.rulerNodes.length === 0) return;
    // If the line has changed and panning is enabled, the click will be played twice
    if (this.lastLineNumber === state.lineNumber) {
      if (state.enablePanning === true) {
        let r = new Range(state.rulers);
        let [min, max] = r.getBoundsFor(state.cursor);
        let position;
        if (min === undefined) {
          position = 1;
        } else {
          position = normalize(state.cursor, min, max);
        }
        this.click.play(position);
      } else if (state.cursor > state.rulers[0]) {
        this.click.play();
      }
    }

    for (const node of this.rulerNodes) {
      node.update(state.cursor);
    }
  }
}

class RulerNode {
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
