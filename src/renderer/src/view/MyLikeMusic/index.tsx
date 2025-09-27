import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import AnimatedList from '@renderer/components/AnimatedList'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@renderer/store/store'
import animationData from '@renderer/assets/lottie/Animation.json'
import Lottie from 'lottie-react'
import { reorderMyLikeMusicSongs } from '@renderer/store/counterSlice'

const MyLikeMusic: React.FC = () => {
  //获取跳转来的数据  id key name songs
  const location = useLocation()
  const dispatch = useDispatch()
  //获取实时歌单
  const { myLikeMusic } = useSelector((state: RootState) => state.counter)
  //根据id匹配songs - 数据本身已经按日期降序排序
  const songs = myLikeMusic.find((item) => item.id === location.state.item.id)?.songs ?? []

  // 组件加载时重新排序歌单数据，确保播放列表顺序与UI显示顺序一致
  useEffect(() => {
    if (location.state?.item?.id) {
      dispatch(reorderMyLikeMusicSongs(location.state.item.id))
    }
    console.log(songs);

  }, [dispatch, location.state?.item?.id])

  return (
    <div>
      {songs.length === 0 ? (
        <div className={'flex items-center justify-center flex-col h-[75vh]'}>
          <Lottie animationData={animationData} loop={true} style={{ width: 300, height: 300 }} />
          <div>暂无数据</div>
        </div>
      ) : (
        <>
          <h1 className={'mb-[25px] mt-3 text-[20px] font-bold'}>{location.state.item.name}</h1>
          <div className={'h-[67vh] bg-[#1e1e1ead]'}>
            <AnimatedList
              data={songs}
              loadMore={() => {}}
              hasMore={false}
              sourceType={location.state.item.id}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default MyLikeMusic
