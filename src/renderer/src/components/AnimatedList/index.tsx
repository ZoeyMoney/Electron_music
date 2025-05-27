import type React from "react"
import { useCallback } from "react"
import { FixedSizeList as List, type ListOnItemsRenderedProps } from "react-window"
import AutoSizer from "react-virtualized-auto-sizer"
import { motion } from "framer-motion"
import { SongProps } from '@renderer/InterFace'
import { SongItem } from "@renderer/components/SongItem"
import { Spinner } from '@heroui/react'

interface MotionListProps {
  data: SongProps[]
  loadMore: () => void //  加载更多的函数
  hasMore: boolean //  是否还有更多
  isLoading?: boolean // 控制是否加载中
  enableInfiniteScroll?: boolean //控制是否无限滚动
  album?: string
  duration?: string
  sourceType: 'playListMusicType' | 'allMusicList' | 'localMusicList' | string | '1'
  showAlbum?: boolean // 是否显示专辑
  showDuration?: boolean // 是否显示时长
}

const SongRowItem = ({
  index,
  style,
  data
}: {
  index: number
  style: React.CSSProperties
  data:
    | {
        data: SongProps[]
        sourceType: 'playListMusicType' | 'allMusicList' | 'localMusicList' | string | '1'
      }
    | any
}): React.ReactElement => {
  const { data: songs, sourceType, showAlbum, showDuration } = data

  if (index >= songs.length) {
    return (
      <div
        style={style}
        className="flex justify-center items-center text-white text-sm animate-pulse"
      >
        <Spinner color="success" label="加载中..." labelColor="success" />
      </div>
    )
  }

  const item = songs[index]

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SongItem
        item={item}
        album={item.album}
        duration={item.duration}
        sourceType={sourceType}
        showAlbum={showAlbum}
        showDuration={showDuration}
      />
    </motion.div>
  )
}

const AnimatedList: React.FC<MotionListProps> = ({
  data,
  loadMore,
  hasMore,
  isLoading,
  enableInfiniteScroll = true,
  sourceType,
  showAlbum = false,
  showDuration = false
}) => {
  const handleItemsRendered = useCallback(
    ({ visibleStopIndex }: ListOnItemsRenderedProps) => {
      if (
        enableInfiniteScroll && // 只有开启无限滚动才触发
        hasMore &&
        visibleStopIndex >= data.length - 5
      ) {
        loadMore()
      }
    },
    [data.length, hasMore, loadMore, enableInfiniteScroll]
  )

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          itemCount={data.length + (hasMore && isLoading ? 1 : 0)}
          itemSize={80}
          itemData={{ data, sourceType, showAlbum, showDuration }}
          onItemsRendered={handleItemsRendered}
        >
          {SongRowItem}
        </List>
      )}
    </AutoSizer>
  )
}

export default AnimatedList
