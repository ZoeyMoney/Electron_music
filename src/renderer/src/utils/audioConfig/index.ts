import { addToast } from '@heroui/react'
import { setAudioState } from '@renderer/store/counterSlice'
import { store } from '@renderer/store/store'

export const audio = new Audio()

// 播放音频
export const playAudio = (
  src: string, // 音频地址
  currentTime?: number, //  开始播放的位置
  onPlay?: () => void, // 播放开始回调
  onEnded?: (error?: Error) => void // 播放结束的回调
): void => {
  //没有src播放地址的时候 提示用户
  if (!src) {
    addToast({
      title: '播放音频地址为空,无法播放',
      color: 'danger',
      timeout: 3000
    })
    return
  }

  // 如果src不同，更新audio.url 并加载
  if (audio.src !== src) {
    audio.pause()
    audio.currentTime = 0
    audio.src = src
    audio.load()
    // 清除上一次的时长
    store.dispatch(setAudioState({ duration: 0 }))
  }
  // 加载完成播放
  const playAudioAfterLoad = (): void => {
    if (typeof currentTime === 'number') {
      audio.currentTime = currentTime //  设置开始播放的位置
    }
    audio
      .play()
      .then(() => {
        //播放成功后同步 duration 到 Redux
        store.dispatch(
          setAudioState({
            isPlaying: true,
            duration: audio.duration || 0
          })
        )
        if (onPlay) onPlay()
      })
      .catch((error) => {
        if (onEnded) onEnded(error)
      })
  }
  // 如果src相同，直接播放
  if (audio.readyState < 2) {
    audio.addEventListener('loadedmetadata', playAudioAfterLoad, { once: true })
  } else {
    playAudioAfterLoad()
  }
}

//暂停音频
export const pauseAudio = (onPause?: () => void): void => {
  audio.pause()
  store.dispatch(setAudioState({ isPlaying: false }))
  onPause?.()
}
// 设置音量0 - 100
export const setVolumeAudio = (volume: number): void => {
  audio.volume = volume / 100
  store.dispatch(setAudioState({ volume }))
}
//设置播放速度 默认正常
export const setPlaybackRateAudio = (playbackRate: number): void => {
  audio.playbackRate = playbackRate || 1
}
//获取当前播放时间
export const getCurrentTimeAudio = (): number => {
  return audio.currentTime
}
//获取音频总时长
export const getDurationAudio = (): number => {
  return audio.duration
}
// 跳转播放进度
export const setCurrentTimeAudio = (currentTime: number): void => {
  audio.currentTime = Math.max(0, Math.min(audio.duration || 0, currentTime))
}
// 是否无限循环
export const setLoopAudio = (loop: boolean): void => {
  audio.loop = loop
  store.dispatch(setAudioState({ loop }))
}
//判断是否正在播放
export const isPlayingAudio = (): boolean => {
  return !audio.paused && audio.currentTime > 0 && !audio.ended
}

// 播放进度同步 Redux 状态
audio.ontimeupdate = () => {
  store.dispatch(setAudioState({ currentTime: audio.currentTime }))
}
//监听播放结束
let onEndedCallback: (() => void) | null = null
export const registerOnEnded = (callback: () => void): void => {
  onEndedCallback = callback
}
audio.onended = () => {
  console.log('播放结束')
  store.dispatch(setAudioState({ isPlaying: false, currentTime: 0 }))
  if (onEndedCallback) onEndedCallback()
}
//监听错误
audio.onerror = (e) => {
  console.log('播放错误', e)
}
