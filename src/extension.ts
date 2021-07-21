// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const webview = vscode.window.createWebviewPanel('test', 'test', {viewColumn: vscode.ViewColumn.Beside, preserveFocus: true}, {enableScripts: true});
  webview.webview.html = html();
  //vscode.window.onDidChangeTextEditorSelection(e=>webview.webview.postMessage({}));

  vscode.workspace.onDidChangeTextDocument(e => {
    if (e.contentChanges.filter(i => i.text.includes('\n')).length > 0) {
      webview.webview.postMessage({test: "test"});
    }
  });  
}

// this method is called when your extension is deactivated
export function deactivate() { }

function html() {
  return `
  <html>
<head>
<title>thing</title>
</head>
<body>
<script>
const AudioContext = window.AudioContext || window.webkitAudioContext;

let context;
let osc;
let gain;

window.onload=(event)=> {
  context = new AudioContext();
  osc = context.createOscillator();
  gain = context.createGain();
  gain.gain.value = 0;
  osc.type = 'square';
  osc.frequency.setValueAtTime(440, context.currentTime);
  osc.start();
  osc.connect(gain);
  gain.connect(context.destination);

  window.addEventListener('message', (event) => {
    gain.gain.setValueAtTime(1, context.currentTime);
    gain.gain.linearRampToValueAtTime(0, context.currentTime+0.1);
  });
};


</script>

</body>
</html>

  `;
}