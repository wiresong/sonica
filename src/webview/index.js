console.log('hi!');
let context;
let osc;
let gain;
let oldState;
let rulerNodes = new Map();

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
    let rulers = state.rulers.sort((a, b)=>a>b);
    if (rulers.length > 0 && state.lineLength > rulers[0]) {
      if (state.cursor > rulers[0]) {
        playBeep();
      }
    }
    playRulers(rulers.filter(ruler=>state.lineLength>ruler));

    oldState=state;
  });
};

const playBeep = () => {
  gain.gain.setValueAtTime(1, context.currentTime);
  gain.gain.linearRampToValueAtTime(0, context.currentTime+0.1);
};

const playRulers = (rulers) => {
  console.log('rulers:' + rulers);
  for (const [ruler, node] of rulerNodes) {
    if (rulers.includes(ruler)) {
      node.frequency.linearRampToValueAtTime(node.frequencyToPlay, context.currentTime+0.2);
      console.log('frequency:'+node.frequencyToPlay);
    } else {
      node.frequency.linearRampToValueAtTime(0, context.currentTime+0.2);
    }
  }
};

// Reference note is middle C
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

const updateRulerNodes = rulers => {
  // Todo: it might be better to not recreate every node here with an update in rulers
  // But that would require keeping track of which ruler should be associated with which frequency; which is doable, but the setting should be updated atypically enough for it not to matter
  // Massive hack, will fix once we switch over to a better build system and can pull in lodash
  if (JSON.stringify(rulers)!==JSON.stringify([...rulerNodes.keys()])) {
    rulerNodes.clear();
    for (const [index, ruler] of rulers.entries()) {
      let node = context.createOscillator();
      node.frequency.value = 0;
      node.frequencyToPlay = halfstepToFrequency(seventhInterval(index)-12);
      console.log(node.frequencyToPlay);
      node.start();
      node.connect(context.destination);
      rulerNodes.set(ruler, node);
    }
  }
};
