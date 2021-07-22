// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let rulers = vscode.workspace.getConfiguration('editor').get('rulers')??[];

  vscode.workspace.onDidChangeConfiguration(e=>{
    if (e.affectsConfiguration('editor')) {
      rulers = vscode.workspace.getConfiguration('editor').get('rulers')??[];
    }
  });

  const webview = vscode.window.createWebviewPanel('test', 'test', {viewColumn: vscode.ViewColumn.Beside, preserveFocus: true}, {enableScripts: true});
  webview.webview.html = html(context.extensionPath);

  vscode.window.onDidChangeTextEditorSelection(e => {
    if (e.selections[0].isSingleLine) {
      let line = e.textEditor.document.lineAt(e.selections[0].active.line);
      let lineLength = line.range.end.character-line.range.start.character;
      webview.webview.postMessage({lineNumber: line.range.start.line, lineLength, cursor: e.selections[0].end.character, rulers });
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() { }

function html(extpath: string) {
  const uri = vscode.Uri.file(path.join(extpath + '/dist', 'webview.js')).with({ scheme: "vscode-resource" });
  return `
  <html>
<head>
<title>thing</title>
</head>
<body>
<script src="${uri}"></script>
</body>
</html>

  `;
}