import { Ruler } from './ruler';


let context;
let osc;
let gain;
let oldState;
let rulerNodes = [];

// Eventually we should be able to phase out index altogether; it's just used to compute the frequency for the oscillator

window.onload=(event)=> {
  context = new window.AudioContext();
  osc = context.createOscillator();
  gain = context.createGain();
  gain.gain.value = 0;
  osc.type = 'square';
  osc.frequency.setValueAtTime(440, context.currentTime);
  osc.start();
  osc.connect(gain);
  gain.connect(context.destination);

  window.addEventListener('message', (event) => {
    console.log(event.data);
    let state = event.data;

    updateRulerNodes(state.rulers);
    console.log('State:' + JSON.stringify(oldState) + ', new state: ' + JSON.stringify(state));
    if (state.rulers.length > 0 && state.lineLength > state.rulers[0]) {
      if (state.cursor > state.rulers[0]) {
        playBeep();
      }
    }
    for (const ruler of rulerNodes) {
      ruler.update(state.lineLength);
    }

    oldState=state;
  });
};

const playBeep = () => {
  gain.gain.setValueAtTime(1, context.currentTime);
  gain.gain.linearRampToValueAtTime(0, context.currentTime+0.1);
};


const updateRulerNodes = rulers => {
  for (const [index, position] of rulers.entries()) {
    if (rulerNodes[index]!==undefined) {
      rulerNodes[index].setPosition(index, position);
    } else {
      rulerNodes.push(new Ruler(context, index, position));
    }
  }
  // Delete any extraneous nodes...
  rulerNodes.splice(rulers.length);
};
