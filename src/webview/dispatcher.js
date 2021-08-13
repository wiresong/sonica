export class Dispatcher {
  constructor(globalState) {
    this.globalState = globalState;
    // A map where keys are regular expressions and values are feature instances
    this.features = new Map();
  }

  register(command, feature) {
    this.features.set(command, new feature(this.globalState));
  }

  dispatch(state) {
    for (const [key, value] of this.features) {
      if (key.exec(state.cmd)) {
        value.run(state);
      }
    }
  }
}
