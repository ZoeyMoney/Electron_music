import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@renderer/store/store'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'

const HistoryMusic: React.FC = () => {
  const { historyPlayList, playInfo } = useSelector((state: RootState) => state.counter)
  return (
    <div>
      <h1 className={'mb-[25px] mt-3 text-[20px] font-bold'}>播放历史</h1>
      <Table
        isHeaderSticky
        aria-label="Example static collection table"
        color={'danger'}
        classNames={{
          base: 'max-h-full overflow-hidden h-full'
        }}
      >
        <TableHeader>
          <TableColumn key={'id'}>#</TableColumn>
          <TableColumn key={'title'}>标题</TableColumn>
          <TableColumn key={'album'}>歌手</TableColumn>
        </TableHeader>
        <TableBody emptyContent={'最近没有听过任何歌曲'}>
          {historyPlayList.map((item, index) => (
            <TableRow
              key={`${item.id}}`}
              className={item.id === playInfo.id ? 'bg-danger-100' : ''} // 高亮当前播放歌曲
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.music_title}</TableCell>
              <TableCell>{item.artist}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default HistoryMusic
