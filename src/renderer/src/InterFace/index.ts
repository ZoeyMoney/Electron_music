interface menuListProps {
  icon?: JSX.Element
  label?: string
  name?: string
}
export interface menuDataProps {
  title: string
  icon?: JSX.Element
  list: menuListProps[]
}


//推荐音乐列表
export interface ViewMoreProps {
  url_href: string
  name: string
  pic: string
}

//仓库
export interface SongProps {
  index?: number
  music_title: string
  artist?: string
  href: string
  uuid?: string
  music_author?: string
  lrc?: string
  pic?: string
  mp3_url?: string
}
export interface MyLikeMusicList {
  id: number | string
  name: string
  index?: number
  songs: SongProps[]
}

// 定义模态框状态
export interface ModalState {
  isOpen: boolean
  content: string
  song?: SongProps
  groupId?: string | number
}
export interface RootState {
  myLikeMusic: MyLikeMusicList[]
  audioState: PlayerState
  playInfo: PlayInfo
  playListMusic: PlayListProps[]
}

//播放歌单
export interface PlayListProps {
  artist: string
  href: string
  music_title: string
}

// 播放器状态
export interface PlayerState {
  volume: number // 音量0-100
  currentTime: number // 当前播放时间 秒
  loop: boolean // 循环播放
  random: boolean // 随机播放
  playbackRate: number // 播放速度
  duration: number //总时长
  isPlaying: boolean // 播放状态
}

// 播放信息
export interface PlayInfo {
  music_title: string
  artist: string
  href: string
  pic: string
  lrc: string
  loading: boolean
}
