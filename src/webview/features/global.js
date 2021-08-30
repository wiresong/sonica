import {Feature} from './feature';

export class Global extends Feature {
  run(state) {
    if (state.volume && (state.cmd !== "play" && state.cmd !== "pause")) {
      this.globalGain.gain.value = state.volume;
    }
  }
}