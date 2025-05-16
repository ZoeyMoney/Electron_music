import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import MusicSwiper from '@renderer/components/MusicSwiper'
import { getPlaylist } from '@renderer/Api'
import MusicList from '@renderer/components/MusicList'
import { useNavigate } from 'react-router-dom'

const Recommend: React.FC = () => {
  const [playList, setPlayList] = useState([])
  const [tjImageList, setTjImageList] = useState([])
  const [loading, setLoading] = useState<boolean>(true)
  const [MusicListLoading, setMusicListLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  const fetchData = async (): Promise<void> => {
    try {
      //根据 您 的喜好推荐
      const playListRes = await getPlaylist()
      if (playListRes.status === 200) {
        setPlayList(playListRes.data.data)
        setLoading(false)
      }
      //火热音乐推荐
      const tjImageListRes = await getPlaylist({ page: 2 })
      if (tjImageListRes.status === 200) {
        setMusicListLoading(false)
        setTjImageList(tjImageListRes.data.data)
      }
    } catch (e) {
      console.log('歌单接口请求失败：', e)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  //获取轮播图
  const swiperImage = import.meta.glob('@renderer/assets/image/swiper-*.jpg', { eager: true })
  const swiperList = Object.values(swiperImage).map((item, index) => ({
    id: index,
    img: (item as { default: string }).default
  }))

  const musicClick = (item: unknown): void => {
    navigate('/ContentDetails', { state: { item } })
  }

  return (
    <div className={'w-full h-full'}>
      <div className={'w-full h-[200px] overflow-hidden rounded-lg'}>
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          modules={[Pagination, Autoplay]}
          pagination={{
            clickable: true,
            renderBullet: (_index, className) => {
              return `<span class="${className}" style="background-color: white;"></span>`
            }
          }}
          autoplay={{
            delay: 5000, // 自动切换的时间间隔，单位：毫秒
            disableOnInteraction: false // 禁止用户交互时暂停自动播放
          }}
        >
          {swiperList.map((item) => {
            return (
              <SwiperSlide key={item.id}>
                <img
                  src={item.img}
                  alt=""
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
      <MusicSwiper
        title={'根据 您 的喜好推荐'}
        list={playList}
        spaceBetween={10}
        slidesPerView={5}
        onClick={musicClick}
        loading={loading}
      />
      <MusicList
        title={'火热音乐推荐'}
        list={tjImageList}
        onClick={musicClick}
        loading={MusicListLoading}
      />
    </div>
  )
}

export default Recommend
