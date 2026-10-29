// The setup screen sets the server; the app itself shows reminders as native notifications.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('capriDesktop', {
  setServer: (url) => ipcRenderer.invoke('capri:set-server', url),
  notify: (n) => ipcRenderer.send('capri:notify', n),
  openApp: () => ipcRenderer.send('capri:open'),
  widgetDone: () => ipcRenderer.send('capri:widget-done'),
  widgetMenu: () => ipcRenderer.send('capri:widget-menu'),
  widgetResize: (size) => ipcRenderer.send('capri:widget-resize', size),
  // Capri's widget settings
  widgetSettings: () => ipcRenderer.invoke('capri:widget-get'),
  updateWidget: (id, changes) => ipcRenderer.invoke('capri:widget-update', id, changes),
  addWidget: (kind) => ipcRenderer.invoke('capri:widget-add', kind),
  removeWidget: (id) => ipcRenderer.invoke('capri:widget-remove', id),
  peekWidgets: (on) => ipcRenderer.invoke('capri:widget-peek', on),
  onWidgetChanged: (cb) => ipcRenderer.on('capri:widget-changed', (e, state) => cb(state)),
  onOpenWidgetStudio: (cb) => ipcRenderer.on('capri:open-widget-studio', (e, id) => cb(id)),
});
