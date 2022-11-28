import { ChildProcess, exec } from 'child_process';
import * as vscode from 'vscode';

export class AudioBackend {
  proc: ChildProcess;
  constructor(path: string) {
    this.proc = exec('audio.exe', { cwd: path });
    this.proc.stderr?.on('data', vscode.window.showInformationMessage);
    this.proc.stdout?.on('data', vscode.window.showInformationMessage);
  }

  write(command: string, data: any = {}) {
    this.proc.stdin?.write(JSON.stringify({ command, ...data }) + '\n');
  }

  play() {
    this.write("Play");
  }

  pause() {
    this.write("Pause");
  }

  volume(volume: number) {
    this.write("Volume", { volume });
  }

  sound(sound: string, position: number = 0.0) {
    this.write("Sound", { sound, position });
  }

  tones(tones: number) {
    this.write("Tones", { tones });
  }
}
