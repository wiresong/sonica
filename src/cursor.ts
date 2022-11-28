import { AudioBackend } from "./audio";
import * as vscode from 'vscode';
import { Range } from "./utils";

export class Cursor {
  audio: AudioBackend;
  ranges: Array<Range> = [];

  constructor(a: AudioBackend) {
    this.audio = a;
  }

  setRulers(rulers: Array<number>) {
    rulers.sort((a, b) => a - b);
    rulers.unshift(0);
    rulers.push(Infinity);

    this.ranges = [];
    // I'm really missing some sort of windows function
    for (const [index, ruler] of rulers.slice(0, -1).entries()) {
      this.ranges.push(new Range(ruler, rulers[index + 1]));
    }
  }

  cursor(position: number) {
    for (const range of this.ranges) {
      if (range.contains(position)) {
        this.audio.sound('click.wav', range.normalized(position));
      }
    }
  }

  rulers(position: number) {
    for (const [index, range] of this.ranges.entries()) {
      if (range.contains(position)) {
        this.audio.tones(index);
      }
    }
  }
}
