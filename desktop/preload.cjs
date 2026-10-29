// The setup screen sets the server; the app itself shows reminders as native notifications.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('capriDesktop', {
  setServer: (url) => ipcRenderer.invoke('capri:set-server', url),
  notify: (n) => ipcRenderer.send('capri:notify', n),
  openApp: () => ipcRenderer.send('capri:open'),
  widgetDone: () => ipcRenderer.send('capri:widget-done'),
  widgetMenu: () => ipcRenderer.send('capri:widget-menu'),
  widgetResize: (size) => ipcRenderer.send('capri:widget-resize', size),
  // The sidebar's widget panel
  widgetSettings: () => ipcRenderer.invoke('capri:widget-get'),
  setWidgetSettings: (changes) => ipcRenderer.invoke('capri:widget-set', changes),
  onWidgetChanged: (cb) => ipcRenderer.on('capri:widget-changed', (e, state) => cb(state)),
});
