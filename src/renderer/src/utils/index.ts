import ColorThief from 'colorthief'
import {
  LocalMusicInfo,
  MenuItemProps,
  MyLikeMusicList,
  PlayListProps,
  SongProps,
  UseDropdownMenuProps
} from '@renderer/InterFace'
import { getMusicInfo } from '@renderer/Api'
import { RootState, store } from '@renderer/store/store'
import {
  removeMusicLocalDataList,
  setHistoryPlayList,
  setMenuDataType,
  setPlayInfo
} from '@renderer/store/counterSlice'
import { useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { addToast } from '@heroui/react'
import li from '@renderer/assets/image/Library-1.jpg'
import { useDispatch, useSelector } from 'react-redux'
import { pauseAudio } from '@renderer/utils/audioConfig'
import { Download, ListPlus, Share, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

//格式化日期 年月日
export const formatDate = (date: string | Date): string => {
  const dates = new Date(date)
  return dates.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

//rgb 转hex
const rgbToHex = (r: number, g: number, b: number): string => {
  // const hex = ((r << 16) | (g << 8) | b).toString(16)
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

//提取调色盘
// 封装函数：提取颜色并返回 Promise<string[]>
export const extractColors = (img: HTMLImageElement): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    try {
      const colorThief = new ColorThief()
      // 等待图片加载完成（保险起见）
      if (img.complete) {
        const palette = colorThief.getPalette(img, 2)
        const hexColors = palette.map(([r, g, b]) => rgbToHex(r, g, b))
        resolve(hexColors)
      } else {
        img.onload = () => {
          const palette = colorThief.getPalette(img, 2)
          const hexColors = palette.map(([r, g, b]) => rgbToHex(r, g, b))
          resolve(hexColors)
        }
      }
    } catch (error) {
      reject(error)
    }
  })
}

// 表格列定义
export const columns = [
  { name: '#', uid: 'index', width: 'w-1/10' },
  { name: '歌曲名', uid: 'music_title', width: 'w-1/2' },
  { name: '歌手', uid: 'artist', width: 'w-1/3' },
  { name: '添加', uid: 'like', width: 'w-1/4' }
]

//获取歌曲音乐播放地址
export const createSongInfo = async (item: SongProps): Promise<any> => {
  try {
    return await getMusicInfo({ href: item.href })
  } catch (e) {
    console.error('获取歌曲信息失败:', e)
    return null
  }
}

// 解析歌词字符串成数组 [{ time: 秒数, text: 歌词 }, ...]
export const parseLyrics = (lyrics: string = ''): { time: number; text: string }[] => {
  const lines = lyrics.trim().split('\n')
  return lines
    .map((line) => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{3})]/)
      if (!match) return null
      const minutes = parseInt(match[1], 10)
      const seconds = parseInt(match[2], 10)
      const milliseconds = parseInt(match[3], 10)
      const time = minutes * 60 + seconds + milliseconds / 1000
      const text = line.replace(/\[\d{2}:\d{2}\.\d{3}]/, '').trim()
      return { time, text }
    })
    .filter(Boolean) as { time: number; text: string }[]
}

//节流封装
export const useThrottleFn = (fn: (...args: any[]) => void, delay = 3000) => {
  const throttleRef = useRef(false)

  return (...args: any[]) => {
    if (throttleRef.current) return
    throttleRef.current = true
    fn(...args)
    setTimeout(() => {
      throttleRef.current = false
    }, delay)
  }
}

