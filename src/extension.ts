import * as vscode from 'vscode';
import { AudioBackend } from './audio';
import { Cursor } from './cursor';
import { Diagnostics } from './diag';

export function activate(context: vscode.ExtensionContext) {
  let audio = new AudioBackend(context.extensionPath);
  let cursor = new Cursor(audio);
  let diag = new Diagnostics(audio);
  let enabled = false;

  const config = () => {
    enabled = vscode.workspace.getConfiguration('sonica').get('enabled', true);
    enabled ? audio.play() : audio.pause();
    audio.volume(vscode.workspace.getConfiguration('sonica').get('volume', 0.25));
    cursor.setRulers(vscode.workspace.getConfiguration(undefined, vscode.window.activeTextEditor !== undefined ? vscode.window.activeTextEditor.document : undefined).get('editor.rulers', []));
  };

  config();

  vscode.workspace.onDidChangeConfiguration(config);

  let previousLineLength: number = 0;
  let previousLineNumber: number = 0;

  vscode.window.onDidChangeTextEditorSelection(e => {
    if (e.selections[0].isSingleLine) {
      let line = e.textEditor.document.lineAt(e.selections[0].active.line);
      let text = line.text;
      let lineNumber = line.lineNumber;

      let c = e.selections[0].anchor.character;

      let tabs = (line.text.match(/\t/g) ?? []).length;
      let tabSize: number = e.textEditor.options.tabSize as number;

      for (let i = 0; i < tabs; i++) {
        let tabPosition = text.indexOf('\t');
        let tabWidth = tabSize - (tabPosition % tabSize);
        text = text.replace('\t', ' '.repeat(tabWidth));

        if (tabPosition <= c) {
          // the -1 is here because, when you move to the tab character, that counts as incrementing the cursor by one
          // So, to actually represent how much space the tab takes, we have to remove the tab character's contribution
          c += tabWidth - 1;

        }
      }

      let lineLength = text.length;

      // When typing a character, the cursor moves to character position  + 1, i.e. the blank space right after the character
      // When navigating, the cursor equals the position of the character being focused
      // We check if we're only navigating, and update the cursor as a result

      if (previousLineNumber === lineNumber && previousLineLength !== lineLength) {
        c -= 1;
      }

      previousLineLength = lineLength;
      previousLineNumber = lineNumber;

      cursor.cursor(c);
      cursor.rulers(c);
    }
  });

  vscode.languages.onDidChangeDiagnostics(e => diag.uris(e.uris));


  vscode.window.onDidChangeWindowState(e => {
    if (e.focused && enabled) {
      audio.play();
    } else {
      audio.pause();
    }
  });

}


// this method is called when your extension is deactivated
export function deactivate() { }
