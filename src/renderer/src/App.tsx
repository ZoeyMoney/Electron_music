import { useEffect, useState } from 'react'
import { Progress } from '@heroui/react'
import { ModalWrapper } from '@renderer/components/ModalWrapper'
import UserLogin from '@renderer/components/UserLogin'
import LeftMenu from '@renderer/components/LeftMenu'
import AppRoutes from './router'
import HeaderSearch from '@renderer/components/HeaderSearch'
import MusicPlayer from '@renderer/components/MusiPlayer'

function App(): JSX.Element {
  const [progress, setProgress] = useState<number>(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [hasUpdate, setHasUpdate] = useState(false) // 新增标志位：检测到新版本

  useEffect(() => {
    if (!window.api) return

    const handleUpdateAvailable = (): void => {
      setHasUpdate(true)
      setDownloadModalOpen(true)
    }

    const handleUpdateProgress = (data: { percent: number }): void => {
      const percent = Number(data.percent.toFixed(2))
      setProgress(percent)
      setIsDownloading(true)
      if (!downloadModalOpen) setDownloadModalOpen(true)
      if (percent >= 100) {
        setIsDownloading(false)
        setIsDownloaded(true)
      }
    }

    const handleUpdateDownloaded = (): void => {
      setIsDownloading(false)
      setIsDownloaded(true)
      setProgress(100)
      setDownloadModalOpen(true)
    }

    window.api.onUpdateAvailable?.(handleUpdateAvailable)
    window.api.onUpdateProgress?.(handleUpdateProgress)
    window.api.onUpdateDownloaded?.(handleUpdateDownloaded)

    return () => {
      window.api.removeListener?.('update-available', handleUpdateAvailable)
      window.api.removeListener?.('update-progress', handleUpdateProgress)
      window.api.removeListener?.('update-downloaded', handleUpdateDownloaded)
    }
  }, [])

  useEffect(() => {
    if (!isInstalling) return

    let current = 0
    const timer = setInterval(() => {
      current += 10
      setProgress(current)
      if (current >= 100) {
        clearInterval(timer)
        try {
          window.api.installUpdate?.()
        } catch (err) {
          console.error('安装失败', err)
          setIsInstalling(false)
        }
      }
    }, 300)

    return () => clearInterval(timer)
  }, [isInstalling])

  const handleAction = (): void => {
    if (isInstalling || isDownloading) return

    if (hasUpdate && !isDownloaded) {
      window.api.downloadUpdate?.()
      setIsDownloading(true)
      setProgress(0)
      return
    }

    if (isDownloaded) {
      setIsInstalling(true)
      try {
        window.api.installUpdate?.()
      } catch (err) {
        console.error('安装失败', err)
        setIsInstalling(false)
      }
    }
  }

  const getModalContent = (): JSX.Element | null => {
    if (isInstalling) {
      return <p>正在安装更新，请稍候...</p> // ✅ 保留提示即可，不要再有进度条
    }

    if (isDownloading) {
      return (
        <>
          <p>更新正在下载中，请稍候...</p>
          <Progress
            className="max-w-md mt-4"
            value={progress}
            showValueLabel
            size="md"
            color="success"
          />
        </>
      )
    }

    if (hasUpdate && !isDownloaded) {
      return <p>检测到新版本，点击“现在下载”以开始更新。</p>
    }

    if (isDownloaded) {
      return <p>新版本已准备就绪，点击“立即安装”开始升级。</p>
    }

    return null
  }

  const getActionText = (): string => {
    if (isInstalling) return '安装中...'
    if (isDownloading) return '下载中...'
    if (isDownloaded) return '立即安装'
    if (hasUpdate) return '现在下载'
    return ''
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
      <ModalWrapper
        title={isDownloaded ? '更新已下载完成' : '检测到新版本'}
        isOpen={downloadModalOpen}
        onClose={() => {
          if (!isDownloading && !isInstalling) setDownloadModalOpen(false)
        }}
        onAction={handleAction}
        actionText={getActionText()}
        buttonCloseText="关闭"
        autoCloseOnAction={false}
      >
        {getModalContent()}
      </ModalWrapper>
    </>
  )
}

export default App
