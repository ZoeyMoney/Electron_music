import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { LocalMusicInfo, PlayerState, RootState } from '@renderer/InterFace'

const initialState: RootState = {
  //自建歌单
  myLikeMusic: [
    {
      id: 1,
      name: '我喜欢',
      key: 'MyLike',
      songs: []
    }
  ],
  //播放清单 - 歌单
  playListMusic: [],
  menuDataType: 'playListMusicType',
  // 播放器状态
  audioState: {
    volume: 100, // 音量0-100 默认50
    currentTime: 0, // 初始播放时间
    loop: false, // 默认不循环
    random: false, // 默认不随机播放
    playbackRate: 1.0, // 默认播放速度正常
    duration: 0, //总时长
    isPlaying: false // 播放状态
  },
  localMusicList: [], //本地音乐
  historyPlayList: [], //历史播放
  //播放信息
  playInfo: {
    loading: false,
    music_title: '',
    artist: '',
    href: '',
    pic: '',
    lrc: '无歌词',
    id: ''
  },
  downloadPath: null, //下载地址
  downloadList: [], //下载中的音乐列表
  downloadFinishList: [], // 下载完成音乐列表
  closeToQuit: false // 是否关闭时退出，默认false为最小化
}

// 安全的数组操作函数
const ensureArray = (value: any): any[] => {
  if (Array.isArray(value)) {
    return value
  }
  console.warn('Expected array but got:', typeof value, value)
  return []
}

const safeFilter = (array: any[], predicate: (item: any) => boolean): any[] => {
  const safeArray = ensureArray(array)
  return safeArray.filter(predicate)
}

const safeMap = (array: any[], mapper: (item: any) => any): any[] => {
  const safeArray = ensureArray(array)
  return safeArray.map(mapper)
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // 我喜欢的音乐
    setMyLikeMusic: (state, action: PayloadAction<any>) => {
      if (!Array.isArray(state.myLikeMusic)) {
        state.myLikeMusic = []
      }
      state.myLikeMusic.push(action.payload)
    },
    //保存自建歌单的歌曲
    setMyLikeMusicList: (state, action: PayloadAction<any>) => {
      const { type, data, id } = action.payload
      console.log(data)
      // 确保 myLikeMusic 是数组
      if (!Array.isArray(state.myLikeMusic)) {
        state.myLikeMusic = []
      }
      
      if (type === 'add') {
        //根据id进行添加
        state.myLikeMusic = safeMap(state.myLikeMusic, (item) => {
          if (item.id === id) {
            return {
              ...item,
              songs: [...(Array.isArray(item.songs) ? item.songs : []), data]
            }
          }
          return item
        })
      } else if (type === 'remove') {
        //根据id进行删除数据
        state.myLikeMusic = safeMap(state.myLikeMusic, (item) => {
          if (item.id === id) {
            return {
              ...item,
              songs: safeFilter(Array.isArray(item.songs) ? item.songs : [], (song: any) => song.href !== data.href)
            }
          }
          return item
        })
      }
    },
    //播放清单
    setPlayListMusic: (state, action: PayloadAction<any>) => {
      state.playListMusic = action.payload
    },
    //删除自建菜单
    deleteMyLikeMusicList: (state, action: PayloadAction<any>) => {
      const { id } = action.payload
      state.myLikeMusic = safeFilter(state.myLikeMusic, (item: any) => item.id !== id)
    },
    // 保存播放信息
    setPlayInfo: (state, action: PayloadAction<any>) => {
      state.playInfo = action.payload
    },
    // 控制播放
    setAudioState: (state, action: PayloadAction<Partial<PlayerState>>) => {
      Object.assign(state.audioState, action.payload)
    },
    // 添加历史播放
    setHistoryPlayList: (state, action: PayloadAction<any>) => {
      //获取的数据  放到 historyPlayList
      if (!Array.isArray(state.historyPlayList)) {
        state.historyPlayList = []
      }
      state.historyPlayList.push(action.payload)
    },
    //添加本地歌曲
    setMusicLocalDataList: (state, action: PayloadAction<LocalMusicInfo[]>) => {
      if (!Array.isArray(state.localMusicList)) {
        console.warn('state.MusicDataList is not an array, resetting to empty array')
        state.localMusicList = []
      }
      state.localMusicList = [...state.localMusicList, ...action.payload]
    },
    //删除本地歌曲
    removeMusicLocalDataList: (state, action: PayloadAction<string>) => {
      state.localMusicList = safeFilter(state.localMusicList, (item) => !action.payload.includes(item.id))
    },
    //更改播放类型
    setMenuDataType: (state, action: PayloadAction<any>) => {
      console.log(state.menuDataType, action.payload, 'sta')
      state.menuDataType = action.payload
    },
    //设置下载地址
    setDownloadPath: (state, action: PayloadAction<any>) => {
      state.downloadPath = action.payload
    },
    //添加下载列表
    addDownloadList: (state, action: PayloadAction<any>) => {
      if (!Array.isArray(state.downloadList)) {
        state.downloadList = []
      }
      const existingIndex = state.downloadList.findIndex(item => item.id === action.payload.id)
      if (existingIndex !== -1) {
        // 如果已存在，更新现有项
        state.downloadList[existingIndex] = action.payload
      } else {
        // 如果不存在，添加新项
        state.downloadList.push(action.payload)
      }
    },
    // 删除下载列表 并且 保存到下载历史
    deleteDownloadList: (state, action: PayloadAction<any>) => {
      state.downloadList = safeFilter(state.downloadList, (item) => item.id !== action.payload.id)
      if (!Array.isArray(state.downloadFinishList)) {
        state.downloadFinishList = []
      }
      state.downloadFinishList.push(action.payload)
    },
    // 移除下载任务（取消下载，不保存到历史）
    removeDownloadTask: (state, action: PayloadAction<string>) => {
      state.downloadList = safeFilter(state.downloadList, (item) => item.id !== action.payload)
    },
    // 设置是否关闭时退出
    setCloseToQuit: (state, action: PayloadAction<boolean>) => {
      state.closeToQuit = action.payload
    }
  }
})

export const {
  setMyLikeMusic, //设置自建歌单
  setMyLikeMusicList, // 保存自建歌单
  deleteMyLikeMusicList, //  删除自建歌单
  setAudioState, //  控制播放
  setPlayInfo, //  保存播放信息
  setPlayListMusic, //  保存播放清单
  setHistoryPlayList, //  添加历史播放
  setMusicLocalDataList, //添加本地音乐
  removeMusicLocalDataList, // 删除本地音乐
  setMenuDataType, // 更改播放类型
  setDownloadPath, //设置下载地址
  addDownloadList, //添加下载列表
  deleteDownloadList, // 移除下载列表
  removeDownloadTask, // 移除下载任务
  setCloseToQuit, // 设置是否关闭时退出
} = counterSlice.actions
export default counterSlice.reducer
