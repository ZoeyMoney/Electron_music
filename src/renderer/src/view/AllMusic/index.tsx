import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/store/store'
// import LikeAllMusicTable from '@renderer/components/LikeAllMusicTable'
import AnimatedList from '@renderer/components/AnimatedList'

const AllMusic: React.FC = () => {
  const { myLikeMusic, localMusicList } = useSelector((state: RootState) => state.counter)
  // 把所有 myLikeMusic 的 songs 提取出来并与本地音乐合并
  const allSongs = [
    ...localMusicList,
    ...myLikeMusic.flatMap((item) => item.songs) // 展平多个 songs
  ]
  return (
    <div>
      <h1 className={'mb-[25px] mt-3 text-[20px] font-bold'}>
        全部音乐：<span className={'text-[13px] text-[#f31260]'}>本地歌单+自建歌单</span>
      </h1>
      <div className={'h-[75vh] bg-[#1e1e1ead]'}>
        <AnimatedList
          data={allSongs}
          loadMore={() => {}}
          hasMore={false}
          sourceType={'allMusicList'}
        />
      </div>
    </div>
  )
}

export default AllMusic
