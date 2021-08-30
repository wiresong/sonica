import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let enabled: boolean;
  let rulers: number[];
  let enablePanning: boolean;
  let enableDiagnostics: boolean;
  let volume: number;

  const setConfigurationVariables = () => {
    enabled = vscode.workspace.getConfiguration('sonica').get('enabled', true);
    rulers = vscode.workspace.getConfiguration('editor').get('rulers', []);
    enablePanning = vscode.workspace.getConfiguration('sonica').get('enablePanning', false);
    enableDiagnostics = vscode.workspace.getConfiguration('sonica').get('enableDiagnostics', false);
    volume = vscode.workspace.getConfiguration('sonica').get('volume', 0.25);
  };

  const toggleEnabled = () => {
    if (enabled) {
      webview.webview.postMessage({"cmd": "play", volume});
    } else {
      webview.webview.postMessage({"cmd": "pause", volume});
    }
  };

  let isWebviewDisposed = false;

  let previousLineLength: number = 0;

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

  setConfigurationVariables();
  toggleEnabled();

  vscode.workspace.onDidChangeConfiguration(e => {
    setConfigurationVariables();
    toggleEnabled();
  });

  vscode.window.onDidChangeTextEditorSelection(e => {
    if (isWebviewDisposed || !webview.visible) {
      webview.dispose();
      webview = createWebview();
      isWebviewDisposed = false;
    }

    if (e.selections[0].isSingleLine) {
      let line = e.textEditor.document.lineAt(e.selections[0].active.line);
      let lineNumber = line.lineNumber;
      let text = line.text;
      let cursor = e.selections[0].end.character;
      let tabSize: number = e.textEditor.options.tabSize as number;
      let tabs = (line.text.match(/\t/g)??[]).length;

      for (let i=0; i<tabs; i++) {
        let tabPosition = text.indexOf('\t');
        let tabWidth = tabSize-(tabPosition%tabSize);
        text = text.replace('\t', ' '.repeat(tabWidth));
        
        if (tabPosition <= cursor) {
          cursor += tabWidth-1;
        }
      }

      let lineLength = text.length;

      // When typing a character, the cursor moves to character position  + 1, i.e. the blank space right after the character
      // When navigating, the cursor equals the position of the character being focused
      // We check if we're only navigating, and update the cursor as a result
      // If you want to change this, remember that lineLength and cursor are currently both 1-indexed
      if (previousLineLength === lineLength) {
        cursor += 1;
      } else {
        if (cursor===0) cursor+=1; // When you move right to the beginning of the line, the cursor is 0; may fix this to be better later
        previousLineLength = lineLength;
      }

      webview.webview.postMessage({
        "cmd": "cursor",
        lineLength,
        cursor,
        rulers: rulers.sort((a, b) => (a - b)),
        enablePanning,
        enableDiagnostics,
        volume,
        lineNumber
      });
    }
  });

  vscode.window.onDidChangeWindowState(e=>{
    if (e.focused && enabled) {
      webview.webview.postMessage({"cmd": "play", volume});
    } else {
      webview.webview.postMessage({"cmd": "pause", volume});
    }
  });

  vscode.languages.onDidChangeDiagnostics(e=>{
    webview.webview.postMessage({
      'cmd': 'diag',
      enableDiagnostics,
      uris: e.uris,
      diagnostics: vscode.languages.getDiagnostics()
    });
  });
}


export function deactivate() { }

function html(webview: vscode.Webview, extpath: string) {
  const uri = webview.asWebviewUri(vscode.Uri.file(path.join(extpath + '/dist', 'webview.js')));
  return `
  <html>
<head>
<title>Sonica</title>
</head>
<body>
<script src="${uri}"></script>
</body>
</html>
  `;
}