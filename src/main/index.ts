import { app, shell, BrowserWindow, ipcMain, screen, dialog } from "electron";
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { parseFile } from 'music-metadata'
import fs from 'fs'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

// 设置日志文件路径
log.transports.file.resolvePath = () => path.join(app.getPath('userData'), 'logs/main.log')

// 设置日志等级
log.transports.file.level = 'info'

// 关联 autoUpdater 日志输出
autoUpdater.logger = log

autoUpdater.autoDownload = false // 自动下载更新
let mainWindow: BrowserWindow | null = null
function createWindow(): void {
  // Create the browser window.
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize
  const windowWidth = Math.floor(screenWidth * 0.65)
  const windowHeight = Math.floor(screenHeight * 0.7)
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    show: false,
    autoHideMenuBar: true,
    frame: false,
    maximizable: false,
    resizable: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      webSecurity: process.env.NODE_ENV === 'production',
      contextIsolation: true,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.setTitle('聆听音乐')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  //自动检测更新
  autoUpdater.checkForUpdates()
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('quit-app', () => app.quit())


//  最小化
ipcMain.on('minimize-app', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.minimize();
});

// 选择文件夹
ipcMain.handle('select-music-file', async () => {
  const result = await dialog.showOpenDialog({
    title: '选择音乐文件',
    properties: ['openDirectory'],
    buttonLabel: '选择此文件夹'
  })
  if (result.canceled) {
    return null
  }
  const folderPath = result.filePaths[0];

  // 遍历文件夹
  function traverseFolder(dirPath: string): string[] | null {
    try {
      let files: string[] = [];
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          files = files.concat(traverseFolder(fullPath) || []); // 遇到 null 用空数组代替
        } else {
          files.push(fullPath);
        }
      }

      return files;
    } catch (error) {
      console.error('读取文件夹出错:', error);
      return null;
    }
  }

  const allFiles = traverseFolder(folderPath);
  return allFiles;
})

// 监听渲染进程的请求，读取音频文件
ipcMain.handle('get-audio-duration', async (_, filePath) => {
  try {
    const metadata = await parseFile(filePath);
    const duration = metadata.format.duration || 0;
    return duration; // 返回时长（单位：秒）
  } catch (error) {
    console.error('获取音频时长失败:', error);
    return 0;
  }
});

//选择文件夹
ipcMain.handle('select-download-music-folder', async () => {
  //选择文件夹路径
  const result = await dialog.showOpenDialog({
    title: '选择下载保存的文件',
    properties: ['openDirectory'],
    buttonLabel: '选择此文件夹'
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

// 自动更新代码
// 2. 检测到更新，仅通知渲染进程
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-available') // 你可能需要根据你的窗口引用更改
})

// 3. 下载进度
autoUpdater.on('download-progress', (progressObj) => {
  mainWindow?.webContents.send('update-progress', { percent: progressObj.percent })
})

// 4. 下载完成
autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-downloaded')
})

// 5. 渲染进程请求下载更新
ipcMain.on('download-update', () => {
  autoUpdater.downloadUpdate()
})

// 6. 安装更新
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall()
})
