import React, { useEffect, useRef } from "react";
import {
  Card,
  CardFooter,
  Button,
  Listbox,
  ListboxItem,
  Image,
  CardBody, Skeleton, addToast
} from "@heroui/react";
import { FaPlay } from 'react-icons/fa'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import { Swiper as SwiperProps} from 'swiper'
import { SwiperSlide, Swiper } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import { Navigation } from 'swiper/modules'
import { useNavigate } from "react-router-dom";
import { pauseAudio } from "@renderer/utils/audioConfig";
import { useDispatch, useSelector } from "react-redux";
import { setPlayInfo } from "@renderer/store/counterSlice";
import { RootState } from "@renderer/store/store";
import { createSongInfo } from "@renderer/utils";
import { useMusicLibrary, useMusicLibrarySwiper } from '@renderer/components/Hook'

export const ListboxWrapper = ({children}:{children: React.ReactNode}): JSX.Element => (
  <div className="w-full max-w-[260px] border-small px-1rounded-small border-default-200 dark:border-default-100">
    {children}
  </div>
);
const MusicLibrary: React.FC = () => {
  const prevRef = useRef<HTMLSpanElement>(null)
  const nextRef = useRef<HTMLSpanElement>(null)
  const swiperRef = useRef<SwiperProps | null>(null)
  const dispatch = useDispatch()
  const playInfo = useSelector((state: RootState) => state.counter.playInfo)
  // const [yx, setYx] = useState([])
  const navigate = useNavigate()
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
  const { data: yxMusic, isLoading: yxMusicLoading } = useMusicLibrary();
  const { data: yxSwiper, isLoading: yxSwiperLoading } = useMusicLibrarySwiper();

  // swiper 点击事件
  const swiperMusicClick = (item: { url_href: string, pic: string }): void => {
    console.log(item);
    navigate('/ContentDetails', { state: { item } })
  }
  /*点击播放*/
  const playMusic = async (item): Promise<void> => {
    pauseAudio();
    // 清空当前播放信息，进入 loading 状态
    dispatch(
      setPlayInfo({
        ...playInfo,
        loading: true,
        href: '', // 清空 href，防止旧音频播放
      })
    );
    const res = await createSongInfo(item)
    if (res.status === 200) {
      dispatch(
        setPlayInfo({
          music_title: item.music_title,
          artist: item.artist,
          href: res.data.mp3_url, // ✅ 这里触发 useEffect，才播放
          pic: res.data.pic,
          lrc: res.data.lrc,
          loading: false,
          id: item.id
        })
      )
    } else {
      dispatch(setPlayInfo({ ...playInfo, loading: false }));
      addToast({ title: '获取歌曲信息失败', color: 'danger', timeout: 3000 });
    }
  }
  return (
    <div className={'grid gap-[14px]'} style={{ gridTemplateColumns: '60% 40%' }}>
      <div>
        <h1 className={'font-bold mb-5 mt-3'}>游戏专区</h1>
        <div className={'grid gap-[10px]'} style={{ gridTemplateColumns: '50% 50%' }}>
          {/* 乐库 */}
          <Card isFooterBlurred className="w-full h-[250px]">
            <Image
              removeWrapper
              alt="Card example background"
              className="z-0 w-full h-full scale-110 -translate-y-6 object-cover"
              src={
                'https://p1.music.126.net/th-bByd5Zydsc0HjeEH6Gw==/109951169899762817.jpg?param=200y200'
              }
            />
            <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
              <div>
                <p className="text-black text-tiny">游戏认证</p>
                <p className="text-black text-tiny">玩游戏怎能少了激情音乐</p>
              </div>
              <Button
                className="text-tiny"
                color="primary"
                radius="full"
                size="sm"
                onPress={() =>
                  swiperMusicClick({
                    url_href: 'http://www.4c44.com/playlist/yhcwmewtyme/1.html',
                    pic: 'https://p1.music.126.net/th-bByd5Zydsc0HjeEH6Gw==/109951169899762817.jpg?param=200y200'
                  })
                }
              >
                查看
              </Button>
            </CardFooter>
          </Card>
          {/* 游戏 13 首 */}
          {yxMusicLoading ? (
            <Card className="w-full space-y-5 p-4" radius="lg">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="space-y-3" key={index}>
                  <Skeleton className="w-4/5 rounded-lg">
                    <div className="h-3 w-4/5 rounded-lg bg-default-200" />
                  </Skeleton>
                  <Skeleton className="w-2/5 rounded-lg">
                    <div className="h-3 w-2/5 rounded-lg bg-default-300" />
                  </Skeleton>
                </div>
              ))}
            </Card>
          ) : (
            <ListboxWrapper>
              <Listbox aria-label="Actions">
                {yxMusic.slice(0, 4).map((item, index) => (
                  <ListboxItem key={index} textValue={item.artist}>
                    <div className={'grid items-center'} style={{ gridTemplateColumns: '90% 10%' }}>
                      <div>
                        <div className={'text-[14px]'}>{item.artist}</div>
                        <div
                          className={
                            'text-[12px] w-[100px] text-[#aeaeae] w-full overflow-hidden whitespace-nowrap text-ellipsis'
                          }
                        >
                          {item.music_title}
                        </div>
                      </div>
                      <div>
                        <FaPlay
                          size={14}
                          className={'hover:text-gray-400'}
                          onClick={() => playMusic(item)}
                        />
                      </div>
                    </div>
                  </ListboxItem>
                ))}
              </Listbox>
            </ListboxWrapper>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <h1 className={'font-bold mb-5 mt-5'}>游戏模块推荐</h1>
            <div className="flex">
              <span ref={prevRef}>
                <FaAngleLeft className={'cursor-pointer hover:!text-[#b6b2b2]'} />
              </span>
              <span ref={nextRef}>
                <FaAngleRight className={'cursor-pointer hover:!text-[#b6b2b2]'} />
              </span>
            </div>
          </div>
          {/* swiper */}
          <Swiper
            spaceBetween={10}
            slidesPerView={3}
            loop={false}
            modules={[Navigation]}
            navigation={{
              prevEl: prevRef.current ?? null, // 初始时可能为 null，使用 undefined 占位
              nextEl: nextRef.current ?? null
            }}
            onSwiper={(swiper) => {
              // 绑定导航按钮
              swiperRef.current = swiper
            }}
            preventInteractionOnTransition={false}
          >
            <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
              {yxSwiperLoading ? (
                <Card className="w-[200px] space-y-5 p-4" radius="lg">
                  <Skeleton className="rounded-lg">
                    <div className="h-24 rounded-lg bg-default-300" />
                  </Skeleton>
                  <div className="space-y-3">
                    <Skeleton className="w-3/5 rounded-lg">
                      <div className="h-3 w-3/5 rounded-lg bg-default-200" />
                    </Skeleton>
                    <Skeleton className="w-4/5 rounded-lg">
                      <div className="h-3 w-4/5 rounded-lg bg-default-200" />
                    </Skeleton>
                    <Skeleton className="w-2/5 rounded-lg">
                      <div className="h-3 w-2/5 rounded-lg bg-default-300" />
                    </Skeleton>
                  </div>
                </Card>
              ) : (
                yxSwiper.map((item) => {
                  return (
                    <SwiperSlide key={item.id} className={'music-slide-box'}>
                      <Card
                        key={item.id}
                        isPressable
                        shadow="sm"
                        onPress={() => swiperMusicClick(item)}
                      >
                        <CardBody className="overflow-visible p-0 relative buttonsHover">
                          <img
                            src={item.pic}
                            alt=""
                            style={{ borderRadius: '5px', height: '140px' }}
                          />
                        </CardBody>
                        <CardFooter className="text-small justify-between py-[13px] px-[3px]">
                          <b
                            className={
                              'whitespace-nowrap overflow-hidden w-[120px] text-[12px] mx-auto'
                            }
                          >
                            {item.name}
                          </b>
                        </CardFooter>
                      </Card>
                    </SwiperSlide>
                  )
                })
              )}
            </div>
          </Swiper>
        </div>
      </div>
      <div>
        <h1 className={'font-bold mb-2 mt-3 p-1'}>歌友推荐</h1>
        {yxMusicLoading ? (
          <Card className="w-full space-y-5 p-4" radius="lg">
            {Array.from({ length: 9 }).map((_, index) => (
              <div className="space-y-3" key={index}>
                <Skeleton className="w-4/5 rounded-lg">
                  <div className="h-3 w-4/5 rounded-lg bg-default-200" />
                </Skeleton>
                <Skeleton className="w-2/5 rounded-lg">
                  <div className="h-3 w-2/5 rounded-lg bg-default-300" />
                </Skeleton>
              </div>
            ))}
          </Card>
        ) : (
          <ListboxWrapper>
            <Listbox aria-label="Actions">
              {yxMusic.slice(4).map((item, index) => (
                <ListboxItem key={index} textValue={item.artist}>
                  <div className={'grid items-center'} style={{ gridTemplateColumns: '90% 10%' }}>
                    <div>
                      <div className={'text-[14px]'}>{item.artist}</div>
                      <div
                        className={
                          'text-[12px] w-[100px] text-[#aeaeae] overflow-hidden whitespace-nowrap text-ellipsis'
                        }
                      >
                        {item.music_title}
                      </div>
                    </div>
                    <div>
                      <FaPlay
                        size={14}
                        className={'hover:text-gray-400'}
                        onClick={() => playMusic(item)}
                      />
                    </div>
                  </div>
                </ListboxItem>
              ))}
            </Listbox>
          </ListboxWrapper>
        )}
      </div>
    </div>
  )
}

export default MusicLibrary;
