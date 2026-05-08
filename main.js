const { app, BrowserWindow, Tray, Menu, globalShortcut, Notification, nativeImage, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
const notificationsSupported = Notification.isSupported();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 400,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createFallbackIcon() {
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    canvas[i * 4] = 255;
    canvas[i * 4 + 1] = 107;
    canvas[i * 4 + 2] = 107;
    canvas[i * 4 + 3] = 255;
  }
  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  let trayIcon;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = createFallbackIcon();
    }
  } catch (e) {
    trayIcon = createFallbackIcon();
  }

  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: '开始/暂停',
      click: () => {
        mainWindow.webContents.send('tray-toggle');
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('番茄钟');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
  });
}

function toggleWindow() {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Shift+P', toggleWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.on('tray-toggle', toggleWindow);

ipcMain.on('show-notification', (event, { title, body }) => {
  if (notificationsSupported) {
    new Notification({ title, body }).show();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

module.exports = { app };
