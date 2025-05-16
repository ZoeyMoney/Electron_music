// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'
// import { Button } from "@heroui/react";

import UserLogin from '@renderer/components/UserLogin'
import LeftMenu from '@renderer/components/LeftMenu'
import AppRoutes from './router'
import HeaderSearch from '@renderer/components/HeaderSearch'
import MusicPlayer from "@renderer/components/MusiPlayer";

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="parent">
        <div className="left_menu">
          <UserLogin />
          <LeftMenu />
        </div>
        <div className="headerSearch">
          <HeaderSearch />
        </div>
        <div className="right-main px-3 py-3">
          <AppRoutes />
        </div>
        <div className="MusicPlayer">
          <MusicPlayer />
        </div>
      </div>
    </>
  )
}

export default App
