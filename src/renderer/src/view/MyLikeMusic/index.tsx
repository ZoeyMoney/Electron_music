import React from 'react'
import { useLocation } from 'react-router-dom'
import AnimatedList from '@renderer/components/AnimatedList'

const MyLikeMusic: React.FC = () => {
  //获取跳转来的数据  id key name songs
  const location = useLocation()
  console.log(location.state.item.id,'my')
  console.log(location.state.item.songs)

  return (
    <div>
      <h1 className={'mb-[25px] mt-3 text-[20px] font-bold'}>{location.state.item.name}</h1>
      <div className={'h-[75vh] bg-[#1e1e1ead]'}>
        <AnimatedList
          data={location.state.item.songs}
          loadMore={() => {}}
          hasMore={false}
        />
      </div>
      {/*<LocalMusicTable
        items={location.state.item.songs}
        columns={columns}
        menuDataType={location.state.item.id}
        addButton={false}
        showDate={false}
        showActions={true}
        showDuration={false}
        showSongInfo={true}
      />*/}
    </div>
  )
}

export default MyLikeMusic
