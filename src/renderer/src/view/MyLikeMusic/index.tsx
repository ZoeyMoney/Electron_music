import React from 'react'
import { useLocation } from 'react-router-dom'
import LocalMusicTable from '@renderer/components/LocalMusicTable'

const MyLikeMusic: React.FC = () => {
  //获取跳转来的数据  id key name songs
  const location = useLocation()
  console.log(location.state.item.id,'my')
  const columns = [
    { name: '#', uid: 'id', width: 'w-1/10' },
    { name: '歌曲名', uid: 'music_title', width: 'w-1/2' },
    { name: '歌手', uid: 'artist', width: 'w-1/4' },
  ]
  return (
    <div>
      <h1 className={'mb-[25px] mt-3 text-[20px] font-bold'}>{location.state.item.name}</h1>
      <LocalMusicTable
        items={location.state.item.songs}
        columns={columns}
        menuDataType={location.state.item.id}
        addButton={false}
        showDate={false}
        showActions={true}
        showDuration={false}
        showSongInfo={true}
      />
    </div>
  )
}

export default MyLikeMusic
