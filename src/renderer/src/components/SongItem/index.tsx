import React, { useMemo } from 'react'
import { useRef, useState } from "react"
import { Pause, Play, MoreHorizontal } from "lucide-react"
import { LocalMusicInfo, ModalState, SongProps } from '@renderer/InterFace'
import LikeButton from "@renderer/components/LikeButton"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from "@renderer/store/store"
import {
  // createSongInfo,
  getAlbumColor,
  getInitials,
  getLocalMenuItems,
  getMenuItems,
  useDropdownMenu,
  useHandleDoubleClickPlay
} from '@renderer/utils'
import DropdownMenu from "@renderer/components/DropdownMenu/DropdownMenu"
import { addDownloadList, setMyLikeMusicList, deleteDownloadList, removeDownloadTask } from '@renderer/store/counterSlice'
import { ModalWrapper } from '@renderer/components/ModalWrapper'
import { useNavigate } from 'react-router-dom'
// import { addToast } from '@heroui/react'

interface SongItemProps {
  item: LocalMusicInfo // 单个歌曲数据
  album?: string //专辑名
  duration?: string //歌曲时长
  sourceType: 'playListMusicType' | 'allMusicList' | 'localMusicList' | string | '1'
  showAlbum?: boolean
  showDuration?: boolean
}

