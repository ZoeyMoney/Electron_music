import React from 'react'
import { SongProps } from '@renderer/InterFace'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@heroui/react'

interface LikeAllMusicTableProps {
  items: SongProps[]
  columns: {
    name: string
    uid: string
    width?: string
  }[]
}

const LikeAllMusicTable: React.FC<LikeAllMusicTableProps> = ({ columns, items }) => {
  // 渲染单元格内容
  const renderCell = React.useCallback((item: SongProps, columnKey: string, index: number) => {
    switch (columnKey) {
      case 'uid': // 显示行号
      case 'id':
        return <div>{index + 1}</div>
      case 'music_title':
        return item.music_title || '-'
      case 'artist':
        return item.artist || '-'
      case 'actions':
        return <div className="flex items-center gap-2">操作按钮</div>
      default:
        return item[columnKey as keyof SongProps] ?? ''
    }
  }, [])

  return (
    <Table aria-label="音乐列表">
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn key={column.uid} className={column.width}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item.id}>
            {columns.map((column) => (
              <TableCell key={column.uid}>{renderCell(item, column.uid, index)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default LikeAllMusicTable
