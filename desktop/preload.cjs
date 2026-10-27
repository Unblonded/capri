// Only the setup screen needs to talk to the main process.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('capriDesktop', {
  setServer: (url) => ipcRenderer.invoke('capri:set-server', url),
});
