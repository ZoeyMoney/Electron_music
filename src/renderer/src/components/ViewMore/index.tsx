import React, { useRef } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import MusicList from '@renderer/components/MusicList'
import { useNavigate } from 'react-router-dom'
import { useInfinitePlaylist } from '@renderer/components/Hook'

const ViewMore: React.FC = () => {
  const navigate = useNavigate()
  const scrollableDivRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePlaylist(25)

  const musicList = data?.pages.flat() || []

  const fetchMoreData = (): void => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const musicClick = (item: { url_href: string; name: string; pic: string }): void => {
    navigate('/ContentDetails', { state: { item } })
  }

  if (isLoading) {
    // 首次加载，显示骨架屏
    return (
      <div
        id="scrollableDiv"
        ref={scrollableDivRef}
        style={{ height: '80vh', overflow: 'auto' }}
      >
        <MusicList
          title="火热音乐推荐"
          list={[]}
          onClick={musicClick}
          loading={true} // 只传递首次加载状态
          showViewMore={false}
        />
      </div>
    )
  }

  return (
    <div
      id="scrollableDiv"
      ref={scrollableDivRef}
      style={{ height: '80vh', overflow: 'auto' }}
    >
      <InfiniteScroll
        dataLength={musicList.length}
        next={fetchMoreData}
        hasMore={!!hasNextPage}
        loader={<h4 className="text-center text-gray-400 py-4">加载中...</h4>}
        scrollableTarget="scrollableDiv"
        endMessage={<p className="text-center text-gray-500 py-4">没有更多内容了</p>}
        className="h-[60vh]"
      >
        <MusicList
          title="火热音乐推荐"
          list={musicList}
          onClick={musicClick}
          loading={false} // 加载更多时不显示骨架屏
          showViewMore={false}
        />
      </InfiniteScroll>
    </div>
  )
}

export default ViewMore
