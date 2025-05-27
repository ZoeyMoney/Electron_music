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
