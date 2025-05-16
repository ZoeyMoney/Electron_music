import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '@renderer/InterFace'

const initialState: RootState = {
  myLikeMusic: [
    {
      id: 1,
      name: '我喜欢',
      songs: []
    },{
      id: 2,
      name: '我喜欢2',
      songs: []
    },{
      id: 3,
      name: '我喜欢3',
      songs: []
    }
  ]
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // 我喜欢的音乐
    setMyLikeMusic: (state, action: PayloadAction<any>) => {
      state.myLikeMusic.push(action.payload);
    },
    // 音乐信息保存 myLikeMusic
    //保存自建歌单
    setMyLikeMusicList: (state, action: PayloadAction<any>) => {
      const { type, song, id } = action.payload
      console.log(type,song,id);
      if (type === 'add'){
        //根据id进行添加
        state.myLikeMusic = state.myLikeMusic.map(item=> {
          if (item.id === id){
            return {
              ...item,
              songs: [...item.songs, song]
            }
          }
          return item
        })
      } else if (type === 'remove'){
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
    //删除自建菜单内容
    deleteMyLikeMusicList: (state, action: PayloadAction<any>) => {
      const { id } = action.payload
      state.myLikeMusic = state.myLikeMusic.filter((item: any) => item.id !== id)
    }
  }
});

export const {
  setMyLikeMusic, //设置自建歌单
  setMyLikeMusicList, // 保存自建歌单
  deleteMyLikeMusicList, //  删除自建歌单
} = counterSlice.actions;
export default counterSlice.reducer;
