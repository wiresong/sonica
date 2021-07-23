// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { create } from 'domain';
import * as path from 'path';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let rulers: number[] = vscode.workspace.getConfiguration('editor')
    .get('rulers') ?? [];

  let isWebviewDisposed = false;


  vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('editor')) {
      rulers = vscode.workspace.getConfiguration('editor').get('rulers') ?? [];
    }
  });

  const createWebview = () => {
    let _webview = vscode.window.createWebviewPanel('Sonica', 'Sonica', {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: true,
    },
    {
      enableScripts: true 
    });

    _webview.webview.html = html(_webview.webview, context.extensionPath);
    _webview.onDidDispose(e=>{
      isWebviewDisposed = true;
    });
    return _webview;
  };



  let webview = createWebview();

  vscode.window.onDidChangeTextEditorSelection(e => {
    if (isWebviewDisposed || !webview.visible) {
      webview.dispose();
      webview = createWebview();
      isWebviewDisposed = false;
    }

    if (e.selections[0].isSingleLine) {
      let line = e.textEditor.document.lineAt(e.selections[0].active.line);
      let lineLength = line.range.end.character - line.range.start.character;
      webview.webview.postMessage({
        lineNumber: line.range.start.line,
        lineLength,
        cursor: e.selections[0].end.character,
        rulers: rulers.sort((a, b) => (a - b))
      });
    }
  });

  vscode.window.onDidChangeWindowState(e=>{
    webview.webview.postMessage(e.focused? "play" : "pause");
  });
}

// this method is called when your extension is deactivated
export function deactivate() { }

function html(webview: vscode.Webview, extpath: string) {
  const uri = webview.asWebviewUri(vscode.Uri.file(path.join(extpath + '/dist', 'webview.js')));
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