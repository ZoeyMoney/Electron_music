import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PlayerState, RootState } from "@renderer/InterFace";

const initialState: RootState = {
  //自建歌单
  myLikeMusic: [
    {
      id: 1,
      name: '我喜欢',
      songs: [],
    },
  ],
  //播放清单 - 歌单
  playListMusic: [],
  // 播放器状态
  audioState: {
    volume: 100, // 音量0-100 默认50
    currentTime: 0, // 初始播放时间
    loop: false, // 默认不循环
    random: false, // 默认不随机播放
    playbackRate: 1.0, // 默认播放速度正常
    duration: 0, //总时长
    isPlaying: false, // 播放状态
  },
  //播放信息
  playInfo: {
    loading: false,
    music_title: '',
    artist: '',
    href: '',
    pic: '',
    lrc: '无歌词',
  },
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // 我喜欢的音乐
    setMyLikeMusic: (state, action: PayloadAction<any>) => {
      state.myLikeMusic.push(action.payload);
    },
    //保存自建歌单的歌曲
    setMyLikeMusicList: (state, action: PayloadAction<any>) => {
      const { type, song, id } = action.payload
      console.log(type,song,id);
      if (type === 'add'){
        //根据id进行添加
        state.myLikeMusic = state.myLikeMusic.map(item=> {
          if (item.id === id) {
            return {
              ...item,
              songs: [...item.songs, song]
            }
          }
          return item
        })
      } else if (type === 'remove') {
        //根据id进行删除数据
        state.myLikeMusic = state.myLikeMusic.map(item=> {
          if (item.id === id){
            return {
              ...item,
              songs: item.songs.filter((item: any) => item.href !== song.href)
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
  }
});

export const {
  setMyLikeMusic, //设置自建歌单
  setMyLikeMusicList, // 保存自建歌单
  deleteMyLikeMusicList, //  删除自建歌单
  setAudioState, //  控制播放
  setPlayInfo, //  保存播放信息
  setPlayListMusic, //  保存播放清单
} = counterSlice.actions;
export default counterSlice.reducer;
