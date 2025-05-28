import React, { useState } from 'react'
import {
  addToast,
  Button,
  Checkbox,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Tooltip
} from '@heroui/react'
import { formatDate, handleAddMusic, LocalAndDownloadList } from '@renderer/utils'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from "@renderer/store/store";
import Lottie from "lottie-react";
import animationData from '@renderer/assets/lottie/Animation.json'
import { ModalWrapper } from '@renderer/components/ModalWrapper'
import { LocalMusicInfo } from '@renderer/InterFace'
import { DeleteIcon } from '@renderer/assets/SVG'
import { setMusicLocalDataList } from '@renderer/store/counterSlice'
import { IoMdCheckmark } from "react-icons/io";
import { VscChromeClose } from "react-icons/vsc";
import AnimatedList from '@renderer/components/AnimatedList'

const LocalMusic: React.FC = () => {
  //获取本地歌曲
  const localMusicList = useSelector((state: RootState) => state.counter.localMusicList)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [musicList, setMusicList] = useState<LocalMusicInfo[]>([])
  const dispatch = useDispatch()
  console.log(localMusicList,'555')
  // 过滤添加歌曲
  const [isFilter, setIsFilter] = useState<boolean>(false)
  // 打开模态框
  const handleOpenMusicClick = async (): Promise<void> => {
    const musicData = await handleAddMusic()
    console.log(musicData)
    if (musicData) {
      setMusicList(musicData)
      setIsOpen(true)
    }
  }
  //修改添加音乐的处理函数，确保传递 dispatch
  const handleAddMusicClick = async (): Promise<void> => {
    if (isFilter) {
      const filteredList = musicList.filter((music) => {
        return !localMusicList.some(
          (item) =>
            item.music_title === music.music_title &&
            item.artist === music.artist &&
            item.duration === music.duration
        )
      })

      if (filteredList.length > 0) {
        // console.log('过滤后添加的数据:', filteredList)
        dispatch(setMusicLocalDataList(filteredList))
      } else {
        console.log('全部歌曲已存在，无需添加')
        addToast({
          title: '所有歌曲已存在，无需添加。',
          color: 'success',
          timeout: 2000
        })
      }
    } else {
      dispatch(setMusicLocalDataList(musicList))
      addToast({
        title: '已添加歌曲',
        color: 'success',
        timeout: 2000
      })
    }
    setIsFilter(false)
  }
  //判断歌曲是否存在
  const isMusicExist = (musicList: LocalMusicInfo[], song: LocalMusicInfo): boolean => {
    return musicList.some(
      m => m.music_title === song.music_title && m.artist === song.artist && m.duration === song.duration
    )
  }
  //删除歌曲
  const handleDelete = (id: string): void => {
    setMusicList((prevList) => prevList.filter((item) => item.id !== id));
  }

  return (
    <div className={'grid h-[75vh] w-full'} style={{ gridTemplateRows: 'auto 1fr' }}>
      <ModalWrapper
        title={'是否添以下歌曲'}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAction={handleAddMusicClick}
        actionText={musicList.length > 0 ? '添加' : undefined}
        buttonSize={'md'}
        modalSize={'3xl'}
      >
        <Checkbox
          defaultSelected={isFilter}
          color={'success'}
          onChange={(e) => setIsFilter(e.target.checked)}
        >
          过滤添加已存在的歌曲
        </Checkbox>
        <Table aria-label="本地音乐">
          <TableHeader>
            <TableColumn>#</TableColumn>
            <TableColumn>标题</TableColumn>
            <TableColumn>专辑</TableColumn>
            <TableColumn>添加日期</TableColumn>
            <TableColumn>时长</TableColumn>
            <TableColumn>
              <Tooltip content="√：已经在音乐内；X：没有添加到音乐软件内">
                <span className="flex items-center gap-1">
                  状态
                  <span className={'text-[#f54180] cursor-pointer'}>?</span>
                </span>
              </Tooltip>
            </TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody>
            {musicList.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.music_title}</TableCell>
                <TableCell>{item.artist}</TableCell>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>{item.duration}</TableCell>
                <TableCell>
                  {isMusicExist(localMusicList, item) ? (
                    <IoMdCheckmark size={20} className={'text-[#17c964] font-bold'} />
                  ) : (
                    <VscChromeClose size={20} className={'text-[#f54180]'} />
                  )}
                </TableCell>
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
      </ModalWrapper>

      <div>
        <h1 className={'mb-2 mt-3 text-[20px] font-bold'}>本地和下载</h1>
        <div className="flex w-full items-center justify-between">
          <Tabs
            aria-label="Options"
            classNames={{
              tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-divider',
              cursor: 'w-full bg-[#F31260]',
              tab: 'max-w-fit px-0 h-12',
              tabContent: 'group-data-[selected=true]:text-[#F31260]'
            }}
            color="primary"
            variant="underlined"
          >
            {LocalAndDownloadList.map((item) => (
              <Tab
                key={item.key}
                title={
                  <div className="flex items-center space-x-2">
                    <span className={'text-[12px]'}>{item.title}</span>
                  </div>
                }
              />
            ))}
          </Tabs>
          {localMusicList.length > 0 && (
            <Button color="success" size="sm" onPress={() => handleOpenMusicClick()}>
              添加歌曲
            </Button>
          )}
        </div>
        {localMusicList.length > 0 ? (
          <div className={'p-2.5 h-[62vh] bg-[#1e1e1ead]'}>
            <AnimatedList
              data={localMusicList}
              loadMore={() => {}}
              hasMore={false}
              sourceType={'localMusicList'}
              showAlbum={true}
              showDuration={true}
            />
          </div>
        ) : (
          <div className={'flex justify-center items-center flex-col'}>
            <Lottie animationData={animationData} loop={true} style={{ width: 300, height: 300 }} />
            <Button color={'danger'} onPress={() => handleOpenMusicClick()}>
              添加音乐
            </Button>
          </div>
        )}
      </div>
    </div>
  )
};

export default LocalMusic;
