import ColorThief from 'colorthief'
import { SongProps } from '@renderer/InterFace'
import { getMusicInfo } from '@renderer/Api'

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
