import ColorThief from 'colorthief'

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
  { name: '添加', uid: 'like', width: 'w-1/4' },
]
