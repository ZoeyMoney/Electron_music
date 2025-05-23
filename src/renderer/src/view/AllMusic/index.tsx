import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/store/store'
// import LikeAllMusicTable from '@renderer/components/LikeAllMusicTable'
import LocalMusicTable from '@renderer/components/LocalMusicTable'

const AllMusic: React.FC = () => {
  const { myLikeMusic, localMusicList } = useSelector((state: RootState) => state.counter)
  // 把所有 myLikeMusic 的 songs 提取出来并与本地音乐合并
  const allSongs = [
    ...localMusicList,
    ...myLikeMusic.flatMap((item) => item.songs) // 展平多个 songs
  ]
  console.log(allSongs)
  // 表头
  const columns = [
    { name: '#', uid: 'id', width: 'w-1/10' },
    { name: '歌曲名', uid: 'music_title', width: 'w-1/2' },
    { name: '歌手', uid: 'artist', width: 'w-1/4' },
  ]
  return (
    <div>
      <h1 className={'mb-[25px] mt-3 text-[20px] font-bold'}>
        全部音乐：<span className={'text-[13px] text-[#f31260]'}>本地歌单+自建歌单</span>
      </h1>
      <LocalMusicTable
        items={allSongs}
        columns={columns}
        menuDataType={'allMusicList'}
        addButton={false}
        showDate={false}
        showActions={false}
        showDuration={false}
        showSongInfo={true}
      />
    </div>
  )
}

export default AllMusic
