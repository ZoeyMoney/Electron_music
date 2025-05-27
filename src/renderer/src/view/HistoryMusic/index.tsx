import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/store/store'
import AnimatedList from '@renderer/components/AnimatedList'
const HistoryMusic: React.FC = () => {
  const { historyPlayList } = useSelector((state: RootState) => state.counter)
  return (
    <div>
      <h1 className={'mb-[25px] mt-3 text-[20px] font-bold'}>播放历史</h1>
      <div className={'p-2.5 h-[62vh] bg-[#1e1e1ead]'}>
        <AnimatedList
          data={historyPlayList}
          loadMore={() => {}}
          hasMore={false}
          sourceType={'local'}
        />
      </div>
    </div>
  )
}

export default HistoryMusic
