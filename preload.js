const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onTrayToggle: (callback) => ipcRenderer.on('tray-toggle', callback),
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body })
});
