import React, { useEffect, useRef } from "react";
import { LiaRandomSolid } from 'react-icons/lia'
import { MdSkipPrevious, MdSkipNext } from 'react-icons/md'
import { IoPauseSharp } from 'react-icons/io5'
import { GrPowerCycle } from 'react-icons/gr'
import { addToast, Slider } from "@heroui/react";
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@renderer/store/store'
import { setAudioState, setHistoryPlayList } from "@renderer/store/counterSlice";
import {
  isPlayingAudio,
  pauseAudio,
  playAudio, registerOnEnded,
  setCurrentTimeAudio, setLoopAudio
} from "@renderer/utils/audioConfig";
import { FaPlay } from 'react-icons/fa'
import { formatTime, menuHandlerMap, useThrottleFn } from "@renderer/utils";

const PlayerSlider: React.FC = () => {
  const classNameIcon = 'hover:text-gray-400'
  const iconSize = 20
  const nextPrive = 30
  const hasMounted = useRef(false) //是否每次启动项目都自动播放
  const dispatch = useDispatch()
  const { audioState, playInfo, menuDataType } = useSelector((state: RootState) => state.counter)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      dispatch(setAudioState({ isPlaying: false }))
      return
    }
    if (playInfo.href) {
      // 暂停之前的音频（避免多个同时播放）
      pauseAudio();
      playAudio(playInfo.href, 0)
      dispatch(setHistoryPlayList(playInfo))
    }
  }, [playInfo.href])
  //监听播放结束回调
  registerOnEnded(() => {
    (menuHandlerMap[menuDataType] || menuHandlerMap['default'])(playInfo.id)
    // console.log('currentPlaylistType:', currentPlaylistType);
    console.log('播放完了，下一首');
  })
  // 拖动进度条
  const handleChange = (value: number | number[]): void => {
    // 如果是数组，取第一个值
    const currentValue = Array.isArray(value) ? value[0] : value;

    setCurrentTimeAudio(currentValue);
    dispatch(setAudioState({ currentTime: currentValue }));
  }
  // 播放/暂停按钮点击
  const handlePlayPause = (): void => {
    if (isPlayingAudio()) {
      pauseAudio()
    } else {
      playAudio(playInfo.href, undefined)
    }
  }

  //下一首 点击后间隔3秒执行一次
  const handleSkipClick = useThrottleFn((direction: 'next' | 'prev') => {
    console.log('点击方向:', direction)

    if (isPlayingAudio()) {
      pauseAudio()
    }

    ;(menuHandlerMap[menuDataType] || menuHandlerMap['default'])(playInfo.id, direction)
  }, 3000) // 节流间隔3秒
  return (
    <div className="flex flex-col justify-evenly py-[9px]">
      <div
        className="grid gap-[6px] justify-center items-center justify-items-center"
        style={{ gridTemplateColumns: '4% 6% 4% 5% 4%' }}
      >
        <div className="cursor-pointer">
          <LiaRandomSolid
            size={iconSize}
            onClick={() => {
              dispatch(setAudioState({ random: !audioState.random }))
              addToast({
                title: `${!audioState.random ? '随机播放开启' : '随机播放关闭'}`,
                timeout: 3000,
                color: !audioState.random ? 'success' : 'default',
              })
            }}
            className={`${classNameIcon} ${!audioState.random ? '' : 'text-[#00c700]'}`}
          />
        </div>
        <div className="cursor-pointer">
          <MdSkipPrevious size={nextPrive} className={classNameIcon} onClick={() => handleSkipClick('prev')} />
        </div>
        <div className="cursor-pointer" onClick={handlePlayPause}>
          {audioState.isPlaying ? (
            <IoPauseSharp size={30} className={classNameIcon} />
          ) : (
            <FaPlay size={20} className={classNameIcon} />
          )}
        </div>
        <div className="cursor-pointer">
          <MdSkipNext size={nextPrive} className={classNameIcon} onClick={() => handleSkipClick('next')} />
        </div>
        <div className="cursor-pointer">
          <GrPowerCycle
            size={iconSize}
            className={`${classNameIcon} ${audioState.loop ? 'text-[#00c700]' : ''}`}
            onClick={() => {
              const newLoop = !audioState.loop
              setLoopAudio(newLoop)
              addToast({
                title: `${audioState.loop ? '单曲循环关闭' : '单曲循环开启'}`,
                timeout: 3000,
                color: audioState.loop ? 'default' : 'success',
              })
            }}
          />
        </div>
      </div>
      <div
        className="grid items-center gap-[19px] text-sm mx-auto w-[70%]"
        style={{ gridTemplateColumns: '10% 80% 10%' }}
      >
        <div>{formatTime(audioState.currentTime)}</div>
        <div>
          <Slider
            className="max-w-md"
            color="danger"
            value={audioState.currentTime}
            onChange={(value) => handleChange(value)}
            defaultValue={1}
            fillOffset={0}
            aria-label="Audio Slider"
            maxValue={audioState.duration || 1}
            minValue={0}
            size="sm"
            step={1}
          />
        </div>
        <div>{formatTime(audioState.duration)}</div>
      </div>
    </div>
  )
}

export default PlayerSlider
