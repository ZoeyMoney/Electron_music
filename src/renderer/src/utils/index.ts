import ColorThief from 'colorthief'
import { LocalMusicInfo, MyLikeMusicList, PlayListProps, SongProps } from '@renderer/InterFace'
import { getMusicInfo } from '@renderer/Api'
import { store } from '@renderer/store/store'
import { setPlayInfo } from "@renderer/store/counterSlice";
import { useRef } from "react";
import { v4 as uuidv4 } from 'uuid'
import { addToast } from '@heroui/react'
import li from '@renderer/assets/image/Library-1.jpg'

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
export const parseLyrics = (lyrics: string): { time: number; text: string }[] => {
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
  if (song.localPath === true) {
    // 本地音乐，不请求接口，直接用传进来的信息
    store.dispatch(
      setPlayInfo({
        music_title: song.music_title,
        artist: song.artist,
        href: song.href, // 本地路径
        pic: song.pic || '',
        lrc: song.lrc || '无歌词',
        loading: false,
        id: song.id,
      })
    )
  } else {
    // 网络音乐，调用接口请求详细信息
    try {
      const res = await createSongInfo(song)
      store.dispatch(
        setPlayInfo({
          music_title: song.music_title,
          artist: song.artist,
          href: res.data.mp3_url,
          pic: res.data.pic,
          lrc: res.data.lrc || '无歌词',
          loading: false,
          id: song.id,
        })
      )
    } catch (err) {
      console.error('请求网络音乐信息失败:', err)
    }
  }
}

// 播放下一首歌
export const playNextSong = async (playList: SongProps[], currentId: string): Promise<void> => {
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
  //取historyPlayList倒数第二个歌曲  再点点击 接着往上播放
  const historyPlayList = store.getState().counter.historyPlayList
  if (historyPlayList.length > 1) {
    const prevSong = historyPlayList[historyPlayList.length - 2]
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
    )
  } else {
    console.log('没有上一首')
  }
}

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
    console.log(targetList)
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

//本地音乐
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
