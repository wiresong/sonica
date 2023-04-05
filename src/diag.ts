import { Diagnostic, DiagnosticSeverity, languages, Uri } from "vscode";

import { AudioBackend } from "./audio";

export class Diagnostics {
  data: Map<Uri, Array<Diagnostic>>;
  audio: AudioBackend;
  constructor(audio: AudioBackend) {
    this.data = new Map();
    this.audio = audio;
  }

  uris(uris: readonly Uri[]) {
    for (const uri of uris) {
      this.uri(uri);
    }
  }

  uri(uri: Uri) {
    let currentDiagnostics = languages.getDiagnostics(uri);

    let oldDiagnostics = this.data.get(uri) ?? [];
    let newDiagnostics = [];
    // this is horrible algorithmic performance. Might make this better later
    for (const diag of currentDiagnostics) {
      if (oldDiagnostics.length === 0) {
        newDiagnostics.push(diag);
      }
      newDiagnostics.push(...oldDiagnostics.filter(d => !isEqual(diag, d)));
    }

    for (const diag of newDiagnostics) {
      this.diagnostic(diag);
    }

    this.data.set(uri, currentDiagnostics);
  }

  diagnostic(diag: Diagnostic) {
    switch (diag.severity) {
      case DiagnosticSeverity.Warning:
        this.audio.sound('warning.wav');
      case DiagnosticSeverity.Error:
        this.audio.sound('error.wav');
    }
  }
}

let isEqual: (d1: Diagnostic, d2: Diagnostic) => boolean = (d1, d2) => d1.range.start === d2.range.start && d1.range.end === d2.range.end && d1.severity === d2.severity;
