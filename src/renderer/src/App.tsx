// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'
// import { Button } from "@heroui/react";

import UserLogin from '@renderer/components/UserLogin'
import LeftMenu from '@renderer/components/LeftMenu'
import AppRoutes from './router'
import HeaderSearch from '@renderer/components/HeaderSearch'
import MusicPlayer from "@renderer/components/MusiPlayer";
import { ModalWrapper } from '@renderer/components/ModalWrapper'
import { useEffect, useState } from 'react'
import { Progress } from '@heroui/react'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const [progress, setProgress] = useState<number>(0)
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false)
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false)

  useEffect(() => {
    window.api.onUpdateProgress((data) => {
      setProgress(Number(data.percent.toFixed(2)))
    })

    window.api.onUpdateDownloaded(() => {
      setIsDownloaded(true)
      setDownloadModalOpen(true)
    })
  }, [])

  const handleClick = (): void => {
    if (isDownloaded) {
      window.api.installUpdate()
    } else {
      console.log('下载未完成或路径未设置')
      // 这里可以触发下载逻辑或提示设置路径
    }
  }

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
      {/* 检测版本更新 */}
      <ModalWrapper
        title={isDownloaded ? '更新已下载完成' : '检测到新版本'}
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        onAction={handleClick}
        actionText={isDownloaded ? '立即安装' : '下载中...'}
        buttonCloseText={'关闭'}
      >
        {isDownloaded ? (
          <p>新版本已准备就绪，点击“立即安装”完成更新。</p>
        ) : (
          <>
            <p>更新正在下载中，请稍候...</p>
            <div style={{ marginTop: '8px' }}>
              <Progress
                aria-label="Downloading..."
                className="max-w-md"
                color="success"
                showValueLabel={true}
                size="md"
                value={progress}
              />
              {/*<progress value={progress} max={100} style={{ width: '100%' }} />*/}
              {/*<p>{progress.toFixed(2)}%</p>*/}
            </div>
          </>
        )}
      </ModalWrapper>
    </>
  )
}

export default App
