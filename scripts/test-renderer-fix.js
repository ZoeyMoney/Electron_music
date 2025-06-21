const fs = require('fs')
const path = require('path')

console.log('=== 渲染进程修复验证 ===')

// 检查关键文件
console.log('\n1. 检查关键文件')
const filesToCheck = [
  'src/renderer/src/store/counterSlice.ts',
  'src/renderer/src/store/store.ts',
  'src/renderer/src/main.tsx'
]

filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath)
  try {
    const exists = fs.existsSync(fullPath)
    console.log(`✅ ${filePath}: ${exists ? '存在' : '不存在'}`)
    
    if (exists) {
      const content = fs.readFileSync(fullPath, 'utf8')
      const size = content.length
      console.log(`   大小: ${size} 字符`)
      
      // 检查关键修复
      if (filePath.includes('counterSlice.ts')) {
        const hasSafeArray = content.includes('ensureArray')
        const hasSafeFilter = content.includes('safeFilter')
        const hasSafeMap = content.includes('safeMap')
        console.log(`   安全数组函数: ${hasSafeArray ? '✅' : '❌'}`)
        console.log(`   安全过滤函数: ${hasSafeFilter ? '✅' : '❌'}`)
        console.log(`   安全映射函数: ${hasSafeMap ? '✅' : '❌'}`)
      }
      
      if (filePath.includes('store.ts')) {
        const hasUpdateCheck = content.includes('isUpdateLaunch')
        const hasDataCleanup = content.includes('localStorage.removeItem')
        console.log(`   更新检查: ${hasUpdateCheck ? '✅' : '❌'}`)
        console.log(`   数据清理: ${hasDataCleanup ? '✅' : '❌'}`)
      }
    }
  } catch (error) {
    console.log(`❌ ${filePath}: 读取失败 - ${error.message}`)
  }
})

// 检查构建输出
console.log('\n2. 检查构建输出')
const buildPaths = [
  'out/renderer/assets/index-qVZoteMn.js',
  'out/renderer/index.html'
]

buildPaths.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath)
  try {
    const exists = fs.existsSync(fullPath)
    console.log(`✅ ${filePath}: ${exists ? '存在' : '不存在'}`)
    
    if (exists) {
      const stats = fs.statSync(fullPath)
      console.log(`   大小: ${stats.size} bytes`)
      console.log(`   修改时间: ${stats.mtime}`)
    }
  } catch (error) {
    console.log(`❌ ${filePath}: 检查失败 - ${error.message}`)
  }
})

// 检查可能的日志文件
console.log('\n3. 检查应用日志')
const logPaths = [
  path.join(process.env.APPDATA || '', 'electron_music/logs/main.log'),
  path.join(process.env.LOCALAPPDATA || '', 'electron_music/logs/main.log')
]

logPaths.forEach(logPath => {
  try {
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8')
      const lines = content.split('\n').filter(line => line.trim())
      
      // 查找最近的错误
      const recentErrors = lines.filter(line => 
        line.includes('error') || 
        line.includes('Error') ||
        line.includes('Cannot read properties')
      ).slice(-5)
      
      if (recentErrors.length > 0) {
        console.log(`✅ 找到最近的错误 (${logPath}):`)
        recentErrors.forEach(error => {
          console.log(`   ${error}`)
        })
      } else {
        console.log(`ℹ️ 未找到最近的错误 (${logPath})`)
      }
    } else {
      console.log(`ℹ️ 日志文件不存在 (${logPath})`)
    }
  } catch (error) {
    console.log(`❌ 读取日志失败 (${logPath}): ${error.message}`)
  }
})

console.log('\n=== 修复建议 ===')
console.log('1. 重新构建应用: npm run build')
console.log('2. 测试更新流程')
console.log('3. 如果仍有问题，检查 Redux 持久化数据')
console.log('4. 考虑清除 localStorage 中的 persist:root') 