import React, { useEffect, useRef, useState } from 'react'
import { Drawer, DrawerBody, DrawerContent, Image, Skeleton, useDisclosure } from '@heroui/react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'
import upIcons from '@renderer/assets/lottie/upIcons.json'
import { FaAngleDown } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/store/store'
import { parseLyrics } from '@renderer/utils'

const LINE_HEIGHT = 30 // 每行歌词高度(px)

const PlayerTitle: React.FC = () => {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { playInfo, audioState } = useSelector((state: RootState) => state.counter)

  const lyrics = parseLyrics(playInfo.lrc)
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // 根据 currentTime 找到当前歌词索引
  useEffect(() => {
    const idx = lyrics.findIndex((line, i) => {
      const nextTime = lyrics[i + 1]?.time ?? Infinity
      return audioState.currentTime >= line.time && audioState.currentTime < nextTime
    })
    if (idx !== -1 && idx !== currentIndex) {
      setCurrentIndex(idx)
    }
  }, [audioState.currentTime, lyrics, currentIndex])

  // 滚动歌词，使当前句居中显示
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // 计算滚动位置：当前行索引 * 行高 - (容器高度 / 2 - 行高 / 2)
    const scrollTop = currentIndex * LINE_HEIGHT - (container.clientHeight / 2 - LINE_HEIGHT / 2)
    container.scrollTo({ top: scrollTop, behavior: 'smooth' })
  }, [currentIndex])
  // 抽屉点击事件
  const handleDrawerClick = (): void => {
    if (isOpen) {
      onClose() // 如果已打开，则关闭
    } else {
      onOpen() // 如果已关闭，则打开
    }
  }
  return (
    <div>
      <Drawer
        isOpen={isOpen}
        isDismissable={false}
        placement={'bottom'}
        size={'full'}
        closeButton={
          <div className={'app-no-drag -mx-2'}>
            <FaAngleDown size={20} />
          </div>
        }
        onOpenChange={handleDrawerClick}
        isKeyboardDismissDisabled={true}
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerBody>
                <div className={'grid grid-cols-2 app-drag w-[95%] mx-auto'}>
                  <div className={'flex justify-center items-center h-[calc(100vh-80px)]'}>
                    <Image isBlurred alt="HeroUI Album Cover" src={playInfo.pic} width={250} />
                  </div>
                  <div>
                    <div className={'mt-[10vh] text-center'}>
                      <h1>{playInfo.music_title}</h1>
                      <p className={'text-[#7a7a7a] text-[14px] mt-[10px]'}>{playInfo.artist}</p>
                    </div>
                    <div className={'flex justify-center mt-[23px]'}>
                      <div
                        ref={containerRef}
                        style={{
                          height: '60vh',
                          overflowY: 'hidden',
                          color: '#aaa',
                          fontSize: 16,
                          lineHeight: `${LINE_HEIGHT}px`,
                          textAlign: 'center',
                          userSelect: 'none',
                          position: 'relative'
                        }}
                      >
                        {/* 全部歌词 */}
                        {lyrics.length === 0 ? (
                          <p style={{ height: LINE_HEIGHT, margin: 0, color: '#aaa' }}>无歌词</p>
                        ) : (
                          lyrics.map((line, i) => {
                            const isCurrent = i === currentIndex
                            const displayText = (line.text ?? '').trim() || '无歌词'

                            return (
                              <p
                                key={i}
                                style={{
                                  height: LINE_HEIGHT,
                                  margin: 0,
                                  color: isCurrent ? 'red' : '#aaa',
                                  fontWeight: isCurrent ? 'bold' : 'normal',
                                  fontSize: isCurrent ? 18 : 16,
                                  transition: 'color 0.3s, font-size 0.3s'
                                }}
                              >
                                {displayText}
                              </p>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
      {playInfo.loading ? (
        <div className="max-w-[300px] w-full flex items-center gap-3 h-[80px]">
          <div>
            <Skeleton className="h-[52px] w-[52px] flex rounded-[13px] w-12 h-12" />
          </div>
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-3 w-3/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
        </div>
      ) : (
        <div className={'grid h-[80px] items-center'} style={{ gridTemplateColumns: '25% 75%' }}>
          <div className={'relative group'}>
            <Image isBlurred alt="Up" src={playInfo.pic} width={80} loading={'eager'} />
            <div
              className={
                'absolute top-0 w-full h-full z-[10] rounded-[13px] bg-black/50 \n' +
                'opacity-0 group-hover:opacity-100 transition-all duration-100 ease-linear hover:cursor-pointer'
              }
              onMouseEnter={() => {
                lottieRef.current?.play()
                lottieRef.current?.setSpeed(2) // 设置播放速度
              }}
              onMouseLeave={() => lottieRef.current?.stop()}
              onClick={handleDrawerClick}
            >
              <div className={'flex flex-col justify-center items-center h-full'}>
                <Lottie
                  lottieRef={lottieRef}
                  animationData={upIcons}
                  loop={true}
                  autoplay={false}
                  className={`${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
          </div>
          <div className={'px-3 flex flex-col justify-evenly h-[80px]'}>
            <h1 className={'text-[14px] w-[150px] overflow-hidden text-ellipsis whitespace-nowrap'}>
              {playInfo.music_title}
            </h1>
            <h1 className={'text-[12px] text-[#b3b3b3]'}>{playInfo.artist}</h1>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlayerTitle
