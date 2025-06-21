// 数据管理工具
export class DataManager {
  private static readonly BACKUP_PREFIX = 'persist:root_backup_'
  private static readonly MAX_BACKUPS = 5

  // 创建数据备份
  static createBackup(data: any): string {
    try {
      const backupKey = `${this.BACKUP_PREFIX}${Date.now()}`
      const dataString = JSON.stringify(data)
      localStorage.setItem(backupKey, dataString)
      console.log('数据备份创建成功:', backupKey)
      
      // 清理旧备份
      this.cleanupOldBackups()
      
      return backupKey
    } catch (error) {
      console.error('创建数据备份失败:', error)
      throw error
    }
  }

  // 获取所有备份
  static getBackups(): string[] {
    try {
      return Object.keys(localStorage)
        .filter(key => key.startsWith(this.BACKUP_PREFIX))
        .sort()
        .reverse()
    } catch (error) {
      console.error('获取备份列表失败:', error)
      return []
    }
  }

  // 获取最新备份
  static getLatestBackup(): any {
    try {
      const backups = this.getBackups()
      if (backups.length === 0) return null
      
      const latestBackupKey = backups[0]
      const backupData = localStorage.getItem(latestBackupKey)
      
      if (backupData) {
        return JSON.parse(backupData)
      }
      return null
    } catch (error) {
      console.error('获取最新备份失败:', error)
      return null
    }
  }

  // 恢复数据
  static restoreFromBackup(backupKey?: string): any {
    try {
      const targetKey = backupKey || this.getBackups()[0]
      if (!targetKey) {
        console.warn('没有可用的备份')
        return null
      }
      
      const backupData = localStorage.getItem(targetKey)
      if (backupData) {
        const data = JSON.parse(backupData)
        console.log('从备份恢复数据:', targetKey)
        return data
      }
      return null
    } catch (error) {
      console.error('恢复备份失败:', error)
      return null
    }
  }

  // 验证数据完整性
  static validateData(data: any): boolean {
    try {
      if (!data || typeof data !== 'object') return false
      
      // 检查关键字段
      const requiredFields = ['counter']
      for (const field of requiredFields) {
        if (!(field in data)) return false
      }
      
      // 检查 counter 字段
      const counter = data.counter
      if (!counter || typeof counter !== 'object') return false
      
      // 检查数组字段
      const arrayFields = [
        'myLikeMusic', 'playListMusic', 'localMusicList', 
        'historyPlayList', 'downloadList', 'downloadFinishList'
      ]
      
      for (const field of arrayFields) {
        if (!Array.isArray(counter[field])) {
          console.warn(`数据字段 ${field} 不是数组`)
          return false
        }
      }
      
      return true
    } catch (error) {
      console.error('数据验证失败:', error)
      return false
    }
  }

  // 清理旧备份
  private static cleanupOldBackups(): void {
    try {
      const backups = this.getBackups()
      if (backups.length > this.MAX_BACKUPS) {
        const toDelete = backups.slice(this.MAX_BACKUPS)
        toDelete.forEach(key => {
          localStorage.removeItem(key)
          console.log('删除旧备份:', key)
        })
      }
    } catch (error) {
      console.error('清理旧备份失败:', error)
    }
  }

  // 获取数据统计信息
  static getDataStats(): {
    totalBackups: number
    latestBackupTime: string | null
    dataSize: number
  } {
    try {
      const backups = this.getBackups()
      const latestBackup = backups[0]
      const latestBackupTime = latestBackup 
        ? new Date(parseInt(latestBackup.split('_').pop() || '0')).toLocaleString()
        : null
      
      const currentData = localStorage.getItem('persist:root')
      const dataSize = currentData ? currentData.length : 0
      
      return {
        totalBackups: backups.length,
        latestBackupTime,
        dataSize
      }
    } catch (error) {
      console.error('获取数据统计失败:', error)
      return {
        totalBackups: 0,
        latestBackupTime: null,
        dataSize: 0
      }
    }
  }

  // 清除所有备份
  static clearAllBackups(): void {
    try {
      const backups = this.getBackups()
      backups.forEach(key => {
        localStorage.removeItem(key)
        console.log('删除备份:', key)
      })
      console.log('所有备份已清除')
    } catch (error) {
      console.error('清除备份失败:', error)
    }
  }
} 