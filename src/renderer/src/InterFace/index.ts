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
  id?: string
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
  id?: string
  duration?: string
  album?: string
  date?: string
}
export interface MyLikeMusicList {
  id: number | string
  name: string
  index?: number
  key: string
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
  //歌单类型  搜索推荐  本地    收藏   或者  自定义
  menuDataType: 'playListMusicType' | 'allMusicList' | 'localMusicList' | string | '1'
  //历史播放
  historyPlayList: SongProps[]
  //本地音乐
  localMusicList: LocalMusicInfo[]
  //排序问题
  sort: 'asc' | 'desc'
}

//播放歌单
export interface PlayListProps {
  artist: string
  href: string
  music_title: string
  id: string
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
  pic?: string
  lrc: string
  loading?: boolean
  id: string
}
//本地音乐
export interface LocalMusicInfo extends PlayInfo {
  date: string
  duration: string
  localPath: boolean
}

//设置页
export interface SettingDataProps {
  title: string
  data: {
    label: string
    component: JSX.Element
  }[]
}

//右键菜单
export interface MenuItemProps {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  children?: MenuItemProps[]
  onClick?: () => void
  danger?: boolean
  className?: string
}
//右键菜单那封装
export interface UseDropdownMenuProps {
  initialMenuType?: string
}
