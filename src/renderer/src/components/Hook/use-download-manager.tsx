import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface DownloadItem {
  id: string
  title: string
  artist: string
  progress: number
  status: 'downloading' | 'completed' | 'sliding' | 'failed'
  size: string
  speed?: string
  completedAt?: string
}

interface DownloadContextType {
  downloads: DownloadItem[]
  history: DownloadItem[]
  addDownload: (item: Omit<DownloadItem, 'id' | 'progress' | 'status'>) => void
  removeDownload: (id: string) => void
  clearHistory: () => void
  hasActiveDownloads: boolean
}

const DownloadContext = createContext<DownloadContextType | null>(null)

export const useDownloadManager = (): DownloadContextType => {
  const context = useContext(DownloadContext)
  if (!context) {
    throw new Error("useDownloadManager must be used within DownloadProvider")
  }
  return context
}

export const DownloadProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: "1",
      title: "夜曲",
      artist: "周杰伦",
      progress: 35,
      status: "downloading",
      size: "4.2MB",
      speed: "1.2MB/s",
    },
    {
      id: "2",
      title: "青花瓷",
      artist: "周杰伦",
      progress: 78,
      status: "downloading",
      size: "3.8MB",
      speed: "0.9MB/s",
    },
  ])

  const [history, setHistory] = useState<DownloadItem[]>([
    {
      id: "h1",
      title: "告白气球",
      artist: "周杰伦",
      progress: 100,
      status: "completed",
      size: "3.9MB",
      completedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
    },
    {
      id: "h2",
      title: "七里香",
      artist: "周杰伦",
      progress: 100,
      status: "completed",
      size: "4.5MB",
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
    },
    {
      id: "h3",
      title: "稻香",
      artist: "周杰伦",
      progress: 100,
      status: "completed",
      size: "4.1MB",
      completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
    },
  ])

  const hasActiveDownloads = downloads.some((item) => item.status === "downloading")

  // 模拟下载进度更新
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads((prev) =>
        prev.map((item) => {
          if (item.status === "downloading" && item.progress < 100) {
            const newProgress = Math.min(item.progress + Math.random() * 4 + 1, 100)

            if (newProgress >= 100) {
              // 下载完成，直接移动到历史记录
              const completedItem = {
                ...item,
                progress: 100,
                status: "completed" as const,
                speed: undefined,
                completedAt: new Date().toISOString(),
              }

              // 立即移动到历史记录
              setTimeout(() => {
                setHistory((prevHistory) => [completedItem, ...prevHistory])
                setDownloads((prevDownloads) => prevDownloads.filter((d) => d.id !== item.id))
              }, 0)

              return completedItem
            }

            return {
              ...item,
              progress: newProgress,
              speed: `${(Math.random() * 2 + 0.5).toFixed(1)}MB/s`,
            }
          }

          return item
        }),
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const addDownload = (item: Omit<DownloadItem, 'id' | 'progress' | 'status'>): void => {
    const newDownload: DownloadItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: "downloading",
    }
    setDownloads((prev) => [newDownload, ...prev])
  }

  const removeDownload = (id: string): void => {
    setDownloads((prev) => prev.filter((item) => item.id !== id))
  }

  const clearHistory = (): void => {
    setHistory([])
  }

  return (
    <DownloadContext.Provider
      value={{
        downloads,
        history,
        addDownload,
        removeDownload,
        clearHistory,
        hasActiveDownloads,
      }}
    >
      {children}
    </DownloadContext.Provider>
  )
}
