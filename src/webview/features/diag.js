import { differenceWith, isEqual } from 'lodash';

import { Feature } from './feature';

import { error, warning } from '../files';
import { FileNode, Range } from '../utils';


export class Diag extends Feature {
  constructor(globalState) {
    // I'm really not happy with how this is designed
    // the problem with doing this like we do buffers is that when new diagnostics are introduced, they need to play sound
    // For buffers we could straightforwardly map a cursor to an on-off state
    // But if we keep around diagnostic objects in this case and update them as new diagnostics arrive
    // There may be cases when the diagnostic objects don't map to the array exactly (not just having a longer array, but e.g. the array shifts to the right)
    // In this case, all the diagnostic objects will be updated, and we would have all the diagnostics playing the new diagnostic sound
    // even though the only thing that happened is that the position of the diagnostics in the array has changed
    // But, really: refactor this to something better, later
    super(globalState);
    this.error = new FileNode(this.context, this.globalGain, error);
    this.warning = new FileNode(this.context, this.globalGain, warning);

    this.diagnostics = [];
    this.previousLineNumber = undefined;
  }

  run(state) {
    if (state.enableDiagnostics === true) {
      if (state.cmd === 'diag') {
        this.handleUpdatedDiagnostics(state);
      } else if (state.cmd === 'cursor') {
        this.handleCursor(state);
      }
    }
  }

  handleUpdatedDiagnostics(state) {
    let newDiagnostics = [];
    for (const uri of state.uris) {
      let old_values = this.diagnostics.find(element => isEqual(element[0], uri))?.[1];
      let new_values = state.diagnostics.find(element => isEqual(element[0], uri))?.[1];
      let changed = differenceWith(new_values, old_values, isEqual);
      newDiagnostics.push(...changed);
    }

    // Todo: space out the sounds a little bit. 0.25 seconds?
    for (const diagnostic of newDiagnostics) {
      this.playDiagnosticSound(diagnostic);
    }
    this.diagnostics = state.diagnostics;
  }

  handleCursor(state) {
    let { cursor, lineNumber } = state;
    let diagnostics = this.diagnostics.filter(element => element[0].external === state.uri.external)
      .flatMap(element => element[1])
      .filter(diag => diag.range[0].line === lineNumber);
    for (const diagnostic of diagnostics) {
      let range = new Range([diagnostic.range[0].character, diagnostic.range[1].character], false);
      if (this.previousLineNumber !== lineNumber || range.contains(cursor)) {
        this.playDiagnosticSound(diagnostic);
      }
    }
    this.previousLineNumber = lineNumber;
  }

  playDiagnosticSound(diagnostic) {
    if (diagnostic.severity === 'Error') {
      this.error.play();
    } else if (diagnostic.severity === 'Warning') {
      this.warning.play();
    }
  }
}

