// The setup screen sets the server; the app itself shows reminders as native notifications.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('capriDesktop', {
  setServer: (url) => ipcRenderer.invoke('capri:set-server', url),
  notify: (n) => ipcRenderer.send('capri:notify', n),
  openApp: () => ipcRenderer.send('capri:open'),
  widgetDone: () => ipcRenderer.send('capri:widget-done'),
});
