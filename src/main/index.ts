import { app, shell, BrowserWindow, ipcMain, screen, dialog, Tray, Menu } from "electron";
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { parseFile } from 'music-metadata'
import fs from 'fs'
import path from 'node:path'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

// 设置日志文件路径
log.transports.file.resolvePathFn = () => path.join(app.getPath('userData'), 'logs/main.log')
// 设置日志等级
log.transports.file.level = 'info'

// 关联 autoUpdater 日志输出
autoUpdater.logger = log

autoUpdater.autoDownload = false // 自动下载更新
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let closeToQuit = false // 默认后台运行

// 检查应用是否通过更新启动
const isUpdateLaunch = process.argv.includes('--updated') || process.argv.includes('--force-run')

// 记录启动信息
log.info('应用启动参数:', process.argv)
log.info('是否通过更新启动:', isUpdateLaunch)
log.info('应用路径:', app.getAppPath())
log.info('资源路径:', process.resourcesPath)
log.info('当前工作目录:', process.cwd())

// 清理更新后的缓存和临时文件
const cleanupAfterUpdate = (): void => {
  try {
    // 清理可能的临时文件
    const tempDir = path.join(app.getPath('temp'), 'electron_music-updater')
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }

    // 清理用户数据中的临时文件
    const userDataTemp = path.join(app.getPath('userData'), 'temp')
    if (fs.existsSync(userDataTemp)) {
      fs.rmSync(userDataTemp, { recursive: true, force: true })
    }

    // 修复应用目录权限
    const appPath = app.getAppPath()
    try {
      // 确保应用目录可读
      fs.accessSync(appPath, fs.constants.R_OK)
      log.info('应用目录权限正常')
    } catch (error: any) {
      log.warn('应用目录权限可能有问题:', error.message)
    }

    // 检查并修复资源目录权限
    const resourcePath = process.resourcesPath
    try {
      fs.accessSync(resourcePath, fs.constants.R_OK)
      log.info('资源目录权限正常')
    } catch (error: any) {
      log.warn('资源目录权限可能有问题:', error.message)
    }

    log.info('更新后清理完成')
  } catch (error) {
    log.error('清理更新文件失败:', error)
  }
}

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
      webSecurity: false, // 更新后可能需要禁用 webSecurity
      contextIsolation: true,
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    mainWindow?.setTitle('聆听音乐')
    log.info('主窗口已显示')
  })

  // 添加页面加载错误处理
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    log.error('页面加载失败:', { errorCode, errorDescription, validatedURL })

    // 如果是更新后启动，尝试重新加载
    if (isUpdateLaunch) {
      setTimeout(() => {
        log.info('尝试重新加载页面...')
        mainWindow?.reload()
      }, 1000)
    }
  })

  // 添加控制台错误监听
  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (level === 3) { // error level
      log.error('渲染进程错误:', { message, line, sourceId })
    }
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
    // 尝试多个可能的 HTML 文件路径
    const possiblePaths = [
      join(__dirname, '../renderer/index.html'),
      join(process.resourcesPath, 'app.asar.unpacked', 'renderer', 'index.html'),
      join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'renderer', 'index.html'),
      join(process.resourcesPath, 'app.asar.unpacked', 'out', 'renderer', 'index.html'),
      join(app.getAppPath(), 'dist', 'renderer', 'index.html'),
      join(app.getAppPath(), 'out', 'renderer', 'index.html')
    ]

    let htmlLoaded = false

    for (const htmlPath of possiblePaths) {
      log.info('尝试加载 HTML 文件:', htmlPath)

      if (fs.existsSync(htmlPath)) {
        try {
          mainWindow.loadFile(htmlPath)
          log.info('成功加载 HTML 文件:', htmlPath)
          htmlLoaded = true
          break
        } catch (error) {
          log.error('加载 HTML 文件失败:', htmlPath, error)
          continue
        }
      } else {
        log.warn('HTML 文件不存在:', htmlPath)
      }
    }

    if (!htmlLoaded) {
      log.error('所有 HTML 文件路径都无法加载')
      // 显示错误页面，提供重新安装选项
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>应用加载失败</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; margin: 20px 0; }
            .button { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>应用加载失败</h1>
          <div class="error">更新后应用无法正常启动，请重新安装应用。</div>
          <button class="button" onclick="window.close()">关闭应用</button>
        </body>
        </html>
      `
      mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(errorHtml))
    }
  }

  // 创建托盘
  createTray()

  // 拦截关闭事件
  mainWindow.on('close', (event) => {
    if (closeToQuit) {
      // closeToQuit 为 true 时，托盘
      event.preventDefault()
      mainWindow?.hide()
    }
    // closeToQuit 为 false 时，正常退出
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // 如果是更新后启动，先清理
  if (isUpdateLaunch) {
    cleanupAfterUpdate()
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  //自动检测更新
  setTimeout(() => {
    autoUpdater.checkForUpdates()
  }, 3000)
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

// 添加应用错误处理
app.on('render-process-gone', (_event, _webContents, details) => {
  log.error('渲染进程崩溃:', details)
})

app.on('child-process-gone', (_event, details) => {
  log.error('子进程崩溃:', details)
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

//选择下载路径的文件夹
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
// 音乐下载默认保存地址
ipcMain.handle('save-file', async (_event, { buffer, filename, downloadPath }) => {
  const fullPath = path.join(downloadPath, filename)
  try {
    fs.mkdirSync(downloadPath, { recursive: true })
    fs.writeFileSync(fullPath, buffer)
    return fullPath
  } catch (err) {
    console.error('保存文件失败', err)
    throw err
  }
})

// 自动更新代码
// 1. 更新错误处理
autoUpdater.on('error', (error) => {
  log.error('自动更新错误:', error)
  mainWindow?.webContents.send('update-error', { message: error.message })
})

// 2. 检测到更新，仅通知渲染进程
autoUpdater.on('update-available', () => {
  log.info('检测到可用更新')
  mainWindow?.webContents.send('update-available') // 你可能需要根据你的窗口引用更改
})

// 2.1 没有可用更新
autoUpdater.on('update-not-available', () => {
  log.info('没有可用更新')
})

// 3. 下载进度
autoUpdater.on('download-progress', (progressObj) => {
  log.info('下载进度:', progressObj.percent.toFixed(2) + '%')
  mainWindow?.webContents.send('update-progress', { percent: progressObj.percent })
})

// 4. 下载完成
autoUpdater.on('update-downloaded', () => {
  log.info('更新下载完成')
  mainWindow?.webContents.send('update-downloaded')
})

// 5. 渲染进程请求下载更新
ipcMain.on('download-update', () => {
  log.info('开始下载更新')
  autoUpdater.downloadUpdate()
})

// 6. 安装更新
ipcMain.on('install-update', () => {
  log.info('开始安装更新')
  // 保存用户数据
  try {
    // 可以在这里保存用户设置等数据
    log.info('用户数据已保存')
  } catch (error) {
    log.error('保存用户数据失败:', error)
  }

  // 延迟安装，确保数据保存完成
  setTimeout(() => {
    // 添加参数确保更新后自动启动
    try {
      // 参数说明：
      // 第一个参数: isSilent - 是否静默安装（false = 显示安装界面）
      // 第二个参数: isForceRunAfter - 安装完成后是否强制运行应用（true = 自动启动）
      autoUpdater.quitAndInstall(false, true)
      log.info('调用 quitAndInstall，参数: false, true')
    } catch (error) {
      log.error('调用 quitAndInstall 失败:', error)
      // 如果自动安装失败，提示用户手动安装
      mainWindow?.webContents.send('update-install-failed', {
        message: '自动安装失败，请手动重启应用完成更新'
      })
    }
  }, 1000)
})

// 7. 更新前数据保护
ipcMain.on('backup-redux-data', () => {
  log.info('开始备份 Redux 数据')
  try {
    // 通知渲染进程备份数据
    mainWindow?.webContents.send('backup-redux-data')
    log.info('已通知渲染进程备份 Redux 数据')
  } catch (error) {
    log.error('备份 Redux 数据失败:', error)
  }
})

// 8. 更新前清理缓存
ipcMain.on('cleanup-before-update', () => {
  log.info('开始更新前清理')
  try {
    // 清理临时文件
    const tempDir = path.join(app.getPath('temp'), 'electron_music-updater')
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
      log.info('清理临时文件完成')
    }

    // 清理用户数据中的临时文件
    const userDataTemp = path.join(app.getPath('userData'), 'temp')
    if (fs.existsSync(userDataTemp)) {
      fs.rmSync(userDataTemp, { recursive: true, force: true })
      log.info('清理用户数据临时文件完成')
    }

    log.info('更新前清理完成')
  } catch (error) {
    log.error('更新前清理失败:', error)
  }
})

// 渲染进程通过IPC同步设置
ipcMain.on('set-close-to-quit', (_event, value) => {
  closeToQuit = value
})

// 创建托盘
function createTray() {
  tray = new Tray(path.join(__dirname, '../../resources/icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主界面',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    {
      label: '退出',
      click: () => {
        closeToQuit = true
        app.quit()
      }
    }
  ])
  tray.setToolTip('Electron Music')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
}