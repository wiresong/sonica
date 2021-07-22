const path = require('path');

module.exports = {

  entry: './src/webview/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webview.js'
  },
  mode: 'none'
};