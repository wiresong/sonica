import { Ruler } from './ruler';


let context;
let osc;
let gain;
let rulerNodes = [];

window.onload=(event)=> {
  context = new window.AudioContext();
  gain = context.createGain();
  gain.gain.value = 1;

  osc = context.createOscillator();
  osc.type = 'square';
  osc.frequency.value=0;
  osc.start();

  osc.connect(gain);
  gain.connect(context.destination);

  window.addEventListener('message', (event) => {

    let state = event.data;

    // special-case play/pause...
    if (state==="pause") {
      gain.gain.linearRampToValueAtTime(0, context.currentTime);
    } else if (state==="play") {
      gain.gain.linearRampToValueAtTime(1, context.currentTime);
    }

    updateRulerNodes(state.rulers);

    if (state.rulers.length > 0 && state.lineLength > state.rulers[0]) {
      for (const ruler of rulerNodes) {
        ruler.update(state.lineLength, context.currentTime);
      }

      if (state.cursor > state.rulers[0]) {
        playBeep();
      }
    }
  });
};

const playBeep = () => {
  osc.frequency.setValueAtTime(440, context.currentTime);
  osc.frequency.setValueAtTime(0, context.currentTime+0.1);
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
