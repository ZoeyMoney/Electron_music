import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import MusicSwiper from '@renderer/components/MusicSwiper'
import MusicList from '@renderer/components/MusicList'
import { useNavigate } from 'react-router-dom'
import { usePlaylist } from '@renderer/components/Hook'

const Recommend: React.FC = () => {
  const navigate = useNavigate()
  const { data: page1Data, isLoading: loading1 } = usePlaylist(1, 10)
  const { data: page2Data, isLoading: loading2 } = usePlaylist(2, 10)
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
        list={page1Data ?? []}
        spaceBetween={10}
        slidesPerView={5}
        onClick={musicClick}
        loading={loading1}
      />
      <MusicList
        title={'火热音乐推荐'}
        list={page2Data ?? []}
        onClick={musicClick}
        loading={loading2}
      />
    </div>
  )
}

export default Recommend