// 格式化音乐时间
export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
// 封装添加历史记录的函数
export const addToHistoryPlayList = (song: any): any => {
  const { historyPlayList } = store.getState().counter;

  // 检查歌曲是否已存在（去重）
  const isExist = historyPlayList.some(
    (item) => item.id === song.id || item.href === song.href
  );

  if (!isExist) {
    store.dispatch(
      setHistoryPlayList({
        music_title: song.music_title,
        artist: song.artist,
        href: song.href,
        pic: song.pic || '',
        lrc: song.lrc || '无歌词',
        id: song.id,
        date: song.date || Date.now(),
      })
    );
  }
};
//获取redux中的playListMusic歌单信息
const getPlayListMusic = (): PlayListProps[] => store.getState().counter.playListMusic
//获取本地音乐列表
const getLocalMusicList = (): LocalMusicInfo[] => store.getState().counter.localMusicList
//自建歌单
const getSelfPlayList = (): MyLikeMusicList[] => store.getState().counter.myLikeMusic
//获取播放列表
const getMenuDataType = (): string => store.getState().counter.menuDataType
// 获取是否随机播放
const getRandomPlay = (): boolean => store.getState().counter.audioState.random
// 辅助：根据歌曲请求歌曲信息，并派发redux更新
const fetchAndDispatchPlayInfo = async (song: SongProps & { localPath?: boolean }): Promise<void> => {
  try {
    let playInfoPayload: any;
    if (song.localPath === true) {
      // 本地音乐
      playInfoPayload = {
        music_title: song.music_title,
        artist: song.artist,
        href: song.href,
        pic: song.pic || '',
        lrc: song.lrc || '无歌词',
        loading: false,
        id: song.id,
      };
    } else {
      // 网络音乐
      const res = await createSongInfo(song);
      if (!res.data.mp3_url) {
        throw new Error('获取歌曲信息失败');
      }
      playInfoPayload = {
        music_title: song.music_title,
        artist: song.artist,
        href: res.data.mp3_url,
        pic: res.data.pic || '',
        lrc: res.data.lrc || '无歌词',
        loading: false,
        id: song.id,
      };
    }

    // 更新 playInfo
    store.dispatch(setPlayInfo(playInfoPayload));
    // 添加到历史播放记录
    addToHistoryPlayList(playInfoPayload);
  } catch (err) {
    console.error('请求音乐信息失败:', err);
    store.dispatch(setPlayInfo({ ...store.getState().counter.playInfo, loading: false }));
    addToast({ title: '请求音乐信息失败', color: 'danger', timeout: 3000 });
  }
}

// 播放下一首歌
export const playNextSong = async (playList: SongProps[], currentId: string): Promise<void> => {
  console.log(playList,currentId,'12345')
  if (!playList || playList.length === 0) {
    console.warn('播放列表为空')
    return
  }

  const currentIndex = playList.findIndex((item) => item.id === currentId)
  if (getRandomPlay()) {
    if (playList.length === 1) {
      // 唯一歌曲直接播放
      await fetchAndDispatchPlayInfo(playList[0])
      return
    }
    // 随机选曲且避免当前曲重复
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * playList.length)
    } while (randomIndex === currentIndex)

    await fetchAndDispatchPlayInfo(playList[randomIndex])
  } else {
    // 顺序播放下一首
    if (currentIndex === -1) {
      console.warn('当前歌曲未找到，播放第一首')
      await fetchAndDispatchPlayInfo(playList[0])
      return
    }
    if (currentIndex < playList.length - 1) {
      await fetchAndDispatchPlayInfo(playList[currentIndex + 1])
    } else {
      console.log('已经是最后一首，没有下一首')
      // 可以考虑循环播放，这里暂时不循环
    }
  }
}

// 播放上一首歌
export const playPrevSong = async (): Promise<void> => {
  const historyPlayList = store.getState().counter.historyPlayList;
  if (historyPlayList.length > 1) {
    const prevSong = historyPlayList[historyPlayList.length - 2];
    store.dispatch(
      setPlayInfo({
        music_title: prevSong.music_title,
        artist: prevSong.artist,
        href: prevSong.href,
        pic: prevSong.pic,
        lrc: prevSong.lrc,
        loading: false,
        id: prevSong.id
      })
    );
  } else {
    console.log('没有上一首');
  }
};

//播放清单类型
export const menuHandlerMap: Record<string, (id: string, direction?: 'next' | 'prev') => void> = {
  playListMusicType: async (id: string, direction = 'next') => {
    // 播放清单
    const list = getPlayListMusic()
    if (direction === 'prev') {
      await playPrevSong()
    } else {
      await playNextSong(list, id)
    }
  },
  allMusicList: async (id: string, direction = 'next') => {
    const localMusic = getLocalMusicList()
    const getLikeSongs = getSelfPlayList()
    // 全部音乐 本地+自建歌单
    const allSongs = [
      ...localMusic,
      ...getLikeSongs.flatMap((item) => item.songs),
    ]
    if (direction === 'prev') {
      await playPrevSong()
    } else {
      await playNextSong(allSongs, id)
    }
  },
  localMusicList: async (id: string, direction = 'next') => {
    console.log(id,'id')
    // 本地音乐
    const list = getLocalMusicList()
    if (direction === 'prev') {
      await playPrevSong()
    } else {
      await playNextSong(list, id)
    }
  },
  '1': async (id: string, direction = 'next') => {
    // 我喜欢列表
    const getLikeSongs = getSelfPlayList()
    if (direction === 'prev') {
      await playPrevSong()
    } else {
      await playNextSong(getLikeSongs[0].songs, id)
    }
  },
  default: async (id: string, direction = 'next') => {
    // 我喜欢列表
    const playLists = getSelfPlayList()
    const menuDataType = getMenuDataType()
    //根据id匹配播放列表
    const targetList = playLists.find((item) => String(item.id) === String(menuDataType))
    if (!targetList) {
      console.warn(`找不到 id 为 ${id} 的歌单`)
      return
    }

    if (direction === 'prev') {
      await playPrevSong()
    } else {
      await playNextSong(targetList.songs, id)
    }
  }
}

