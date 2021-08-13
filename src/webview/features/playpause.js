import {Feature} from './feature';


export class PlayPause extends Feature {
  run(state) {
    if (state.cmd === "pause") {
      this.globalGain.gain.linearRampToValueAtTime(0, this.context.currentTime+0.2);
    } else if (state.cmd === "play") {
      this.globalGain.gain.linearRampToValueAtTime(state.volume, context.currentTime+0.2);
    } else {
      this.globalGain.gain.value = state.volume;
    }
  }
}