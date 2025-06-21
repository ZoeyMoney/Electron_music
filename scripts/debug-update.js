const fs = require('fs')
const path = require('path')

console.log('=== 更新调试信息 ===')
console.log('当前工作目录:', process.cwd())
console.log('启动参数:', process.argv)

// 检查关键文件是否存在
const filesToCheck = [
  path.join(__dirname, '../dist/renderer/index.html'),
  path.join(__dirname, '../out/renderer/index.html'),
  path.join(__dirname, '../src/renderer/index.html'),
  path.join(__dirname, '../resources/icon.png'),
  path.join(__dirname, '../package.json')
]

console.log('\n=== 文件检查 ===')
filesToCheck.forEach(filePath => {
  try {
    const exists = fs.existsSync(filePath)
    const stats = exists ? fs.statSync(filePath) : null
    console.log(`文件: ${filePath}`)
    console.log(`  存在: ${exists}`)
    if (exists && stats) {
      console.log(`  大小: ${stats.size} bytes`)
      console.log(`  权限: ${stats.mode.toString(8)}`)
      console.log(`  修改时间: ${stats.mtime}`)
    }
  } catch (error) {
    console.log(`文件: ${filePath}`)
    console.log(`  错误: ${error.message}`)
  }
})

// 检查构建输出目录
console.log('\n=== 构建输出检查 ===')
const buildDirs = ['dist', 'out', 'build']
buildDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir)
  try {
    const exists = fs.existsSync(dirPath)
    if (exists) {
      const stats = fs.statSync(dirPath)
      console.log(`目录: ${dirPath}`)
      console.log(`  存在: ${exists}`)
      console.log(`  类型: ${stats.isDirectory() ? '目录' : '文件'}`)
      
      // 列出目录内容
      try {
        const items = fs.readdirSync(dirPath)
        console.log(`  内容: ${items.length} 个项目`)
        if (items.length > 0) {
          console.log(`  前5个项目: ${items.slice(0, 5).join(', ')}`)
        }
      } catch (readError) {
        console.log(`  读取目录失败: ${readError.message}`)
      }
    } else {
      console.log(`目录: ${dirPath}`)
      console.log(`  存在: ${exists}`)
    }
  } catch (error) {
    console.log(`目录: ${dirPath}`)
    console.log(`  错误: ${error.message}`)
  }
})

// 检查 package.json 中的版本信息
console.log('\n=== 版本信息 ===')
try {
  const packagePath = path.join(__dirname, '../package.json')
  if (fs.existsSync(packagePath)) {
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    console.log('应用名称:', packageData.name)
    console.log('当前版本:', packageData.version)
    console.log('主入口文件:', packageData.main)
    
    if (packageData.build) {
      console.log('构建配置:')
      console.log('  App ID:', packageData.build.appId)
      console.log('  产品名称:', packageData.build.productName)
      if (packageData.build.publish) {
        console.log('  发布配置:', packageData.build.publish)
      }
    }
  }
} catch (error) {
  console.log('读取 package.json 失败:', error.message)
}

// 检查环境变量
console.log('\n=== 环境变量 ===')
console.log('NODE_ENV:', process.env.NODE_ENV || '未设置')
console.log('ELECTRON_RENDERER_URL:', process.env.ELECTRON_RENDERER_URL || '未设置')

// 检查可能的 Electron 安装路径
console.log('\n=== Electron 路径检查 ===')
const possibleElectronPaths = [
  path.join(__dirname, '../node_modules/electron/dist/electron.exe'),
  path.join(__dirname, '../node_modules/.bin/electron'),
  path.join(__dirname, '../node_modules/electron/dist/Electron.app')
]

possibleElectronPaths.forEach(electronPath => {
  try {
    const exists = fs.existsSync(electronPath)
    console.log(`Electron: ${electronPath}`)
    console.log(`  存在: ${exists}`)
  } catch (error) {
    console.log(`Electron: ${electronPath}`)
    console.log(`  错误: ${error.message}`)
  }
}) 