import {Feature} from './feature';

export class Global extends Feature {
  run(state) {
    if (state.volume) {
      this.globalGain.gain.value = state.volume;
    }
  }
}