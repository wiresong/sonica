import {WaveFile} from 'wavefile';

import { Ruler } from './ruler';
import {normalize, range} from './utils';
import {click} from './files';


class FileNode {
  constructor(context, gain, buff) {
    this.context = context;
    this.gain = gain;
    let wav = new WaveFile();

    wav.fromBase64(buff);
    wav.toSampleRate(context.sampleRate);
    let samples = wav.getSamples();
    this.audioBuffer = context.createBuffer(wav.fmt.numChannels, wav.fmt.numChannels === 1 ? samples.length : samples[0].length, context.sampleRate);
    if (wav.fmt.numChannels === 1) {
      let channel = this.audioBuffer.getChannelData(0);
      channel.set(samples.map(sample=>normalize(sample, -(2**(wav.bitDepth-1)), 2**(wav.bitDepth-1)-1)));
    } else {
      for (let i=0; i<wav.fmt.numChannels; i++) {
        let channel = this.audioBuffer.getChannelData(i);
        channel.set(samples[i].map(sample=>normalize(sample, -(2**(wav.bitDepth-1)), 2**(wav.bitDepth-1)-1)));
      }
    }

    this.node = null;
    this.panner = null;
  }

  createNode() {
    let node = this.context.createBufferSource();
    let panner = context.createPanner();
    node.buffer = this.audioBuffer;

    node.connect(panner);
    panner.connect(this.gain);
    this.node = node;
    this.panner = panner;
  }

  play(pos=0) {
    this.stop();
    this.createNode();
    this.panner.positionX.value = pos;
    this.node.start();
    this.node.oended = (() => {
      this.stop();
    });
  }

  stop() {
    if (this.node !== null) {
      this.panner.disconnect();
      this.node.disconnect();
      this.node = null;
      this.panner = null;
    }
  }
}



let context;
let osc;
let gain;
let rulerNodes = [];

window.onload=(event)=> {
  context = new window.AudioContext();
  gain = context.createGain();
  gain.gain.value = 0.25;

  osc = new FileNode(context, gain, click);

  gain.connect(context.destination);

  window.addEventListener('message', (event) => {
    let state = event.data;

    // special-case play/pause...
    if (state==="pause") {
      gain.gain.linearRampToValueAtTime(0, context.currentTime+0.2);
    } else if (state==="play") {
      gain.gain.linearRampToValueAtTime(0.25, context.currentTime+0.2);
    }

    console.log(state);
    updateRulerNodes(state.rulers);

    /*if (state.rulers.length > 0 && state.cursor > state.rulers[0]) {
      playBeep();
    }*/

    playBeep(state.rulers, state.cursor);

    for (const ruler of rulerNodes) {
      ruler.update(state.lineLength, context.currentTime);
    }
  });
};

const playBeep = (rulers, cursor) => {
  let r = new range(rulers);
  let [min, max] = r.getBoundsFor(cursor);
  let position;
  if (min===undefined) {
    position = 1;
  } else {
    position = normalize(cursor, min, max);
  }
  osc.play(position);
};

const updateRulerNodes = rulers => {
  for (const [index, position] of rulers.entries()) {
    if (rulerNodes[index]!==undefined) {
      rulerNodes[index].setPosition(index, position);
    } else {
      let node = context.createOscillator();
      node.frequency.value = 0;
      node.start();
      node.connect(gain);
      rulerNodes.push(new Ruler(node, index, position));
    }
  }
  // Delete any extraneous nodes...
  rulerNodes.splice(rulers.length);
};
