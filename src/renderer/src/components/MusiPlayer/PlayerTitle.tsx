import React, { useRef } from "react"
import { Drawer, DrawerBody, DrawerContent, Image, useDisclosure } from "@heroui/react";
import icons from '@renderer/assets/image/wei-1.jpg'
import Lottie, { LottieRefCurrentProps } from "lottie-react"
import upIcons from '@renderer/assets/lottie/upIcons.json'
import { FaAngleDown } from 'react-icons/fa'

const PlayerTitle: React.FC = () => {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null)
  const {isOpen, onOpen, onClose} = useDisclosure();

  // 抽屉点击事件
  const handleDrawerClick = (): void =>{
    if (isOpen) {
      onClose(); // 如果已打开，则关闭
    } else {
      onOpen(); // 如果已关闭，则打开
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
                    <Image isBlurred alt="HeroUI Album Cover" src={icons} width={250} />
                  </div>
                  <div>
                    <div className={'mt-[10vh] text-center'}>
                      <h1>标题</h1>
                      <p className={'text-[#7a7a7a] text-[14px] mt-[10px]'}>歌手</p>
                    </div>
                    <div className={'flex justify-center mt-[50px]'}>
                      1231231231231231231231231231
                    </div>
                  </div>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
      <div className={'grid h-[80px] items-center'} style={{ gridTemplateColumns: '25% 75%' }}>
        <div className={'relative group'}>
          <Image isBlurred alt="Up" src={icons} width={80} />
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
          <h1 className={'text-[14px] w-[150px] overflow-hidden text-ellipsis'}>这是标题</h1>
          <h1 className={'text-[12px] text-[#b3b3b3]'}>这是歌手</h1>
        </div>
      </div>
    </div>
  )
}

export default PlayerTitle
