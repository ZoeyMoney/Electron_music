import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { ArrowDownToLine, Check, Clock, Trash2, X } from 'lucide-react'
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/store/store'


const HeaderDownloadButton: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false)
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current')
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()
  const { downloadList } = useSelector((state: RootState) => state.counter)

  // 直接在组件内管理下载状态
  // const [downloads, setDownloads] = useState<any[]>([])

  const [history, setHistory] = useState<any[]>([])

  const hasActiveDownloads = downloadList.some((item) => item.status === 'downloading')

  // 模拟下载进度更新
  useEffect(() => {
    const interval = setInterval(() => {
      /*setDownloads((prev) =>
        prev.map((item) => {
          if (item.status === 'downloading' && item.progress < 100) {
            const newProgress = Math.min(item.progress + Math.random() * 4 + 1, 100)

            if (newProgress >= 100) {
              // 下载完成，直接移动到历史记录
              const completedItem = {
                ...item,
                progress: 100,
                status: 'completed' as const,
                speed: undefined,
                completedAt: new Date().toISOString()
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
              speed: `${(Math.random() * 2 + 0.5).toFixed(1)}MB/s`
            }
          }

          return item
        })
      )*/

    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 处理滚动动画
  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolling(true)

      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // 设置新的定时器，滚动停止后重置状态
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll)
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll)
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
      }
    }

    // 确保在scrollElement不存在时也返回清理函数
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // 计算整体进度
  const getOverallProgress = (): number => {
    if (downloadList.length === 0) return 0
    const totalProgress = downloadList.reduce((sum, item) => sum + item.progress, 0)
    return Math.round(totalProgress / downloadList.length)
  }

  // 获取进度条颜色
  const getPathColor = (): string => {
    if (!hasActiveDownloads) return '#6b7280' // 灰色
    const progress = getOverallProgress()
    if (progress >= 100) return '#22c55e' // 绿色
    return '#22c55e' // 蓝色
  }

  // 获取图标
  const getIcon = (): JSX.Element => {
    if (hasActiveDownloads && getOverallProgress() >= 100) {
      return <Check size={14} color="white" />
    }
    return <ArrowDownToLine size={14} color="white" />
  }

  // 点击处理
  const handleClick = (): void => {
    setShowPanel(!showPanel)
  }

  // 添加下载任务
