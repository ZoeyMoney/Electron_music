/*
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@renderer/store/store'
import {
  Button,
  Selection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@heroui/react'
import { MdAccessTime } from 'react-icons/md'
import { removeMusicLocalDataList, setMenuDataType, setPlayInfo, setSort } from '@renderer/store/counterSlice'
import { LocalMusicInfo } from '@renderer/InterFace'
import { DeleteIcon } from '@renderer/assets/SVG'
import { formatDate } from '@renderer/utils'

interface MusicTableComponentProps {
  data: LocalMusicInfo[]
  onOpen?: () => void
}

const LocalMusicTable: React.FC<MusicTableComponentProps> = ({ data, onOpen }) => {
  const { localMusicList, playInfo, sort } = useSelector((state: RootState) => state.counter)
  const dispatch = useDispatch()
  // 管理选中状态
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set<string>())
  // 状态管理：sortOrder 为 'asc'（升序）、'desc'（降序）或 null（未排序）
  const [linId, setLinId] = useState('') //高亮显示
  useEffect(() => {
    setLinId(playInfo.id)
  }, [playInfo.id])
  // 处理选择变化，返回 UUID
  const handleSelectionChange: (keys: Selection) => void = (keys) => {
    // console.log('接收到的 keys:', keys, typeof keys); // 调试 keys 的值和类型
    setSelectedKeys(keys)
  }
  // 点击表头排序
  const handleSort = (): void => {
    if (sort === null || sort === 'desc') {
      dispatch(setSort('asc')) // 未排序或降序时，切换为升序
    } else {
      dispatch(setSort('desc')) // 升序时，切换为降序
    }
  }
  // 根据 sort 排序数据
  const sortedData = useMemo(() => {
    const sorted = [...data] // 创建数据副本，避免直接修改 props
    if (sort === 'asc') {
      sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      //按照id排序
      // sorted.sort((a, b) => a.id - b.id)
    } else if (sort === 'desc') {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      // sorted.sort((a, b) => b.id - a.id)
    }
    console.log('sor',sorted)
    return sorted
  }, [data, sort])
  // 双击播放
  const handleDoubleClick = (item): void => {
    dispatch(setMenuDataType('localMusicList'))
    setLinId(item.id)
    dispatch(setPlayInfo(item))
  }
  //删除歌曲
  const handleDelete = (id: string): void => {
    dispatch(removeMusicLocalDataList(id))
  }
  return (
    <div>
      {localMusicList.length > 0 && (
        <div className={'my-2 space-x-2'}>
          <Button color="success" size={'sm'} onPress={onOpen}>
            添加歌曲
          </Button>
        </div>
      )}
      <Table
        isHeaderSticky
        aria-label="Example static collection table"
        color={'danger'}
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        classNames={{
          base: 'max-h-[342px] overflow-hidden'
        }}
      >
        <TableHeader>
          <TableColumn key={'id'}>#</TableColumn>
          <TableColumn key={'title'}>标题</TableColumn>
          <TableColumn key={'album'}>专辑</TableColumn>
          <TableColumn key={'date'}>
            <div className="flex items-center">
              日期
              <Tooltip content="按日期升序或降序(排序)">
                <span>
                  <MdAccessTime
                    className={`cursor-pointer mx-1 ${sort === 'desc' ? 'text-[green]' : null}`}
                    size={18}
                    onClick={handleSort}
                  />
                </span>
              </Tooltip>
            </div>
          </TableColumn>
          <TableColumn key={'duration'}>时长</TableColumn>
          <TableColumn key={'action'}>操作</TableColumn>
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow
              key={item.id}
              onDoubleClick={() => handleDoubleClick(item)}
              className={item.id === linId ? 'bg-danger-100' : ''} // 高亮当前播放歌曲
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.music_title}</TableCell>
              <TableCell>{item.artist}</TableCell>
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell>{item.duration}</TableCell>
              <TableCell>
                <Tooltip color="danger" content="删除歌曲">
                  <span
                    onClick={() => handleDelete(item.id)}
                    className="text-lg text-danger cursor-pointer active:opacity-50"
                  >
                    <DeleteIcon />
                  </span>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default LocalMusicTable
*/
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@renderer/store/store';
import {
  Button,
  Selection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@heroui/react';
import { MdAccessTime } from 'react-icons/md';
import { removeMusicLocalDataList, setMenuDataType, setPlayInfo, setSort } from '@renderer/store/counterSlice';
import { DeleteIcon } from '@renderer/assets/SVG';
import { createSongInfo, formatDate } from '@renderer/utils'
import { LocalMusicInfo, SongProps } from '@renderer/InterFace'

interface MusicTableProps {
  items: SongProps[] | LocalMusicInfo[];
  columns: {
    name: string;
    uid: string;
    width?: string;
  }[];
  addButton?: boolean;  //添加歌曲按钮
  menuDataType: string, //播放那个列表
  showSongInfo?: boolean; // 控制歌曲信息列（标题、歌手、专辑）的显示
  showDate?: boolean;     // 控制日期列的显示
  showDuration?: boolean; // 控制时长列的显示
  showActions?: boolean;  // 控制操作列的显示
  onOpen?: () => void;    // 添加歌曲的回调
}

const LocalMusicTable: React.FC<MusicTableProps> = ({
  items,
  columns,
  menuDataType,
  addButton = true,
  showSongInfo = true,
  showDate = true,
  showDuration = true,
  showActions = true,
  onOpen
}) => {
  const { playInfo, sort } = useSelector((state: RootState) => state.counter)
  const dispatch = useDispatch()
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set<string>())
  const [linId, setLinId] = useState<string>('')
  console.log(items,'loalc')
  // 高亮当前播放歌曲
  useEffect(() => {
    setLinId(playInfo.id)
  }, [playInfo.id])
  const isLocalMusicInfo = (item: SongProps | LocalMusicInfo): item is LocalMusicInfo => {
    return 'localPath' in item;
  };
  // 处理选择变化
  const handleSelectionChange = (keys: Selection): void => {
    setSelectedKeys(keys)
  }

  // 处理排序
  const handleSort = (): void => {
    if (sort === null || sort === 'desc') {
      dispatch(setSort('asc'))
    } else {
      dispatch(setSort('desc'))
    }
  }

  // 排序数据
  const sortedData = useMemo(() => {
    const sorted = [...items];
    if (sort && sorted.some(isLocalMusicInfo)) {
      sorted.sort((a, b) => {
        if (!isLocalMusicInfo(a) || !isLocalMusicInfo(b)) return 0; // 非 LocalMusicInfo 不排序
        const dateA = a.date || '';
        const dateB = b.date || '';
        return sort === 'asc'
          ? new Date(dateA).getTime() - new Date(dateB).getTime()
          : new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    }
    return sorted;
  }, [items, sort]);

  // 双击播放
  const handleDoubleClick = async (item: SongProps): Promise<void> => {
    if (!item.id) return; // 确保 id 存在
    setLinId(item.id);
    dispatch(setMenuDataType(menuDataType));

    if (isLocalMusicInfo(item)) {
      // console.log('本地')
      // 本地音乐：直接使用 href
      dispatch(
        setPlayInfo({
          ...item,
          audioSrc: item.href, // 本地文件路径
          loading: false
        })
      )
    } else {
      // 网络音乐：发起请求获取音频 URL
      try {
        // console.log('有网络',item)
        const res = await createSongInfo(item);
        if (res?.status === 200 && res.data) {
          dispatch(
            setPlayInfo({
              music_title: item.music_title,
              artist: item.artist,
              href: res.data.mp3_url, // ✅ 这里触发 useEffect，才播放
              pic: res.data.pic,
              lrc: res.data.lrc,
              loading: false,
              id: item.id
            })
          );
        }
      } catch (error) {
        console.error('获取网络音频失败:', error)
        dispatch(
          setPlayInfo({
            ...item,
            id: item.id ?? '',
            artist: item.artist ?? '未知歌手',
            lrc: item.lrc ?? '无歌词',
            audioSrc: '',
            loading: false
          })
        )
      }
    }
    /*dispatch(setMenuDataType(menuDataType))
    setLinId(item.id ?? '')
    dispatch(setPlayInfo(item))*/
  }

  // 删除歌曲
  const handleDelete = (id: string): void => {
    dispatch(removeMusicLocalDataList(id))
  }
  // 渲染单元格
  const renderCell = React.useCallback(
    (item: SongProps | LocalMusicInfo, columnKey: string, index: number) => {
      switch (columnKey) {
        case 'uid':
        case 'id':
          return <div>{index + 1}</div>
        case 'music_title':
          return showSongInfo ? item.music_title || '-' : null
        case 'artist':
          return showSongInfo ? item.artist || '-' : null
        case 'date':
          return showDate && isLocalMusicInfo(item)
            ? item.date
              ? formatDate(item.date)
              : '-'
            : null
        case 'duration':
          return showDuration && isLocalMusicInfo(item) ? item.duration || '-' : null
        case 'action':
        case 'actions':
          return showActions && item.id ? (
            <Tooltip color="danger" content="删除歌曲">
              <span
                onClick={() => handleDelete(item.id ?? '')}
                className="text-lg text-danger cursor-pointer active:opacity-50"
              >
                <DeleteIcon />
              </span>
            </Tooltip>
          ) : null
        default:
          return item[columnKey as keyof SongProps] ?? ''
      }
    },
    [showSongInfo, showDate, showDuration, showActions]
  )

  // 过滤列，基于 showSongInfo, showDate, showDuration 和 showActions
  const filteredColumns = columns.filter((column) => {
    if (!showSongInfo && ['music_title', 'artist', 'album'].includes(column.uid)) {
      return false
    }
    if (!showDate && column.uid === 'date') {
      return false
    }
    if (!showDuration && column.uid === 'duration') {
      return false
    }
    if (!showActions && ['action', 'actions'].includes(column.uid)) {
      return false
    }
    return true
  })

  return (
    <div>
      {addButton && (
        <div className="my-2 space-x-2">
          <Button color="success" size="sm" onPress={onOpen}>
            添加歌曲
          </Button>
        </div>
      )}
      <Table
        isHeaderSticky
        aria-label="音乐列表"
        color="danger"
        selectedKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        classNames={{
          base: 'max-h-[65vh] overflow-hidden'
        }}
      >
        <TableHeader columns={filteredColumns}>
          {(column) => (
            <TableColumn key={column.uid} className={column.width}>
              {column.uid === 'date' ? (
                <div className="flex items-center">
                  {column.name}
                  <Tooltip content="按日期升序或降序排序">
                    <span>
                      <MdAccessTime
                        className={`cursor-pointer mx-1 ${sort === 'desc' ? 'text-[green]' : ''}`}
                        size={18}
                        onClick={handleSort}
                      />
                    </span>
                  </Tooltip>
                </div>
              ) : (
                column.name
              )}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody>
          {sortedData.map((item, index) => (
            <TableRow
              key={item.id}
              onDoubleClick={() => handleDoubleClick(item)}
              className={item.id === linId ? 'bg-danger-100' : ''}
            >
              {filteredColumns.map((column) => (
                <TableCell key={column.uid}>{renderCell(item, column.uid, index)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default LocalMusicTable;
