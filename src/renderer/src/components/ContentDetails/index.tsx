import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Image } from '@heroui/react'
import { useDispatch } from 'react-redux'
import { extractColors } from '@renderer/utils'
import AnimatedList from '@renderer/components/AnimatedList'
import { usePlaylistDetail } from '@renderer/components/Hook'
import { setPlayListMusic } from '@renderer/store/counterSlice'

const ContentDetails: React.FC = () => {
  const location = useLocation()
  const imgRef = useRef<HTMLImageElement>(null)
  const [colors, setColors] = useState<string[]>([])
  const dispatch = useDispatch()
  // 颜色提取
  const handleImageLoad = async (): Promise<void> => {
    if (imgRef.current) {
      try {
        const hexColors = await extractColors(imgRef.current)
        setColors(hexColors)
      } catch (e) {
        console.error('提取颜色失败:', e)
      }
    }
  }
  const { data, isLoading, refetch, isStale } = usePlaylistDetail(
    location.state.item.url_href
  )

  useEffect(() => {
    if (location.state.item.url_href && isStale) {
      refetch()
    }
  }, [location.state.item.url_href, isStale, refetch])
  const hasMore = data?.has_next ?? true;
  useEffect(() => {
    if (data?.music_list) {
      dispatch(setPlayListMusic(data.music_list))
    }
  }, [data?.music_list])
  return (
    <div
      className={'rounded-[5px] h-[75vh] flex flex-col'}
      style={{
        background: `linear-gradient(to bottom, ${colors[0] || '#000'}, ${colors[1] || '#000'})`
      }}
    >
      <div className={'grid grid-cols-[30%_70%] gap-5 m-2.5 w-[600px]'}>
        <div>
          <Image
            isBlurred
            alt="HeroUI Album Cover"
            src={location.state.item.pic || ''}
            width={240}
            onLoad={handleImageLoad}
            ref={imgRef}
          />
        </div>
        <div className={'flex flex-col justify-evenly'}>
          <div className={'text-[13px]'}>公开歌单</div>
          <div className={'text-[20px]'}>{location.state.item.name}</div>
          <div className={'text-[13px]'}>更多曲风</div>
          <div className={'text-[13px]'}>为 用户 打造 · 50首歌曲</div>
        </div>
      </div>
      <div
        className={'p-2.5 h-[75vh]'}
        style={{ background: 'linear-gradient(0deg, black 83%, transparent 96%)' }}
      >
        <AnimatedList
          data={data?.music_list || []}
          loadMore={() => {}}
          hasMore={hasMore}
          isLoading={isLoading}
          sourceType={'playlist'}
        />
      </div>
    </div>
  )
}

export default ContentDetails
