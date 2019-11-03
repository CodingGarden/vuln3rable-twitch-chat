const ipcRenderer = require('electron').ipcRenderer;     
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  window.alert = (...args) => console.log('blocked alert:', ...args);
  window.prompt = (...args) => console.log('blocked prompt:', ...args);
  console.log('Ready!');
  window.sendAuthors = (authors) => ipcRenderer.send('authors', authors);
});
