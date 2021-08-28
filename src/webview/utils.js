import {WaveFile} from 'wavefile';

// Reference note is A4
const halfstepToFrequency = n=>440*(2**(1/12))**n;

const seventhInterval=n=> {
  let halfstep = 0;
  for (let i=0; i<n; i++) {
    if (i%2===0) {
      halfstep += 4;
    } else {
      halfstep += 3;
    }
  }
  return halfstep;
};

// Note that this normalizes in the range [-1, 1], not [0, 1]
const normalize = (val, min, max) => ((val-min)/(max-min))*2-1;

// This is O(n^2), but we should only use this for diagnostics 
class Range {
  constructor(bounds, include_zero=true) {
    this.bounds = bounds;
    this.bounds.sort((a, b)=>a-b);
    if (include_zero===true && !this.bounds.includes(0)) {
      this.bounds.unshift(0);
    }
  }

  getBoundsFor(n) {
    for (const [index, element] of this.bounds.entries()) {
      if (n <= element ) {
        return [this.bounds[index-1], this.bounds[index]];
      }
    }
    return [];
  }

  contains(n) {
    return this.getBoundsFor(n)[0]!==undefined;
  }
}

class FileNode {
  constructor(context, gain, buff) {
    this.context = context;
    console.log("got context" + context);
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
    let panner = this.context.createPanner();
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

export {FileNode, halfstepToFrequency, normalize, Range, seventhInterval};
