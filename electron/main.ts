import { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage, ipcMain } from 'electron';
import path from 'path';
import { setupAgentIPC, killAllAgents } from './agent-ipc';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isWidgetMode = false;

const DIST_ELECTRON = path.join(__dirname);
const DIST = path.join(DIST_ELECTRON, '../dist');
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Penguin Office',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(DIST_ELECTRON, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(DIST, 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide Office',
      click: () => {
        if (mainWindow?.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow?.show();
        }
      },
    },
    {
      label: 'Toggle Widget Mode',
      click: () => toggleWidgetMode(),
    },
    { type: 'separator' },
    {
      label: 'Quit Penguin Office',
      click: () => app.quit(),
    },
  ]);
  tray.setToolTip('Penguin Office');
  tray.setContextMenu(contextMenu);
}

function toggleWidgetMode() {
  if (!mainWindow) return;
  isWidgetMode = !isWidgetMode;

  if (isWidgetMode) {
    mainWindow.setAlwaysOnTop(true, 'floating');
    mainWindow.setSize(500, 400);
    mainWindow.setResizable(false);
    mainWindow.setBackgroundColor('#00000000');
    mainWindow.webContents.send('mode-change', 'widget');
  } else {
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setSize(1400, 900);
    mainWindow.setResizable(true);
    mainWindow.setBackgroundColor('#1a1a2e');
    mainWindow.webContents.send('mode-change', 'normal');
  }
}

ipcMain.handle('get-mode', () => isWidgetMode ? 'widget' : 'normal');
ipcMain.handle('toggle-widget', () => toggleWidgetMode());

app.whenReady().then(() => {
  setupAgentIPC();
  createWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Shift+P', () => {
    toggleWidgetMode();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  killAllAgents();
});
