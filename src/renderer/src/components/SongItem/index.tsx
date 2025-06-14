import React, { useMemo } from 'react'
import { useRef, useState } from "react"
import { Pause, Play, MoreHorizontal } from "lucide-react"
import { LocalMusicInfo, ModalState, SongProps } from '@renderer/InterFace'
import LikeButton from "@renderer/components/LikeButton"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from "@renderer/store/store"
import {
  createSongInfo,
  getAlbumColor,
  getInitials,
  getLocalMenuItems,
  getMenuItems,
  useDropdownMenu,
  useHandleDoubleClickPlay
} from '@renderer/utils'
import DropdownMenu from "@renderer/components/DropdownMenu/DropdownMenu"
import { setMyLikeMusicList } from '@renderer/store/counterSlice'
import { ModalWrapper } from '@renderer/components/ModalWrapper'
import { useNavigate } from 'react-router-dom'
import { addToast } from '@heroui/react'

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
        onDownload: (song) => {
          console.log(song,'songs')
          if (downloadPath === null) {
            setDownloadModalOpen(true)
          }
          //获取下载地址
          createSongInfo(song).then(async (res) => {
            const url = res.data.mp3_url;
            if (!url) {
              addToast({ title: '无下载链接', timeout: 2000, color: 'danger' });
              return;
            }

            const sanitize = (str: string): string => str.replace(/[/\\:*?"<>|]/g, '_');
            const filename = `${sanitize(song.artist || 'unknown_artist')} - ${sanitize(song.music_title || 'unknown_title')}.mp3`;
            console.log(filename, 'filename');

            try {
              const response = await fetch(url);
              if (!response.ok) throw new Error('网络错误');

              const blob = await response.blob();
              const blobUrl = URL.createObjectURL(blob);

              const link = document.createElement('a');
              link.href = blobUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              link.remove();

              URL.revokeObjectURL(blobUrl);

              addToast({
                title: '下载开始',
                timeout: 2000,
                color: 'success',
              });
            } catch (error) {
              addToast({
                title: '下载失败',
                timeout: 2000,
                color: 'danger',
              });
              console.error(error);
            }
          });
        }
      })

  const isCurrentlyPlaying = audioState.isPlaying && playInfo.id === item.id
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
