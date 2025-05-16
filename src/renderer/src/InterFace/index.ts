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
export interface RootState {
  myLikeMusic: MyLikeMusicList[]
}

// 定义模态框状态
export interface ModalState {
  isOpen: boolean
  content: string
  song?: SongProps
  groupId?: string | number
}