/*  const handleAddDownload = (): void => {
    const newDownload: any = {
      id: Math.random().toString(36).substr(2, 9),
      title: `歌曲 ${Date.now()}`,
      artist: '艺术家',
      size: `${(Math.random() * 3 + 2).toFixed(1)}MB`,
      progress: 0,
      status: 'downloading'
    }
    setDownloads((prev) => [newDownload, ...prev])
    setShowPanel(false)
  }*/

  // 移除下载任务
  const removeDownload = (id: string): void => {
    setDownloads((prev) => prev.filter((item) => item.id !== id))
  }

  // 清空历史记录
  const clearHistory = (): void => {
    setHistory([])
  }

  return (
    <div className="relative [-webkit-app-region:no-drag]">
      {/* 圆形进度条 + 下载图标 */}
      <div onClick={handleClick} className="w-[25px] h-[25px] cursor-pointer">
        <CircularProgressbarWithChildren
          value={hasActiveDownloads ? getOverallProgress() : 0}
          maxValue={100}
          styles={buildStyles({
            pathColor: getPathColor(),
            trailColor: 'rgba(255, 255, 255, 0.2)',
            pathTransitionDuration: 0.3
          })}
        >
          {getIcon()}
        </CircularProgressbarWithChildren>
      </div>

      {/* Content 内容 - 下载面板 */}
      {showPanel && (
        <>
          {/* 背景遮罩 */}
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />

          {/* 下载内容面板 */}
          <div className="absolute top-12 right-0 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden animate-in slide-in-from-top duration-200">
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <ArrowDownToLine size={18} />
                下载管理
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* 标签页 */}
            <div className="flex border-b border-gray-600">
              <button
                onClick={() => setActiveTab('current')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === 'current'
                    ? 'text-blue-400 border-blue-400 bg-gray-700'
                    : 'text-gray-400 hover:text-white border-transparent'
                }`}
              >
                当前下载 ({downloads.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === 'history'
                    ? 'text-blue-400 border-blue-400 bg-gray-700'
                    : 'text-gray-400 hover:text-white border-transparent'
                }`}
              >
                下载历史 ({history.length})
              </button>
            </div>

            {/* 内容区域 - 带滚动动画效果 */}
            <div
              ref={scrollRef}
              className={`max-h-80 overflow-hidden scroll-smooth scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 transition-all duration-300 ${
                isScrolling ? 'scrolling-active' : ''
              }`}
            >
              <div className="overflow-y-auto max-h-80">
                {activeTab === 'current' && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-gray-300 text-sm">当前下载任务</h4>
                    </div>

                    {downloads.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <ArrowDownToLine size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无下载任务</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {downloads.map((item, index) => (
                          <div
                            key={item.id}
                            className={`download-item relative p-1.5 rounded-lg transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-left overflow-hidden ${
                              item.status === 'downloading'
                                ? 'bg-green-100/10 border border-green-500/20'
                                : 'bg-gray-700 border border-gray-600'
                            }`}
                            style={{
                              animationDelay: `${index * 100}ms`,
                              background:
                                item.status === 'downloading'
                                  ? `linear-gradient(90deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.15) ${item.progress}%, rgba(55, 65, 81, 1) ${item.progress}%, rgba(55, 65, 81, 1) 100%)`
                                  : undefined
                            }}
                          >
                            {/* 主要信息行 - 合并标题和进度 */}
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <span className="text-white font-medium text-xs truncate">
                                    {item.title}
                                  </span>
                                  <span className="text-gray-400 text-xs ml-1">
                                    - {item.artist}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-bold ${
                                    item.status === 'downloading'
                                      ? 'text-green-400'
                                      : 'text-blue-400'
                                  }`}
                                >
                                  {Math.round(item.progress)}%
                                </span>
                                <button
                                  onClick={() => removeDownload(item.id)}
                                  className="w-4 h-4 bg-gray-600 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                                  title="移除"
                                >
                                  <X size={8} className="text-white" />
                                </button>
                              </div>
                            </div>

                            {/* 详细信息行 - 更紧凑 */}
                            <div className="flex justify-between text-xs text-gray-400 relative z-10 mt-0.5">
                              <span>{item.speed || '计算中...'}</span>
                              <span>{item.size}</span>
                            </div>

                            {/* 下载状态指示器 */}
                            {item.status === 'downloading' && (
                              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-gray-300 text-sm">下载历史</h4>
                      {history.length > 0 && (
                        <button
                          onClick={clearHistory}
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs transition-colors"
                        >
                          <Trash2 size={12} />
                          清空
                        </button>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <div className="text-center py-6 text-gray-400">
                        <Clock size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无下载历史</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {history.map((item, index) => (
                          <div
                            key={item.id}
                            className="download-item p-1.5 bg-gray-700 border border-gray-600 rounded-lg transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-right relative overflow-hidden"
                            style={{
                              animationDelay: `${index * 50}ms`,
                              background:
                                'linear-gradient(90deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.2) 100%)'
                            }}
                          >
                            {/* 主要信息行 - 合并标题和状态 */}
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex-1 min-w-0 flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <span className="text-white font-medium text-xs truncate">
                                    {item.title}
                                  </span>
                                  <span className="text-gray-400 text-xs ml-1">
                                    - {item.artist}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <Check size={8} className="text-white" />
                                </div>
                              </div>
                            </div>

                            {/* 详细信息行 - 更紧凑 */}
                            <div className="flex justify-between text-xs text-gray-400 relative z-10 mt-0.5">
                              <span>下载完成</span>
                              <div className="flex items-center gap-2">
                                <span>{item.size}</span>
                                {item.completedAt && (
                                  <span className="text-green-400">
                                    {new Date(item.completedAt).toLocaleTimeString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default HeaderDownloadButton
