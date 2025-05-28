import React from 'react'
import { useLocation } from 'react-router-dom'
import AnimatedList from '@renderer/components/AnimatedList'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/store/store'
import animationData from '@renderer/assets/lottie/Animation.json'
import Lottie from 'lottie-react'
import { sortByDate } from '@renderer/utils'

const MyLikeMusic: React.FC = () => {
  //获取跳转来的数据  id key name songs
  const location = useLocation()
  //获取实时歌单
  const { myLikeMusic } = useSelector((state: RootState) => state.counter)
  //根据id匹配songs
  const songs = myLikeMusic.find((item) => item.id === location.state.item.id)?.songs ?? []
  const list = sortByDate(songs, 'desc')
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
              data={list}
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
