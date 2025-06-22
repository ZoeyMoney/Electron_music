// store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import counterReducer from './counterSlice';

// 检查是否是更新后的首次启动
const isUpdateLaunch = window.location.search.includes('updated=true') ||
  (window as any).electron?.process?.argv?.includes('--updated')

// 数据完整性检查函数
const validateReduxData = (data: any): boolean => {
  try {
    if (!data || typeof data !== 'object') return false

    // 检查关键字段是否存在且格式正确
    const requiredFields = ['counter']
    for (const field of requiredFields) {
      if (!(field in data)) return false
    }

    // 检查 counter 字段的结构
    const counter = data.counter
    if (!counter || typeof counter !== 'object') return false

    // 检查关键数组字段
    const arrayFields = ['myLikeMusic', 'playListMusic', 'localMusicList', 'historyPlayList', 'downloadList', 'downloadFinishList']
    for (const field of arrayFields) {
      if (!Array.isArray(counter[field])) {
        console.warn(`Redux 数据字段 ${field} 不是数组，重置为空数组`)
        counter[field] = []
      }
    }

    return true
  } catch (error) {
    console.error('Redux 数据验证失败:', error)
    return false
  }
}

// 尝试恢复备份
const tryRestoreBackup = (key: string): string | null => {
  try {
    const backupKeys = Object.keys(localStorage).filter(k => k.startsWith(`${key}_backup_`))
    if (backupKeys.length === 0) return null

    // 使用最新的备份
    backupKeys.sort().reverse()
    const latestBackup = backupKeys[0]
    const backupData = localStorage.getItem(latestBackup)

    if (backupData) {
      const parsed = JSON.parse(backupData)
      if (validateReduxData(parsed)) {
        console.log('从备份恢复 Redux 数据:', latestBackup)
        return backupData
      }
    }
  } catch (error) {
    console.error('恢复备份失败:', error)
  }
  return null
}

// 在应用启动时清理损坏的数据
if (isUpdateLaunch) {
  try {
    const reduxData = localStorage.getItem('persist:root')
    if (reduxData) {
      const parsed = JSON.parse(reduxData)
      if (!validateReduxData(parsed)) {
        console.warn('更新后检测到 Redux 数据损坏，尝试恢复备份')
        const backupData = tryRestoreBackup('persist:root')
        if (backupData) {
          localStorage.setItem('persist:root', backupData)
        } else {
          console.warn('无法恢复备份，清除损坏的 Redux 缓存')
          localStorage.removeItem('persist:root')
        }
      }
    }
  } catch (e) {
    console.warn('更新后检测到 Redux 数据解析错误，尝试恢复备份',e)
    const backupData = tryRestoreBackup('persist:root')
    if (backupData) {
      localStorage.setItem('persist:root', backupData)
    } else {
      console.warn('无法恢复备份，清除损坏的 Redux 缓存')
      localStorage.removeItem('persist:root')
    }
  }
}

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['counter'],
  // 添加版本控制
  version: 1,
  // 迁移函数，处理数据结构变化
  migrate: (state: any) => {
    try {
      if (state && state.counter) {
        const defaultState = {
          myLikeMusic: [],
          playListMusic: [],
          menuDataType: 'playListMusicType',
          audioState: {
            volume: 100,
            currentTime: 0,
            loop: false,
            random: false,
            playbackRate: 1.0,
            duration: 0,
            isPlaying: false
          },
          localMusicList: [],
          historyPlayList: [],
          playInfo: {
            loading: false,
            music_title: '',
            artist: '',
            href: '',
            pic: '',
            lrc: '无歌词',
            id: ''
          },
          downloadPath: null,
          downloadList: [],
          downloadFinishList: [],
          closeToQuit: false
        }
        state.counter = { ...defaultState, ...state.counter }
      }
      return Promise.resolve(state)
    } catch (error) {
      console.error('Redux 数据迁移失败:', error)
      return Promise.resolve(null)
    }
  }
};

const rootReducer = combineReducers({
  counter: counterReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  // 添加错误处理
  devTools: process.env.NODE_ENV === 'development',
});

export const persistor = persistStore(store);

// 监听持久化错误
persistor.subscribe(() => {
  const { bootstrapped } = persistor.getState()
  if (bootstrapped) {
    console.log('Redux 持久化完成')
  }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
