import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import MusicList from '@renderer/components/MusicList'
import { getPlaylist } from '@renderer/Api'
import { ViewMoreProps } from '@renderer/InterFace'
import { useNavigate } from 'react-router-dom'

const ViewMore: React.FC = () => {
  const [tjImageList, setTjImageList] = useState<ViewMoreProps[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [MusicListLoading, setMusicListLoading] = useState(true)
  const navigate = useNavigate()

  const musicClick = (item: unknown): void => {
    navigate('/ContentDetails', { state: { item } })
  }

  const fetchData = async (currentPage = 1): Promise<void> => {
    try {
      const res = await getPlaylist({ page: currentPage, data_index: 25 })
      if (res.status === 200) {
        const newData = res.data.data || []

        // 如果是第一页，直接替换；否则追加
        if (currentPage === 1) {
          setTjImageList(newData)
        } else {
          setTjImageList((prev) => [...prev, ...newData])
        }

        // 是否还有更多数据（根据返回长度判断）
        if (newData.length < 25) {
          setHasMore(false)
        }

        setMusicListLoading(false)
      }
    } catch (error) {
      console.error('推荐歌单接口请求失败:', error)
      setHasMore(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 滚动到底部时调用
  const fetchMoreData = (): void => {
    console.log('123')
    const nextPage = page + 1
    setPage(nextPage)
    fetchData(nextPage)
  }

  return (
    <div
      id="scrollableDiv"
      style={{
        height: '80vh',
        overflow: 'auto'
      }}
    >
      <InfiniteScroll
        dataLength={tjImageList.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<h4 className="text-center text-gray-400 py-4">加载中...</h4>}
        scrollableTarget="scrollableDiv"
        endMessage={<p className="text-center text-gray-500 py-4">没有更多内容了</p>}
        className={'h-[60vh]'}
      >
        <MusicList
          title={'火热音乐推荐'}
          list={tjImageList}
          onClick={musicClick}
          loading={MusicListLoading}
          showViewMore={false}
        />
      </InfiniteScroll>
    </div>
  )
}

export default ViewMore
