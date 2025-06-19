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
  downloadFinishList: [] // 下载完成音乐列表
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // 我喜欢的音乐
    setMyLikeMusic: (state, action: PayloadAction<any>) => {
      state.myLikeMusic.push(action.payload)
    },
    //保存自建歌单的歌曲
    setMyLikeMusicList: (state, action: PayloadAction<any>) => {
      const { type, data, id } = action.payload
      console.log(data)
      if (type === 'add') {
        //根据id进行添加
        state.myLikeMusic = state.myLikeMusic.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              songs: [...item.songs, data]
            }
          }
          return item
        })
      } else if (type === 'remove') {
        //根据id进行删除数据
        state.myLikeMusic = state.myLikeMusic.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              songs: item.songs.filter((item: any) => item.href !== data.href)
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
      state.myLikeMusic = state.myLikeMusic.filter((item: any) => item.id !== id)
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
      if (!state.historyPlayList) {
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
      state.localMusicList = state.localMusicList.filter(
        (item) => !action.payload.includes(item.id)
      )
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
      state.downloadList.push(action.payload)
    },
    // 删除下载列表 并且 保存到下载历史
    deleteDownloadList: (state, action: PayloadAction<any>) => {
      state.downloadList = state.downloadList.filter(
        (item) => item.id !== action.payload.id
      )
      state.downloadFinishList.push(action.payload)
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
} = counterSlice.actions
export default counterSlice.reducer
