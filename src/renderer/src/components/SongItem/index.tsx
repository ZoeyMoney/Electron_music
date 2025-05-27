import React, { useMemo } from 'react'
import { useRef, useState } from "react"
import { Pause, Play, MoreHorizontal } from "lucide-react"
import { LocalMusicInfo, ModalState, SongProps } from '@renderer/InterFace'
import LikeButton from "@renderer/components/LikeButton"
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from "@renderer/store/store"
import { getAlbumColor, getInitials, getLocalMenuItems, getMenuItems, useHandleDoubleClickPlay } from '@renderer/utils'
import DropdownMenu from "@renderer/components/DropdownMenu/DropdownMenu"
import { setMyLikeMusicList } from '@renderer/store/counterSlice'
import { ModalWrapper } from '@renderer/components/ModalWrapper'

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
  const { myLikeMusic, audioState, playInfo } = useSelector((state: RootState) => state.counter)
  const [isHovered, setIsHovered] = useState(false)
  const [showPlay, setShowPlay] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [menuType, setMenuType] = useState<"more" | "context">("more")
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 })
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const { createDoubleClickHandler } = useHandleDoubleClickPlay()
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, content: '' });
  const musicTableRef = useRef<{
    handleToggleLike: (song: SongProps, groupId?: string | number, forceAdd?: boolean) => Promise<void>
  }>(null)
  const dispatch = useDispatch()
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

  const handleMoreClick = (e: React.MouseEvent): void => {
    e.stopPropagation()
    e.preventDefault()

    const rect = moreButtonRef.current?.getBoundingClientRect()
    if (rect) {
      setDropdownPosition({
        x: rect.left,
        y: rect.bottom + 5,
      })
    }
    setMenuType("more")
    setShowMenu((prev) => !prev)
  }

  const handleContextMenu = (e: React.MouseEvent): void => {
    e.preventDefault()
    e.stopPropagation()

    setDropdownPosition({
      x: e.clientX,
      y: e.clientY,
    })
    setMenuType("context")
    setShowMenu(true)
  }

  //点赞
  const handleToggleLike = async (
    song: SongProps,
    groupId: string | number = 1,
    forceAdd: boolean = false // 强制添加
  ): Promise<void> => {
    const alreadyLiked = isLiked(song.href)
    if (alreadyLiked && !forceAdd) {
      // 取消点赞
      dispatch(
        setMyLikeMusicList({
          type: 'remove',
          id: groupId,
          song
        })
      )
    } else {
      // 添加到歌单
      // const musicInfo = await createSongInfo(song)
      dispatch(
        setMyLikeMusicList({
          type: 'add',
          id: groupId,
          song
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
  //选择菜单
  const menuItems = isLocalSong
    ? getLocalMenuItems(item, () => setShowMenu(false), handleAddToPlaylist, sourceType)
    : getMenuItems(item, () => setShowMenu(false), handleAddToPlaylist, sourceType)

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
    </div>
  )
}
