import React, { useEffect, useState } from 'react'
import { menuDataProps } from '@renderer/InterFace'
import { RiHomeHeartFill } from 'react-icons/ri'
import { RiNeteaseCloudMusicFill } from 'react-icons/ri'
import { HiMiniFolderArrowDown } from 'react-icons/hi2'
import { BiSolidTimeFive } from 'react-icons/bi'
import { FaMusic } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { addToast, Input, Listbox, ListboxItem, ListboxSection } from '@heroui/react'
import { IoIosAdd } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import { deleteMyLikeMusicList, setMyLikeMusic } from '@renderer/store/counterSlice'
import { v4 as uuidv4 } from 'uuid'
import { LikeFill } from '@renderer/assets/SVG'
import { ModalWrapper } from '@renderer/components/ModalWrapper'
import MusicMenuDelect from '@renderer/components/DropdownMenu/MusicMenuDelect'
import { getDeleteOnlyMenuItems } from '@renderer/components/DropdownMenu/LikeMusicDelectMenu'
import { MoreHorizontal } from 'lucide-react'

const LeftMenu: React.FC = () => {
  const iconClasses = 'text-[18px] text-default-500 pointer-events-none flex-shrink-0'
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [playlistName, setPlaylistName] = useState('') // 歌单名称
  const [isOpen, setIsOpen] = useState(false) //创建歌单模态框
  const [MusicOpen, setMusicOpen] = useState(false) // 删除模态框
  const myLikeMusic = useSelector((state: any) => state.counter.myLikeMusic) //我喜欢的歌单
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 }) // 菜单位置
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null) // 选中的歌单
  const [hoveredItem, setHoveredItem] = useState<string | null>(null) // 当前悬停的项目
  const [showMenu, setShowMenu] = useState(false) // 控制菜单显示
  //内容
  const menuData: menuDataProps[] = [
    {
      title: '发现音乐',
      list: [
        { icon: <RiHomeHeartFill className={iconClasses} />, label: '为你推荐', name: '' },
        {
          icon: <RiNeteaseCloudMusicFill className={iconClasses} />,
          label: '乐库',
          name: 'MusicLibrary'
        }
      ]
    },
    {
      title: '我得音乐',
      list: [
        {
          icon: <HiMiniFolderArrowDown className={iconClasses} />,
          label: '本地与下载',
          name: 'LocalMusic'
        },
        {
          icon: <BiSolidTimeFive className={iconClasses} />,
          label: '最近播放',
          name: 'HistoryMusic'
        },
        { icon: <FaMusic className={iconClasses} />, label: '全部音乐', name: 'AllMusic' }
      ]
    }
  ]
  const errorMessage =
    playlistName.trim().length === 0
      ? '内容不能为空'
      : playlistName.length > 8
        ? '内容过长（最多8个字）'
        : myLikeMusic.some((item) => item.name === playlistName) // 注意这里是 item.name
          ? '歌单名字已存在'
          : ''
  const isInvalid = errorMessage !== ''
  //每个页面跳转
  const menuClick = (key: string | number): void => {
    navigate(`/${key}`)
  }
  //自建歌单跳转
  const menuClickInfo = (item): void => {
    navigate(`/MyLikeMusic`, { state: { item: item } })
  }
  // 关闭删除模态框
  const MusicHandleClose = (): void => setMusicOpen(false)
  //提交删除模态框
  const onSubmitData = (): void => {
    if (selectedPlaylist.id === 1) {
      addToast({
        title: '默认歌单不能删除',
        color: 'danger',
        timeout: 2000
      })
    } else {
      dispatch(deleteMyLikeMusicList({ id: selectedPlaylist.id }))
      addToast({
        title: '删除成功',
        description: `自建歌单中的 ${selectedPlaylist.name} 已删除`,
        color: 'success',
        timeout: 2000
      })
    }
  }
  //关闭创建歌单模态框情况内容
  const handleClose = (): void => {
    setIsOpen(false)
    setPlaylistName('')
  }
  // 创建歌单提交创建歌单
  const submitData = (): void => {
    // 检查是否有重复的歌单名
    if (isInvalid) return // 有错误，不提交
    if (playlistName.trim() !== '') {
      // 更新 Redux 状态
      const newPlaylist = {
        id: uuidv4(), // 使用时间戳作为歌单 ID
        name: playlistName,
        key: 'MyLike-' + uuidv4(),
        songs: []
      }

      dispatch(setMyLikeMusic(newPlaylist)) // 更新 Redux 状态
      setPlaylistName('') // 清空输入框
    }
  }
  useEffect(() => {
    console.log('歌单已更新:', myLikeMusic)
  }, [myLikeMusic])
  //删除函数
  // 处理三个点按钮点击
  const handleMenuClick = (event: React.MouseEvent, item: any) => {
    event.preventDefault()
    event.stopPropagation()

    const rect = event.currentTarget.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    setDropdownPosition({
      x: rect.right + scrollLeft - 120, // 调整位置让菜单显示在按钮左侧
      y: rect.top + scrollTop
    })

    setSelectedPlaylist(item)
    setShowMenu(true)
  }

  const handleRemoveMusic = (id: string | number): void => {
    const playlist = myLikeMusic.find((item) => item.id === id)
    if (playlist) {
      setSelectedPlaylist(playlist)
      setMusicOpen(true)
    }
  }

  return (
    <>
      <Listbox
        variant="flat"
        color={'default'}
        aria-label="Listbox menu with icons"
        onAction={(key) => menuClick(key)}
      >
        {menuData.map((item) => (
          <ListboxSection title={item.title} showDivider key={item.title}>
            {item.list.map((items) => (
              <ListboxItem key={items.name!} startContent={items.icon} textValue={items.label}>
                <span style={{ fontSize: '12px' }}>{items.label}</span>
              </ListboxItem>
            ))}
          </ListboxSection>
        ))}
      </Listbox>
      {/*自建歌单*/}
      <div className="flex justify-between items-center px-1" style={{ fontSize: '12px' }}>
        <span style={{ color: '#a1a1aa' }} className={'px-1'}>
          自建歌单
        </span>
        <span>
          <IoIosAdd
            size={'20'}
            style={{ color: '#a1a1aa', cursor: 'pointer' }}
            onClick={() => setIsOpen(true)}
          />
        </span>
      </div>
      {/*自建歌单列表*/}
      <div className={'h-[130px] overflow-auto'}>
        <Listbox variant="flat" color={'default'} aria-label="Listbox menu with icons">
          {myLikeMusic.map((item) => (
            <ListboxItem
              onPress={() => menuClickInfo(item)}
              key={item.id}
              startContent={
                <div className={'flex items-center justify-between w-full'}>
                  <div className={'flex'}>
                    <LikeFill className={`${iconClasses} w-[18px] !text-[#ff3144]`} />
                    <span style={{ fontSize: '12px' }} className={'px-2'}>
                      {item.name}
                    </span>
                  </div>
                  <button
                    className={`p-1 hover:bg-gray-200 rounded transition-all duration-200 ${
                      hoveredItem === item.id || (showMenu && selectedPlaylist?.id === item.id)
                        ? 'opacity-100 visible'
                        : 'opacity-0 invisible'
                    }`}
                    onClick={(e) => handleMenuClick(e, item)}
                  >
                    <MoreHorizontal size={16} className="text-gray-500" />
                  </button>
                </div>
              }
              style={{ fontSize: '15px' }}
              textValue={item.name}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            ></ListboxItem>
          ))}
        </Listbox>
      </div>
      {/*自建歌单右键*/}
      <MusicMenuDelect
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        song={selectedPlaylist}
        position={dropdownPosition}
        menuItems={
          selectedPlaylist
            ? getDeleteOnlyMenuItems(selectedPlaylist, () => setShowMenu(false), handleRemoveMusic)
            : []
        }
      />
      {/* 创建歌单模态框 */}
      <ModalWrapper
        title="创建歌单"
        isOpen={isOpen}
        onClose={handleClose}
        onAction={submitData}
        actionText="创建"
        buttonSize={'md'}
      >
        <Input
          label="命名歌单"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          type="text"
          isInvalid={isInvalid}
          color={isInvalid ? 'danger' : 'success'}
          errorMessage={errorMessage}
          size={'md'}
        />
      </ModalWrapper>
      {/*删除模态框*/}
      {selectedPlaylist && (
        <ModalWrapper
          title="删除歌单"
          isOpen={MusicOpen}
          onClose={MusicHandleClose}
          onAction={onSubmitData}
          actionText={'确认删除'}
          buttonSize={'md'}
        >
          <p className={'text-[13px]'}>
            你确定要删除这个 [ <span className={'text-[#f31260]'}>{selectedPlaylist.name}</span> ]
            歌单吗？
          </p>
          <p className={'text-[#f31260] text-[13px]'}>删除后，歌单数据将无法恢复。</p>
        </ModalWrapper>
      )}
    </>
  )
}

export default LeftMenu
