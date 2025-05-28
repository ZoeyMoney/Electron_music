import React, { useEffect, useState } from 'react';
import AnimatedList from '@renderer/components/AnimatedList';
import { SongProps } from '@renderer/InterFace';
import { useLocation } from 'react-router-dom';
import { Skeleton } from '@heroui/react';
import { useDispatch } from 'react-redux';
import { setPlayListMusic } from '@renderer/store/counterSlice';
import { useThrottleFn } from '@renderer/utils'
import { useSearch } from '@renderer/components/Hook'

const InterMusicTable: React.FC = () => {
  const location = useLocation();
  const [query, setQuery] = useState(location.state?.query || '');
  const dispatch = useDispatch();
  // const [isLoading, setIsLoading] = useState(false);
  // 1. 同步 query
  useEffect(() => {
    if (location.state?.query && location.state.query !== query) {
      setQuery(location.state.query);
    }
  }, [location.state?.query]);

  // 2. 使用 react-query 的分页 hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isStale,
  } = useSearch(query);

  // 3. 打平数据并计算 index
  const flatMusicList: SongProps[] = data?.pages?.flatMap(page => page.list ?? []) ?? [];

  // 4. 同步播放列表
  useEffect(() => {
    if (flatMusicList.length > 0) {
      dispatch(setPlayListMusic(flatMusicList));
    }
  }, [flatMusicList, dispatch]);

  const throttledFetchNextPage = useThrottleFn(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, 3000);
  // 5. 缓存过期自动刷新
  useEffect(() => {
    if (query && isStale) {
      refetch();
    }
  }, [query, isStale, refetch]);

  return (
    <div className="bg-[#1e1e1ead] rounded-[5px]">
      {isLoading ? (
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
        <div style={{ height: '75vh' }}>
          <AnimatedList
            data={flatMusicList}
            loadMore={throttledFetchNextPage}
            hasMore={hasNextPage || false}
            isLoading={isFetchingNextPage}
            sourceType={'playListMusicType'}
          />
        </div>
      )}
    </div>
  );
};

export default InterMusicTable;