//本地歌曲 下载歌曲 正在下载
export const LocalAndDownloadList = [
  {
    key: 'LocalMusic',
    title: '本地歌曲',
  },
  {
    key: 'DownloadMusic',
    title: '下载歌曲'
  }
]

//添加本地音乐
export const handleAddMusic = async (): Promise<LocalMusicInfo[] | void> => {
  try {
    const result = await window.api.selectMusicFolder();
    if (!Array.isArray(result)) {
      console.error('返回的不是数组:', result);
      return;
    }

    const musicData: LocalMusicInfo[] = await Promise.all(
      result.map(async (path: string) => {
        //日期
        const now = new Date()
          .toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
          .replace(/\//g, '-')
        const fileName = path.split('\\').pop()?.replace('.mp3', '') || '未知标题';
        const fileNameParts = fileName.split(' - ');

        let music_title: string;
        let artist: string;

        if (fileNameParts.length > 1) {
          music_title = fileNameParts[1] || '未知标题';
          artist = fileNameParts[0] || '未知歌手';
        } else {
          music_title = fileName || '未知标题';
          artist = '未知歌手';
        }

        const durationInSeconds = await window.api.getAudioDuration(path);
        const formattedDuration = formatTime(durationInSeconds);

        return {
          id: uuidv4(),
          music_title,
          artist: artist,
          date: now,
          duration: formattedDuration,
          href: path,
          pic: li,
          album: '未知专辑',
          lrc: '无歌词',
          localPath: true, //是否是本地音乐  true 是 false否
        };
      })
    );

    console.log('musicData:', musicData);

    return musicData; // 返回给调用者控制是否 dispatch
  } catch (error) {
    console.error('打开文件夹失败:', error);
    addToast({
      title: '只允许添加文件夹',
      timeout: 2000,
      color: 'danger'
    });
  }
};

// 生成基于歌曲ID的颜色
export const getAlbumColor = (id?: string): string => {
  const colors = [
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-cyan-500',
    'bg-orange-500'
  ]

  const safeId = id ?? ""; // 如果 undefined，则当成空字符串

  const hash = Array.from(safeId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
//双击播放音乐
export const useHandleDoubleClickPlay = (setLinId?: (id: string) => void): any => {
  const dispatch = useDispatch()
  const { playInfo, historyPlayList } = useSelector((state: RootState) => state.counter)
  const queryClient = useQueryClient()

  const handleDoubleClick = useCallback(
    async (song: LocalMusicInfo | SongProps, sourceType?: 'playListMusicType' | 'allMusicList' | 'localMusicList' | string | '1'): Promise<void> => {
      setLinId?.(song.id ?? '')
      pauseAudio()
      dispatch(setPlayInfo({ ...playInfo, loading: true, href: '' }))

      try {
        let finalHref = ''
        if ('localPath' in song && song.localPath) {
          finalHref = song.href
          dispatch(
            setPlayInfo({
              music_title: song.music_title,
              artist: song.artist,
              href: finalHref,
              pic: song.pic,
              lrc: song.lrc,
              loading: false,
              id: song.id,
            })
          )
        } else {
          // 使用 queryClient.fetchQuery，复用 useSongInfo 的逻辑
          const songInfo = await queryClient.fetchQuery({
            queryKey: ['songInfo', song.href],
            queryFn: async () => {
              const res = await getMusicInfo({ href: song.href })
              return res.data
            },
            staleTime: 1000 * 60 * 24,
            gcTime: 1000 * 60 * 24,
          })
          console.log(songInfo)
          if (songInfo?.mp3_url) {
            finalHref = songInfo.mp3_url
            dispatch(
              setPlayInfo({
                music_title: song.music_title,
                artist: song.artist,
                href: songInfo.mp3_url,
                pic: songInfo.pic,
                lrc: songInfo.lrc,
                loading: false,
                id: song.id,
              })
            )
          } else {
            throw new Error('获取歌曲信息失败')
          }
        }

        if (sourceType) {
          dispatch(setMenuDataType(sourceType))
        }

        // 添加到历史播放记录（去重）
        const isExist = historyPlayList.some(
          (item) => item.id === song.id || item.href === finalHref
        )
        if (!isExist) {
          dispatch(
            setHistoryPlayList({
              ...song,
              href: finalHref,
              date: Date.now(),
            })
          )
          console.log(historyPlayList)
        }
      } catch (error) {
        console.error('获取歌曲失败：', error)
        dispatch(setPlayInfo({ ...playInfo, loading: false }))
        addToast({ title: '请求异常或歌曲信息获取失败', color: 'danger', timeout: 3000 })
      }
    },
    [dispatch, playInfo, historyPlayList, setLinId, queryClient]
  )

  // 新增：生成绑定了 item 和 sourceType 的回调
  const createDoubleClickHandler = useCallback(
    (song: LocalMusicInfo | SongProps, sourceType?: string) => {
      return () => handleDoubleClick(song, sourceType)
    },
    [handleDoubleClick]
  )

  return { handleDoubleClick, createDoubleClickHandler }
}
// 获取歌曲名首字母
export const getInitials = (title: string): string => {
  return title
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
}
// 公共菜单项
export const getCommonMenuItems = (
  song: SongProps,
  onClose: () => void,
  onAddToPlaylist: (song: SongProps, playlistId: string | number) => void,
  sourceType: 'playListMusicType' | 'allMusicList' | 'localMusicList' | string | '1'
): MenuItemProps[] => {
  const myLikeMusic = getSelfPlayList()

  const addToPlaylistMenu: MenuItemProps = {
    icon: ListPlus,
    label: '添加到播放列表',
    children: myLikeMusic.map((playlist) => ({
      label: playlist.name,
      onClick: () => {
        onAddToPlaylist(song, playlist.id)
        onClose()
        console.log('来源：',sourceType)
      }
    }))
  }

  return [
    addToPlaylistMenu,
    {
      icon: Share,
      label: '分享',
      onClick: () => {
        console.log('分享:', song.music_title)
        onClose()
      }
    }
  ]
}
//  网络菜单项
export const getMenuItems = (
  song: SongProps,
  onClose: () => void,
  onAddToPlaylist: (song: SongProps, playlistId: number | string) => void,
  sourceType: 'playListMusicType' | 'allMusicList' | 'localMusicList' | string | '1',
  callbacks?: {
    onDownload?: (song: SongProps) => void
  }
): MenuItemProps[] => {
  return [
    ...getCommonMenuItems(song, onClose, onAddToPlaylist, sourceType),
    {
      icon: Download,
      label: '下载',
      onClick: () => {
        callbacks?.onDownload?.(song)
        onClose()
      }
    },
  ]
}
// 本地音乐菜单项
export const getLocalMenuItems = (
  song: SongProps,
  onClose: () => void,
  onAddToPlaylist: (song: SongProps, playlistId: number | string) => void,
  sourceType: 'playListMusicType' | 'allMusicList' | 'localMusicList' | string | '1'
): MenuItemProps[] => {
  return [
    ...getCommonMenuItems(song, onClose, onAddToPlaylist, sourceType),
    {
      icon: Trash2,
      label: '从列表中移除',
      onClick: () => {
        //移除本地歌曲
        if (song.id != null) {
          store.dispatch(removeMusicLocalDataList(song.id))
          addToast({
            title: '已从列表中移除',
            color: 'success',
            timeout: 2000
          })
        }
        onClose()
      },
      danger: true
    }
  ]
}


//右键菜单
export const useDropdownMenu = ({ initialMenuType = '' }: UseDropdownMenuProps): any => {
  const [showMenu, setShowMenu] = useState(false)
  const [menuType, setMenuType] = useState(initialMenuType)
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 })
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const handleMoreClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const rect = moreButtonRef.current?.getBoundingClientRect()
    if (rect) {
      setDropdownPosition({
        x: rect.left,
        y: rect.bottom + 5,
      })
    }
    setMenuType('more')
    setShowMenu(prev => !prev)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent,item: any) => {
    e.preventDefault()
    e.stopPropagation()

    setDropdownPosition({
      x: e.clientX,
      y: e.clientY,
    })
    setMenuType('context')
    setSelectedItem(item);
    setShowMenu(true)
  }, [])

  return {
    showMenu,
    setShowMenu,
    menuType,
    setMenuType,
    dropdownPosition,
    moreButtonRef,
    handleMoreClick,
    handleContextMenu,
    selectedItem
  }
}
/*排序 默认asc */
export const sortByDate = <T extends { date: string }>(
  list: T[],
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  // 拷贝一份，避免修改原数组
  const arr = [...list];

  arr.sort((a, b) => {
    // 把 ISO 字符串转换为时间戳
    const ta = Date.parse(a.date);
    const tb = Date.parse(b.date);

    // 升序：时间戳小的在前；降序反过来
    if (order === 'asc') {
      return ta - tb;
    } else {
      return tb - ta;
    }
  });

  return arr;
};
