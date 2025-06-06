import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  quitApp: (): void => ipcRenderer.send('quit-app'), // 向主进程发送退出应用的事件
  minimizeApp: (): void => ipcRenderer.send('minimize-app'), //最小化
  selectMusicFolder: () => ipcRenderer.invoke('select-music-file'), //选择文件夹
  getAudioDuration: (filePath: string): Promise<number> => ipcRenderer.invoke('get-audio-duration', filePath), // 获取音频时长
  selectDownloadFolder: () => ipcRenderer.invoke('select-download-music-folder'),
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
