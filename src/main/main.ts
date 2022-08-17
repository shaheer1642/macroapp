/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, globalShortcut, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import fs  from 'fs'
import Os from 'os'
import {keyboard, Key, mouse, sleep, Button} from "@nut-tree/nut-js"
import { left } from '@nut-tree/nut-js';

const appDocPath = Os.homedir() + '/Documents/MacroApp/'

var hotkeys: any = []
var config: any = {keyboardDelay: 10, mouseDelay: 6, customCommand1ScrollRate: 20, scrollIntensity: 100}

try {
  fs.mkdirSync(appDocPath);
} catch (e) {}
if (!fs.existsSync(appDocPath + 'hotkeys.json')) fs.writeFileSync(appDocPath + 'hotkeys.json','[{"commands":["Select"],"hotkey":"Select"}]')
if (!fs.existsSync(appDocPath + 'config.json')) fs.writeFileSync(appDocPath + 'config.json','{"keyboardDelay": 10, "mouseDelay": 6, "customCommand1ScrollRate": 50, "scrollIntensity": 50}')


class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  if ((arg as any)[0].query == 'fetchConfig') {
    fs.readFile(appDocPath + 'config.json', 'utf8', function(err, data) {
      var writeFlag = false;
      var fileConfig = JSON.parse(data)
      Object.keys(config).forEach(key => {
        if (!Object.keys(fileConfig).includes(key)) {
          writeFlag = true;
          fileConfig[key] = config[key]
        }
      })
      config = fileConfig
      if (writeFlag)
        fs.writeFileSync(appDocPath + 'config.json',JSON.stringify(config))
      console.log('$$$$$$$$$$$read file config.json ')
      event.reply('ipc-example', [{
        query: 'fetchConfig',
        data: config
      }]);
    });
  }
  if ((arg as any)[0].query == 'fetchHotkeys') {
    fs.readFile(appDocPath + 'hotkeys.json', 'utf8', function(err, data){
      hotkeys = JSON.parse(data)
      globalShortcut.unregisterAll()
      registerGlobalHotkeys()
      console.log('$$$$$$$$$$$read file hotkeys.json ')
      event.reply('ipc-example', [{
        query: 'fetchHotkeys',
        data: JSON.parse(data)
      }]);
    });
  }
  if ((arg as any)[0].query == 'saveHotkeys') {
    fs.writeFile(appDocPath + 'hotkeys.json', typeof ((arg as any)[0].data) == 'string' ? (arg as any)[0].data:JSON.stringify((arg as any)[0].data), (err) => {
      if (err)
        console.log(err);
      else {
        console.log('$$$$$$$$$$$written to file hotkeys.json ')
        hotkeys = typeof ((arg as any)[0].data) == 'object' ? (arg as any)[0].data:JSON.parse((arg as any)[0].data)
        globalShortcut.unregisterAll()
        registerGlobalHotkeys()
      }
    });
  }
  if ((arg as any)[0].query == 'saveConfig') {
    fs.writeFile(appDocPath + 'config.json', typeof ((arg as any)[0].data) == 'string' ? (arg as any)[0].data:JSON.stringify((arg as any)[0].data), (err) => {
      if (err)
        console.log(err);
      else {
        console.log('$$$$$$$$$$$written to file config.json ')
        config = typeof ((arg as any)[0].data) == 'object' ? (arg as any)[0].data:JSON.parse((arg as any)[0].data)
        globalShortcut.unregisterAll()
        registerGlobalHotkeys()
      }
    });
  }
  if ((arg as any)[0].query == 'registerHotkeys') {
    globalShortcut.unregisterAll()
    registerGlobalHotkeys()
  }
  if ((arg as any)[0].query == 'unregisterHotkeys') {
    globalShortcut.unregisterAll()
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    title: 'MacroApp',
    width: 800,
    height: 500,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    }
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  //const menuBuilder = new MenuBuilder(mainWindow);
  //menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

const modifierKeys = [
  'LeftAlt',
  'LeftControl',
  'RightAlt',
  'RightControl',
  'LeftShift',
  'RightShift'
]
function registerGlobalHotkeys() {
  keyboard.config.autoDelayMs = config.keyboardDelay
  mouse.config.autoDelayMs = config.mouseDelay
  hotkeys.forEach((hotkey:any) => {
    if (hotkey.hotkey.toLowerCase() != 'select') {
      try {
        const ret = globalShortcut.register(hotkey.hotkey, async () => {
          console.log(`${hotkey.hotkey} is pressed`)

          if (hotkey.commands[0].toLowerCase() == 'customcommand1') {
            await keyboard.pressKey(Key.LeftControl)
            await keyboard.pressKey(Key.S)
  
            for (var i=0; i<Number(config.customCommand1ScrollRate); i++) {
              await mouse.scrollDown(Number(config.scrollIntensity))
            }
  
            await keyboard.releaseKey(Key.S)
            await keyboard.releaseKey(Key.LeftControl)
            return
          }
          if (hotkey.commands[0].toLowerCase() == 'customcommand2') {
            await keyboard.pressKey(Key.E)
            await keyboard.releaseKey(Key.E)
            await sleep(200)
            await mouse.pressButton(Button.RIGHT)
            await mouse.pressButton(Button.LEFT)
            await mouse.releaseButton(Button.LEFT)
            await mouse.releaseButton(Button.RIGHT)
            return
          }

          var releasekeys = []
          for (const command of hotkey.commands) {
            if (command.toLowerCase() != 'select') {
              if (modifierKeys.includes(command)) {
                await keyboard.pressKey(Key[command])
                releasekeys.push(command)
              }
              else if (command.toLowerCase() == 'wheeldown') {
                await mouse.scrollDown(Number(config.scrollIntensity))
              }
              else if (command.toLowerCase() == 'wheelup') {
                await mouse.scrollUp(Number(config.scrollIntensity))
              }
              else if (command.toLowerCase() == 'wheelleft') {
                await mouse.scrollLeft(Number(config.scrollIntensity))
              }
              else if (command.toLowerCase() == 'wheelright') {
                await mouse.scrollRight(Number(config.scrollIntensity))
              }
              else if (command.toLowerCase() == 'leftclick') {
                await mouse.pressButton(Button.LEFT)
                await mouse.releaseButton(Button.LEFT)
              }
              else if (command.toLowerCase() == 'rightclick') {
                await mouse.pressButton(Button.RIGHT)
                await mouse.releaseButton(Button.RIGHT)
              }
              else {
                await keyboard.pressKey(Key[command])
                await keyboard.releaseKey(Key[command])
              }
            }
          }
          for (const key of releasekeys) {
            await keyboard.releaseKey(Key[key])
          }
        })
      } catch(e) {
        dialog.showMessageBox((mainWindow as BrowserWindow), { title: 'Error registering hotkey', message: `The hotkey '${hotkey.hotkey}' could not be registered. Please select a different key\n\n${e}`})
      }
    }
  })
}
