import { createRoot } from 'react-dom/client';
import App from './App';
import {rendererEvent} from './eventHandler'

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

// calling IPC exposed from preload script
window.electron.ipcRenderer.on('ipc-example', (arg) => {
  if ((arg as any)[0].query == 'fetchHotkeys') {
    console.log('$$$$$$$$$$$response fetchHotkeys')
    rendererEvent.emit('fetchedHotkeys', (arg as any)[0].data)
  }
  if ((arg as any)[0].query == 'fetchConfig') {
    console.log('$$$$$$$$$$$response fetchHotkeys')
    rendererEvent.emit('fetchedConfig', (arg as any)[0].data)
  }
});
window.electron.ipcRenderer.sendMessage('ipc-example', [{
  query: 'fetchHotkeys',
  data: {}
}]);
window.electron.ipcRenderer.sendMessage('ipc-example', [{
  query: 'fetchConfig',
  data: {}
}]);

rendererEvent.on('fetchHotkeys', () => {
  window.electron.ipcRenderer.sendMessage('ipc-example', [{
    query: 'fetchHotkeys',
    data: {}
  }]);
})
rendererEvent.on('saveHotkeys', (data) => {
  window.electron.ipcRenderer.sendMessage('ipc-example', [{
    query: 'saveHotkeys',
    data: data
  }]);
})
rendererEvent.on('saveConfig', (data) => {
  window.electron.ipcRenderer.sendMessage('ipc-example', [{
    query: 'saveConfig',
    data: data
  }]);
})
rendererEvent.on('registerHotkeys', (data) => {
  window.electron.ipcRenderer.sendMessage('ipc-example', [{
    query: 'registerHotkeys',
    data: {}
  }]);
})
rendererEvent.on('unregisterHotkeys', (data) => {
  window.electron.ipcRenderer.sendMessage('ipc-example', [{
    query: 'unregisterHotkeys',
    data: {}
  }]);
})

