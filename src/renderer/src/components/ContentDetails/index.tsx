import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Button,
  Image,
} from '@heroui/react'
import { FaPlay } from 'react-icons/fa6'
import { getPlayListDetail } from "@renderer/Api";
import { v4 as uuidv4 } from 'uuid'
import { RootState } from '@renderer/store/store'
import { useDispatch, useSelector } from "react-redux";
import { columns, extractColors } from "@renderer/utils";
import { ContextMenuItem } from '@renderer/components/ContextMenuProvider'
import MusicTable from '@renderer/components/MusicTable'
import { ModalState, MyLikeMusicList, SongProps } from '@renderer/InterFace'
import { setPlayListMusic } from "@renderer/store/counterSlice";

const ContentDetails: React.FC = () => {
  const location = useLocation()
  const imgRef = useRef<HTMLImageElement>(null)
  const [musicList, setMusicList] = useState<SongProps[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [colors, setColors] = useState<string[]>([])
  const myLikeMusic = useSelector((state: RootState) => state.counter.myLikeMusic)
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, content: '' });
  const musicTableRef = useRef<{
    handleToggleLike: (song: SongProps, groupId?: string | number, forceAdd?: boolean) => Promise<void>
  }>(null)
  const dispatch = useDispatch()
  // 颜色提取
  const handleImageLoad = async (): Promise<void> => {
    if (imgRef.current) {
      try {
        const hexColors = await extractColors(imgRef.current)
        setColors(hexColors)
      } catch (e) {
        console.error('提取颜色失败:', e)
      }
    }
  }

  // 获取歌单数据
  useEffect(() => {
    console.log('ContentDetails', location.state.item.url_href);
    getPlayListDetail({ url: location.state.item.url_href }).then((res) => {
      if (res.status === 200) {
        setLoading(false)
        const rawList = res.data.data.music_list
        const listIndex = rawList.map((item: SongProps, index: number) => ({
          ...item,
          index: index + 1,
          uuid: uuidv4(),
        }))
        setMusicList(listIndex)
        dispatch(setPlayListMusic(listIndex))
      }
    })
  }, [location.state.item.url_href])


  // 右键菜单内容
  const menuItems: ContextMenuItem[] = [
    {
      label: '添加歌单',
      children: myLikeMusic.map((group: MyLikeMusicList) => ({
        label: group.name,
        onClick: ({ props }) => {
          const song: SongProps = props
          const groupSongs = group.songs || []
          const alreadyExists = groupSongs.some((s) => s.href === song.href)
          if (alreadyExists) {
            setModalState({
              isOpen: true,
              content: `该歌曲已存在于「${group.name}」歌单中`,
              song,
              groupId: group.id,
            })
            return
          }
          musicTableRef.current?.handleToggleLike(song, group.id, true)
        },
      })),
    },
    { label: '-' },
  ]
  return (
    <div
      className={'rounded-[5px] overflow-hidden'}
      style={{
        background: `linear-gradient(to bottom, ${colors[0] || '#000'}, ${colors[1] || '#000'})`
      }}
    >
      <div className={'grid grid-cols-[30%_70%] gap-5 m-2.5 w-[600px]'}>
        <div>
          <Image
            isBlurred
            alt="HeroUI Album Cover"
            src={location.state.item.pic || ''}
            width={240}
            onLoad={handleImageLoad}
            ref={imgRef}
          />
        </div>
        <div className={'flex flex-col justify-evenly'}>
          <div className={'text-[13px]'}>公开歌单</div>
          <div className={'text-[20px]'}>{location.state.item.name}</div>
          <div className={'text-[13px]'}>更多曲风</div>
          <div className={'text-[13px]'}>为 用户 打造 · 50首歌曲</div>
        </div>
      </div>
      <div
        className={'p-2.5'}
        style={{ background: 'linear-gradient(0deg, black 83%, transparent 96%)' }}
      >
        <Button isIconOnly radius="full" color="danger">
          <FaPlay color={'white'} />
        </Button>
        {/* 音乐列表 */}
        <MusicTable
          menuItems={menuItems}
          columns={columns}
          loading={loading}
          musicList={musicList}
          myLikeMusic={myLikeMusic}
          modalState={modalState}
          ref={musicTableRef}
          onModalClose={() => setModalState({ isOpen: false, content: '' })}
        />
      </div>
    </div>
  )
}

export default ContentDetails
