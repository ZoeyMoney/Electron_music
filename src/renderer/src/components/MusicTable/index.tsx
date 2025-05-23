import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import ContextMenuProvider, { ContextMenuItem } from '@renderer/components/ContextMenuProvider'
import {
  addToast,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from "@heroui/react";
import HskeletonCard from '@renderer/components/SkeletonCard/HskeletonCard'
import LikeButton from '@renderer/components/LikeButton'
import { useContextMenuTrigger } from '@renderer/components/ContextMenuProvider/useContextMenuTrigger'
import { useDispatch, useSelector } from "react-redux";
import { setMenuDataType, setMyLikeMusicList, setPlayInfo } from '@renderer/store/counterSlice'
import { ModalWrapper } from '@renderer/components/ModalWrapper'
import { MyLikeMusicList, SongProps, ModalState } from '@renderer/InterFace'
import InfiniteScroll from "react-infinite-scroll-component";
import { createSongInfo } from "@renderer/utils";
import { RootState } from "@renderer/store/store";
import { pauseAudio } from "@renderer/utils/audioConfig";

interface MusicTableProps {
  menuItems: ContextMenuItem[] // 右键菜单
  columns: {
    name: string
    uid: string
    width?: string
  }[] // 表格列
  loading: boolean // 是否加载中
  musicList: SongProps[] // 歌曲列表
  myLikeMusic: MyLikeMusicList[] // 我的喜欢列表
  modalState: ModalState
  onModalClose: () => void // 关闭模态框
  fetchMoreData?: () => Promise<void> // 加载更多数据
  hasMore?: boolean // 是否有更多数据
  scrollClassName?: string // 滚动容器的类名
}

interface MusicTableHandle {
  handleToggleLike: (
    song: SongProps,
    groupId?: string | number,
    forceAdd?: boolean
  ) => Promise<void>
}

const MusicTable = forwardRef<MusicTableHandle, MusicTableProps>(
  (
    {
      menuItems,
      columns,
      loading,
      musicList,
      myLikeMusic,
      modalState,
      onModalClose,
      fetchMoreData,
      hasMore,
      scrollClassName
    },
    ref
  ) => {
    const { handleContextMenu, hideAll } = useContextMenuTrigger()
    const dispatch = useDispatch()
    const playInfo = useSelector((state: RootState) => state.counter.playInfo)
    const [linId, setLinId] = useState('')
    // 自动更新href
    useEffect(() => {
      setLinId(playInfo.id)
    }, [playInfo.id])
    // 检查歌曲是否已点赞
    const isLiked = useMemo(
      () =>
        (href: string): boolean => {
          const favoriteGroup = myLikeMusic.find((group) => group.id === 1)
          return favoriteGroup ? favoriteGroup.songs.some((song) => song.href === href) : false
        },
      [myLikeMusic]
    )
    // 点赞和取消点赞
    const handleToggleLike = async (
      song: SongProps,
      groupId: string | number = 1,
      forceAdd: boolean = false
    ): Promise<void> => {
      const alreadyLiked = isLiked(song.href)
      if (alreadyLiked && !forceAdd) {
        // 取消点赞
        dispatch(
          setMyLikeMusicList({
            type: 'remove',
            id: groupId,
            song
          })
        )
      } else {
        // 添加到歌单
        // const musicInfo = await createSongInfo(song)
        dispatch(
          setMyLikeMusicList({
            type: 'add',
            id: groupId,
            song
          })
        )
      }
    }
    // 用 useImperativeHandle 把 handleToggleLike 通过 ref 暴露出去
    useImperativeHandle(ref, () => ({
      handleToggleLike
    }))
    //双击播放
    const handleDoubleClick = async (song: SongProps): Promise<void> => {
      setLinId(song.id ?? '') //设置高亮的值
      pauseAudio();
      // 清空当前播放信息，进入 loading 状态
      dispatch(
        setPlayInfo({
          ...playInfo,
          loading: true,
          href: '', // 清空 href，防止旧音频播放
        })
      );

      try {
        const res = await createSongInfo(song);
        if (res?.status === 200 && res.data) {
          console.log('res.data', song);
          dispatch(
            setPlayInfo({
              music_title: song.music_title,
              artist: song.artist,
              href: res.data.mp3_url, // ✅ 这里触发 useEffect，才播放
              pic: res.data.pic,
              lrc: res.data.lrc,
              loading: false,
              id: song.id
            })
          );
          dispatch(setMenuDataType('playListMusicType'))
        } else {
          dispatch(setPlayInfo({ ...playInfo, loading: false }));
          addToast({ title: '获取歌曲信息失败', color: 'danger', timeout: 3000 });
        }
      } catch (error) {
        console.error('获取歌曲失败：', error);
        dispatch(setPlayInfo({ ...playInfo, loading: false }));
        addToast({ title: '请求异常，请稍后再试', color: 'danger', timeout: 3000 });
      }
    }
    return (
      <div>
        <ModalWrapper
          title={'已添加'}
          isOpen={modalState.isOpen}
          onClose={onModalClose}
          onAction={() => {
            if (modalState.song && modalState.groupId) {
              handleToggleLike(modalState.song, modalState.groupId, true)
            }
          }}
          actionText={'仍然添加'}
          buttonCloseText={'请勿添加'}
        >
          <p>{modalState.content}</p>
        </ModalWrapper>
        <div
          id="scrollableDiv"
          style={{
            height: `${scrollClassName || '80vh'}`,
            overflow: 'auto'
          }}
        >
          <ContextMenuProvider items={menuItems} />
          <InfiniteScroll
            dataLength={musicList.length}
            next={fetchMoreData || (() => Promise.resolve())}
            hasMore={hasMore || false}
            loader={
              <h4 className="text-center text-gray-400 py-4">
                <Spinner color="success" />
              </h4>
            }
            endMessage={<p className="text-center text-gray-500 py-4">没有更多内容了</p>}
            scrollableTarget="scrollableDiv"
          >
            <Table
              aria-label="音乐列表"
              className={'mt-3 h-full'}
              color={'secondary'}
              isHeaderSticky
              selectionMode="single"
              onClick={() => hideAll()}
            >
              <TableHeader>
                {columns.map((column) => (
                  <TableColumn key={column.uid} className={column.width}>
                    {column.name}
                  </TableColumn>
                ))}
              </TableHeader>
              <TableBody emptyContent={'没有任何数据源'}>
                {loading ? (
                  <TableRow key="index">
                    {columns.map((_, index) => (
                      <TableCell key={index}>
                        <HskeletonCard loading={true}>Placeholder</HskeletonCard>
                      </TableCell>
                    ))}
                  </TableRow>
                ) : (
                  musicList.map((item) => (
                    <TableRow
                      key={item.href}
                      onContextMenu={handleContextMenu(item)}
                      onDoubleClick={() => handleDoubleClick(item)}
                      className={item.id === linId ? 'bg-danger-100' : ''} // 高亮当前播放歌曲
                    >
                      <TableCell>{item.index}</TableCell>
                      <TableCell>
                        <div className={'w-[300px] overflow-hidden whitespace-nowrap'}>
                          {item.music_title}
                        </div>
                      </TableCell>
                      <TableCell>{item.artist}</TableCell>
                      <TableCell>
                        <LikeButton
                          liked={isLiked(item.href)}
                          onToggle={() => handleToggleLike(item)}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </InfiniteScroll>
        </div>
      </div>
    )
  }
)
MusicTable.displayName = 'MusicTable'
export default MusicTable
