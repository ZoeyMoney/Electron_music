import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  quitApp: (): void => ipcRenderer.send('quit-app'), // 向主进程发送退出应用的事件
  minimizeApp: (): void => ipcRenderer.send('minimize-app'), //最小化
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (_, data) => callback(data)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  installUpdate: () => ipcRenderer.send('install-update'),
  selectMusicFolder: () => ipcRenderer.invoke('select-music-file'), //选择文件夹
  getAudioDuration: (filePath: string): Promise<number> => ipcRenderer.invoke('get-audio-duration', filePath), // 获取音频时长
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