export const SongItem: React.FC<SongItemProps> = ({
  item,
  album,
  duration,
  sourceType,
  showAlbum = false,
  showDuration = false
}) => {
  const { myLikeMusic, audioState, playInfo, downloadPath } = useSelector((state: RootState) => state.counter)
  const [isHovered, setIsHovered] = useState(false)
  const [showPlay, setShowPlay] = useState(false)
  const { createDoubleClickHandler } = useHandleDoubleClickPlay()
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, content: '' });
  const musicTableRef = useRef<{
    handleToggleLike: (song: SongProps, groupId?: string | number, forceAdd?: boolean) => Promise<void>
  }>(null)
  // 存储取消下载的 AbortController
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())
  const {
    showMenu,
    setShowMenu,
    menuType,
    dropdownPosition,
    moreButtonRef,
    handleMoreClick,
    handleContextMenu,
  } = useDropdownMenu({ initialMenuType: '' })
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // 检查歌曲是否已点赞
  const isLiked = useMemo(
    () =>
      (href: string): boolean => {
        const favoriteGroup = myLikeMusic.find((group) => group.id === 1)
        return favoriteGroup ? favoriteGroup.songs.some((song) => song.href === href) : false
      },
    [myLikeMusic]
  )
  // 生成稳定的双击处理函数
  const onDoubleClick = useMemo(
    () => createDoubleClickHandler(item, sourceType),
    [createDoubleClickHandler, item, sourceType]
  )

  //点赞
  const handleToggleLike = async (
    song: SongProps,
    groupId: string | number = 1,
    forceAdd: boolean = false // 强制添加
  ): Promise<void> => {
    if (!song || !song.href) {
      console.warn('传入的 song 无效', song)
      return
    }
    const alreadyLiked = isLiked(song.href)
    const data = { ...song, date: new Date().toISOString() }
    if (alreadyLiked && !forceAdd) {
      // 取消点赞
      dispatch(
        setMyLikeMusicList({
          type: 'remove',
          id: groupId,
          data
        })
      )
    } else {
      // 添加到歌单
      dispatch(
        setMyLikeMusicList({
          type: 'add',
          id: groupId,
          data
        })
      )
    }
  }
  //右键菜单
  const handleAddToPlaylist = async (
    song: SongProps,
    playlistId: string | number = 1,
    forceAdd: boolean = false // 强制添加
  ): Promise<void> => {
    const group = myLikeMusic.find((g) => g.id === playlistId)
    if (!group) return

    const alreadyExists = group.songs?.some((s) => s.href === song.href)
    if (alreadyExists && !forceAdd) {
      setModalState({
        isOpen: true,
        content: `该歌曲已存在于「${group.name}」歌单中，是否强制添加？`,
        song,
        groupId: group.id,
      })
      return
    }
    musicTableRef.current?.handleToggleLike(song, group.id, true)

    dispatch(
      setMyLikeMusicList({
        type: 'add',
        id: playlistId,
        song,
      })
    )
  }
  //判断本地或者在线
  const isLocalSong = item.localPath === true;
  //选择菜单 下载
  const menuItems = isLocalSong
    ? getLocalMenuItems(item, () => setShowMenu(false), handleAddToPlaylist, sourceType)
    : getMenuItems(item, () => setShowMenu(false), handleAddToPlaylist, sourceType, {
        onDownload: async (song) => {
          if (downloadPath === null) {
            setDownloadModalOpen(true)
            return
          }
          
          // 1. 添加到下载列表 - 使用时间戳确保唯一性
          const downloadId = `${Date.now()}-${song.id || song.href}` // 用时间戳 + id 作为唯一标识
          // 创建 AbortController 用于取消下载
          const abortController = new AbortController()
          abortControllersRef.current.set(downloadId, abortController)
          
          dispatch(
            addDownloadList({
              ...song,
              id: downloadId,
              status: 'downloading',
              progress: 0,
              speed: '0 MB/s',
              size: '计算中...'
            })
          )
          
          try {
            // 2. 获取下载链接
            const res = await import('@renderer/Api').then(m => m.getMusicInfo({ href: song.href }))
            const url = res.data.mp3_url
            if (!url) {
              // 下载链接无效
              dispatch(
                deleteDownloadList({
                  ...song,
                  id: downloadId,
                  status: 'error',
                  progress: 0,
                })
              )
              abortControllersRef.current.delete(downloadId)
              return
            }
            
            // 3. 下载文件
            const response = await fetch(url, { signal: abortController.signal })
            if (!response.ok) throw new Error('网络错误')
            
            // 获取文件大小
            const contentLength = response.headers.get('content-length')
            const fileSize = contentLength ? `${(parseInt(contentLength) / 1024 / 1024).toFixed(1)} MB` : '未知大小'
            
            // 更新文件大小
            dispatch(
              addDownloadList({
                ...song,
                id: downloadId,
                status: 'downloading',
                progress: 0,
                speed: '0 MB/s',
                size: fileSize
              })
            )
            
            // 下载速度限制配置
            const MAX_SPEED_MBPS = 1 // 限制为 1MB/s
            const CHUNK_SIZE = 64 * 1024 // 64KB 每次读取
            const DELAY_MS = (CHUNK_SIZE / (MAX_SPEED_MBPS * 1024 * 1024)) * 1000 // 计算延迟时间
            
            // 使用 ReadableStream 来获取下载进度
            const reader = response.body?.getReader()
            const chunks: Uint8Array[] = []
            let receivedLength = 0
            let lastUpdateTime = Date.now()
            let lastReceivedLength = 0
            
            if (reader) {
              while (true) {
                // 检查是否被取消
                if (abortController.signal.aborted) {
                  console.log('下载已取消:', downloadId)
                  break
                }
                
                const { done, value } = await reader.read()
                if (done) break
                
                chunks.push(value)
                receivedLength += value.length
                
                // 计算进度
                const progress = contentLength 
                  ? Math.round((receivedLength / parseInt(contentLength)) * 100)
                  : Math.min(receivedLength / 1024 / 1024, 100) // 如果没有 content-length，用接收到的数据量估算
                
                // 计算实时下载速度
                const currentTime = Date.now()
                const timeDiff = (currentTime - lastUpdateTime) / 1000 // 转换为秒
                const dataDiff = receivedLength - lastReceivedLength
                const speedMBps = timeDiff > 0 ? (dataDiff / 1024 / 1024) / timeDiff : 0
                
                // 更新下载进度 - 使用相同的 downloadId，这样会更新现有项而不是创建新项
                dispatch(
                  addDownloadList({
                    ...song,
                    id: downloadId,
                    status: 'downloading',
                    progress: Math.min(progress, 99), // 保留1%给保存过程
                    speed: `${speedMBps.toFixed(1)} MB/s`,
                    size: fileSize
                  })
                )
                
                // 速度限制：如果速度超过限制，添加延迟
                if (speedMBps > MAX_SPEED_MBPS) {
                  const delayTime = Math.max(0, DELAY_MS - timeDiff * 1000)
                  if (delayTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, delayTime))
                  }
                }
                
                lastUpdateTime = currentTime
                lastReceivedLength = receivedLength
              }
            }
            
            // 如果下载被取消，直接返回
            if (abortController.signal.aborted) {
              console.log('下载已取消，清理资源')
              abortControllersRef.current.delete(downloadId)
              return
            }
            
            // 合并所有chunks
            const arrayBuffer = new Uint8Array(receivedLength)
            let position = 0
            for (const chunk of chunks) {
              arrayBuffer.set(chunk, position)
              position += chunk.length
            }
            
            // 4. 生成文件名
            const sanitize = (str: string) => str.replace(/[\\/:*?"<>|]/g, '_')
            const filename = `${sanitize(song.artist || 'unknown_artist')} - ${sanitize(song.music_title || 'unknown_title')}.mp3`
            
            // 5. 保存到本地
            await window.api.MusicSaveFile({ 
              buffer: arrayBuffer, 
              filename, 
              downloadPath 
            })
            
            // 6. 下载完成，更新 Redux
            dispatch(
              deleteDownloadList({
                ...song,
                id: downloadId,
                status: 'completed',
                progress: 100,
                speed: '完成',
                size: fileSize,
                completedAt: new Date().toISOString(),
              })
            )
            // 清理 AbortController
            abortControllersRef.current.delete(downloadId)
            
          } catch (error) {
            // 如果是取消下载导致的错误，不显示错误信息
            if (error instanceof Error && error.name === 'AbortError') {
              console.log('下载被用户取消')
              return
            }
            
            console.error('下载失败:', error)
            // 下载失败，更新状态
            dispatch(
              deleteDownloadList({
                ...song,
                id: downloadId,
                status: 'error',
                progress: 0,
                speed: '失败',
                size: '0 MB'
              })
            )
            // 清理 AbortController
            abortControllersRef.current.delete(downloadId)
          }
        }
      })

  const isCurrentlyPlaying = audioState.isPlaying && playInfo.id === item.id

  // 取消下载的函数
  const cancelDownload = (downloadId: string) => {
    const abortController = abortControllersRef.current.get(downloadId)
    if (abortController) {
      abortController.abort()
      abortControllersRef.current.delete(downloadId)
      dispatch(removeDownloadTask(downloadId))
      console.log('已取消下载:', downloadId)
    }
  }
  
  // 将取消函数暴露给全局，供其他组件使用
  React.useEffect(() => {
    ;(window as any).cancelDownload = cancelDownload
    return () => {
      delete (window as any).cancelDownload
    }
  }, [])

  return (
    <div>
      <div
        className={`group flex items-center gap-4 p-3 rounded-lg transition-all duration-200 cursor-pointer relative hover:bg-gray-800/60 ${
          audioState.isPlaying && playInfo.id === item.id ? 'bg-green-900/20' : ''
        } ${isHovered && !audioState.isPlaying ? 'bg-gray-800/60' : ''}`}
        onMouseEnter={() => {
          setIsHovered(true)
          setShowPlay(true)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowPlay(false)
        }}
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {/* 专辑封面 */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all duration-200 ${getAlbumColor(
              item.id
            )} ${isCurrentlyPlaying ? 'shadow-lg shadow-green-500/25' : ''}`}
          >
            {getInitials(item.music_title)}
          </div>
          <div
            className={`absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center transition-opacity duration-200 ${
              showPlay || isCurrentlyPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {isCurrentlyPlaying ? (
              <Pause className="w-5 h-5 text-white fill-white" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white" />
            )}
          </div>
        </div>
        {/* 歌曲信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate transition-colors duration-200">{item.artist}</h3>
          <p className="text-sm text-gray-400 truncate">{item.music_title}</p>
        </div>
        {/* 专辑名 */}
        {showAlbum && album && (
          <div className="hidden md:block flex-1 min-w-0">
            <p className="text-sm text-gray-400 truncate">专辑</p>
          </div>
        )}
        {/* 喜欢按钮 */}
        <div className="flex items-center gap-2 z-[1]">
          <LikeButton liked={isLiked(item.href)} onToggle={() => handleToggleLike(item)} />
        </div>
        {/* 时长 */}
        {showDuration && duration && (
          <div
            className={`text-sm w-12 text-right transition-colors duration-200 ${isCurrentlyPlaying ? 'text-green-400' : 'text-gray-400'}`}
          >
            {duration}
          </div>
        )}
        {/* 更多菜单 */}
        <div className="flex items-center">
          <button
            ref={moreButtonRef}
            onClick={handleMoreClick}
            className={`p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-gray-700 text-[#efefef] hover:bg-[#4f4f4f] opacity-0 group-hover:opacity-100 ${
              showMenu && menuType === 'more' ? 'opacity-100 bg-[#4f4f4f]' : ''
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        {/* 播放指示器 */}
        {isCurrentlyPlaying && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-full"></div>
        )}
      </div>

      {/* 下拉菜单 - 使用 Portal 但不影响主组件渲染 */}
      <DropdownMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        song={item}
        position={dropdownPosition}
        menuItems={menuItems}
      />
      {/* 是否强制添加modal */}
      <ModalWrapper
        title={'已添加'}
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, content: '' })}
        onAction={() => {
          if (modalState.song && modalState.groupId) {
            handleToggleLike(modalState.song, modalState.groupId, true)
          }
        }}
        actionText={'仍然添加'}
        buttonCloseText={'请勿添加'}
      >
        <p>{modalState.content}</p>
      </ModalWrapper>
      {/* 下载modal */}
      <ModalWrapper
        title={'提示'}
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        onAction={() => navigate('/SettingMusic')}
        actionText={'前往'}
        buttonCloseText={'取消'}
      >
        <p>没有设置下载路径，请先设置路径在进行下载。</p>
      </ModalWrapper>
    </div>
  )
}
