import React, { useEffect, useRef } from 'react'
// import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperProps } from 'swiper'
import { SwiperSlide, Swiper } from 'swiper/react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { Card, CardBody, CardFooter } from '@heroui/card'
import SkeletonCard from '@renderer/components/SkeletonCard'

interface MusicSwiperProps {
  title: string
  list: Array<{ url_href: string; name: string; pic: string }>
  className?: string
  onClick?: (item: { url_href: string; name: string; pic: string }) => void
  spaceBetween: number
  slidesPerView: number
  loading: boolean
}

const MusicSwiper: React.FC<MusicSwiperProps> = ({
  title,
  list,
  slidesPerView,
  className,
  spaceBetween,
  onClick,
  loading
}) => {
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const swiperRef = useRef<SwiperProps | null>(null)
  useEffect(() => {
    if (swiperRef.current && prevRef.current && nextRef.current) {
      const swiper = swiperRef.current
      if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
        swiper.params.navigation.prevEl = prevRef.current
        swiper.params.navigation.nextEl = nextRef.current
        swiper.navigation.init()
        swiper.navigation.update()
      }
    }
  }, [swiperRef.current, prevRef.current, nextRef.current]) // 依赖 Swiper 和 refs
  return (
    <div className={`relative mt-[20px] group mb-[20px] ${className}`}>
      <h1 className={'pb-4'}>{title}</h1>
      <Swiper
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        loop={false}
        modules={[Navigation]}
        navigation={{
          prevEl: prevRef.current ?? null,
          nextEl: nextRef.current ?? null
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        preventInteractionOnTransition={false}
      >
        <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
          {loading
            ? Array.from({ length: slidesPerView }).map((_, idx) => (
                <SwiperSlide key={idx} className="music-slide-box">
                  <SkeletonCard loading={true}>
                    <div className="w-[140px] h-[184px] bg-gray-200 rounded animate-pulse" />
                  </SkeletonCard>
                </SwiperSlide>
              ))
            : list.map((item) => (
                <SwiperSlide key={item.name} className="w-[140px] h-[184px]">
                  <SkeletonCard loading={false}>
                    <Card
                      className={'w-[140px] h-[184px]'}
                      key={item.name}
                      isPressable
                      shadow="sm"
                      onPress={() =>
                        onClick &&
                        onClick({
                          name: item.name,
                          pic: item.pic,
                          url_href: item.url_href
                        })
                      }
                    >
                      <CardBody className="overflow-visible p-0 relative buttonsHover">
                        <img
                          src={item.pic}
                          alt=""
                          style={{ borderRadius: '5px', height: '140px' }}
                        />
                      </CardBody>
                      <CardFooter className="text-small justify-between py-[13px] px-[3px]">
                        <b className={'whitespace-nowrap overflow-hidden w-[120px] text-[12px] mx-auto'}>
                          {item.name}
                        </b>
                      </CardFooter>
                    </Card>
                  </SkeletonCard>
                </SwiperSlide>
              ))}
        </div>
      </Swiper>
      <div className="absolute top-[50%] left-0 z-10 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="w-[95%] flex justify-between mx-auto my-0">
          <button
            ref={prevRef}
            className="w-[29px] h-[30px] bg-[#494848] rounded-[50%] flex justify-center items-center z-20 pointer-events-auto transition-all duration-200 ease-linear hover:bg-[#f31260]"
          >
            <FaAngleLeft size={20} />
          </button>
          <button
            ref={nextRef}
            className="w-[29px] h-[30px] bg-[#494848] rounded-[50%] flex justify-center items-center z-20 pointer-events-auto transition-all duration-200 ease-linear hover:bg-[#f31260]"
          >
            <FaAngleRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MusicSwiper
