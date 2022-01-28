/* strict mode */

const electron = require('electron');
const { ipcMain } = require('electron')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
let mainWindow;
let pids = [];

function createWindow() {
  require('@electron/remote/main').initialize()
  mainWindow = new BrowserWindow({
    width: 1280, height: 1024,
    webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
        preload: `${__dirname}/preload.js`
    }
  });
  require('@electron/remote/main').enable(mainWindow.webContents);  
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  //mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
ipcMain.on('pid-message', function (event, arg) {
  console.log('Main:', arg);
  pids.push(arg);
});
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  var kill = require('tree-kill');
  console.log(pids);
  pids.forEach(function (pid) {
    kill(pid, 'SIGKILL', function (err) {
      if (err) { throw new Error(err); }
      else { console.log('Process %s has been killed!', pid); }
    });
  });
  app.quit();
  //}
});


function openFile() {
  electron.showOpenDialog({ properties: ['openFile'] }, (filePath) => {

    mainWindow.webContents.send('open_file', filePath);
  })
}
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
function installMenu() {
  var Menu = require('menu');
  if (process.platform == 'darwin') {
    menu = Menu.buildFromTemplate([
      {
        label: 'Electron',
        submenu: [
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function () { app.quit(); }
          },
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Reload',
            accelerator: 'Command+R',
            click: function () { mainWindow.restart(); }
          },
          {
            label: 'Toggle Full Screen',
            accelerator: 'Ctrl+Command+F',
            click: function () { mainWindow.setFullScreen(!mainWindow.isFullScreen()); }
          },
          {
            label: 'Toggle Developer Tools',
            accelerator: 'Alt+Command+I',
            click: function () { mainWindow.toggleDevTools(); }
          },
        ]
      }
    ]);
    Menu.setApplicationMenu(menu);
  } else {
    menu = Menu.buildFromTemplate([
      {
        label: '&View',
        submenu: [
          {
            label: '&Reload',
            accelerator: 'Ctrl+R',
            click: function () { mainWindow.restart(); }
          },
          {
            label: 'Toggle &Full Screen',
            accelerator: 'F11',
            click: function () { mainWindow.setFullScreen(!mainWindow.isFullScreen()); }
          },
          {
            label: 'Toggle &Developer Tools',
            accelerator: 'Alt+Ctrl+I',
            click: function () { mainWindow.toggleDevTools(); }
          },
        ]
      }
    ]);
    mainWindow.setMenu(menu);
  }

}
