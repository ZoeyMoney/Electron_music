import './assets/main.css'
import './assets/output.css'
import 'reset-css'

import ReactDOM from 'react-dom/client'
import App from './App'
import { HeroUIProvider } from '@heroui/react'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/store';
import { ToastProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
//创建全局的QueryClient实例
const queryClient = new QueryClient()
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage
})
persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 10, //缓存10分钟
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/*<React.StrictMode>*/}
        <HeroUIProvider>
          <NextThemesProvider defaultTheme="dark">
            <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ToastProvider placement={'top-center'} />
              <App />
            </HashRouter>
          </NextThemesProvider>
        </HeroUIProvider>
        {/*</React.StrictMode>*/}
      </PersistGate>
    </Provider>
  </QueryClientProvider>
)

// 监听更新前数据保护
if (window.api) {
  // 监听备份 Redux 数据的请求
  window.api.onBackupReduxData?.(() => {
    try {
      console.log('收到备份 Redux 数据请求')
      // 获取当前 Redux 状态
      const currentState = store.getState()
      const stateString = JSON.stringify(currentState)

      // 创建备份
      const backupKey = `persist:root_backup_${Date.now()}`
      localStorage.setItem(backupKey, stateString)
      console.log('Redux 数据备份完成:', backupKey)

      // 清理旧的备份（保留最近5个）
      const backupKeys = Object.keys(localStorage).filter(k => k.startsWith('persist:root_backup_'))
      if (backupKeys.length > 5) {
        backupKeys.sort().slice(0, -5).forEach(k => localStorage.removeItem(k))
      }
    } catch (error) {
      console.error('备份 Redux 数据失败:', error)
    }
  })
}
