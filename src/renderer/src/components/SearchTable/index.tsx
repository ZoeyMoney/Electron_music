import React, { useEffect, useRef, useState } from "react";
import MusicTable from "@renderer/components/MusicTable";
import { ContextMenuItem } from "@renderer/components/ContextMenuProvider";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@renderer/store/store";
import { ModalState, MyLikeMusicList, SongProps } from "@renderer/InterFace";
import { columns } from "@renderer/utils";
import { getSearch } from "@renderer/Api";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { setPlayListMusic } from "@renderer/store/counterSlice";

const SearchTable: React.FC = () => {
  const myLikeMusic = useSelector((state: RootState) => state.counter.myLikeMusic)
  const [loading, setLoading] = useState<boolean>(true)
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, content: '' });
  const musicTableRef = useRef<{
    handleToggleLike: (song: SongProps, groupId?: string | number, forceAdd?: boolean) => Promise<void>
  }>(null)
  const location = useLocation()
  const [musicList, setMusicList] = useState<SongProps[]>([])
  const [query, setQuery] = useState(location.state?.query || '')
  const [currentPage, setCurrentPage] = useState(1) // 当前页数
  const [hasMore, setHasMore] = useState(true) // 是否还有更多数据可加载
  const dispatch = useDispatch()
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
  useEffect(() => {
    if (location.state?.query && location.state.query !== query) {
      setQuery(location.state.query)
    }
  }, [location.state.query])
  // 获取歌单数据
  useEffect(() => {
    if (!query) return
    setLoading(true)
    getSearch({ query }).then((res) => {
      if (res.status === 200) {
        const rawList = res.data.data
        const listIndex = rawList.map((item: SongProps, index: number) => ({
          ...item,
          index: index + 1,
          uuid: uuidv4(),
        }))
        setMusicList(listIndex)
        dispatch(setPlayListMusic(listIndex))
      }
      setLoading(false)
    })
  }, [query])

  //滚动目标
  const fetchMoreData = async (): Promise<void> => {
    const nextPage = currentPage + 1
    const res = await getSearch({ query: location.state.query, page: nextPage })
    setHasMore(res.data.has_next)
    console.log(res);
    if (res.status === 200) {
      const rawList = res.data.data
      const newList = rawList.map((item: SongProps, index: number) => ({
        ...item,
        index: musicList.length + index + 1,
        uuid: uuidv4(),
      }))
      setMusicList((prev) => [...prev, ...newList])
      setCurrentPage(nextPage)
    } else {
      setHasMore(false)
    }
  }
  return (
    <MusicTable
      menuItems={menuItems}
      columns={columns}
      loading={loading}
      musicList={musicList}
      myLikeMusic={myLikeMusic}
      modalState={modalState}
      ref={musicTableRef}
      onModalClose={() => setModalState({ isOpen: false, content: '' })}
      fetchMoreData={fetchMoreData}
      hasMore={hasMore}
    />
  );
};

export default SearchTable;
