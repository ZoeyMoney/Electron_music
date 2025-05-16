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

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
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
)
