import React, { useEffect, useState } from 'react';
import { MotionList } from '@renderer/components/AnimatedList';
import { getSearch } from '@renderer/Api';
import { SongProps } from '@renderer/InterFace';
import { useLocation } from 'react-router-dom';
import { SongItem } from '@renderer/components/SongItem';
import { Button, Skeleton, Spinner } from '@heroui/react'
import { useDispatch } from 'react-redux';
import { setPlayListMusic } from '@renderer/store/counterSlice';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useThrottleFn } from '@renderer/utils'

const InterMusicTable: React.FC = () => {
  const location = useLocation();
  const [query, setQuery] = useState(location.state?.query || '');
  const [musicList, setMusicList] = useState<SongProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.query && location.state.query !== query) {
      setQuery(location.state.query)
    }
  }, [location.state.query])

// 获取歌单数据
  useEffect(() => {
    if (!query) return
    setLoading(true)
    getSearch({ query, page: 1 }).then((res) => {
      if (res.status === 200) {
        const rawList = res.data.data;
        const listIndex = rawList.map((item: SongProps, index: number) => ({
          ...item,
          index: index + 1,
        }));
        setMusicList(listIndex);
        dispatch(setPlayListMusic(listIndex));
        setCurrentPage(1);
        setHasMore(res.data.has_next);
      }
      setLoading(false);
    });
  }, [query])

  // 加载更多
  const fetchMoreData = useThrottleFn(async () => {
    setIsLoading(true)
    const nextPage = currentPage + 1
    const res = await getSearch({ query: location.state.query, page: nextPage })

    if (res.status === 200) {
      const rawList = res.data.data
      const newList = rawList.map((item: SongProps, index: number) => ({
        ...item,
        index: musicList.length + index + 1,
      }))
      setMusicList((prev) => [...prev, ...newList])
      setCurrentPage(nextPage)
      setHasMore(res.data.has_next)
      setIsLoading(false)
    } else {
      setHasMore(false)
    }
  }, 3000)
 /* const fetchMoreData = async (): Promise<void> => {
    const nextPage = currentPage + 1
    const res = await getSearch({ query: location.state.query, page: nextPage })

    if (res.status === 200) {
      const rawList = res.data.data
      const newList = rawList.map((item: SongProps, index: number) => ({
        ...item,
        index: musicList.length + index + 1,
      }))
      setMusicList((prev) => [...prev, ...newList])
      setCurrentPage(nextPage)
      setHasMore(res.data.has_next)
    } else {
      setHasMore(false)
    }
  }*/

  return (
    <div className="bg-[#1e1e1ead] rounded-[5px]">
      {loading ? (
        <div>
          {Array.from({ length: 5 }, (_, index) => (
            <div
              className="max-w-[300px] w-full flex items-center gap-[10px] mb-[14px]"
              key={index}
            >
              <Skeleton className="flex rounded-[10px] w-12 h-12" />
              <div className="w-full flex flex-col gap-2">
                <Skeleton className="h-3 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <MotionList delay={100}>
            {musicList.map((item) => (
              <SongItem key={item.id} item={item} />
            ))}
          </MotionList>
        </>
      )}
    </div>
  )
};

export default InterMusicTable;
