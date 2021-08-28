import { Dispatcher } from './dispatcher';

import {Cursor} from './features/cursor';
import {Diag} from './features/diag';
import {Global} from './features/global';
import {PlayPause} from './features/playpause';


window.onload=(event)=> {
  let context = new window.AudioContext();
  let gain = context.createGain();
  gain.gain.value = 0;

  let dispatcher = new Dispatcher({context, globalGain: gain});
  dispatcher.register(/.*/, Global);
  dispatcher.register(/play|pause/, PlayPause);
  dispatcher.register(/cursor/, Cursor);
  dispatcher.register(/diag|cursor/, Diag);
  gain.connect(context.destination);

  window.addEventListener('message', (event) => {
    dispatcher.dispatch(event.data);
  });
};

