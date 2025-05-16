import React, { useRef } from 'react'
import { addToast, Button, Input } from '@heroui/react'
import { BiHome } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { LuSearch } from 'react-icons/lu'
import { LuMinus } from 'react-icons/lu'
import { IoClose } from 'react-icons/io5'

const HeaderSearch: React.FC = () => {
  const navigate = useNavigate()
  const keyEnterRef = useRef<HTMLInputElement>(null)

  // 回车确认搜索
  const handleEnter = (e): void => {
    if (e.key === 'Enter') {
      const value = e.target.value.trim()
      if (!value) {
        addToast({
          title: '请输入内容进行搜索',
          color: 'danger'
        })
        return
      }
      navigate('/SearchTable', { state: { query: value } })
    }
  }

  // 最小化
  const minimizeChange = (): void => {
    window.electron.ipcRenderer.send('minimize-app')
  }

  // 关闭
  const closeClick = (): void => {
    window.electron.ipcRenderer.send('quit-app')
  }
  return (
    <div className="h-[50px] pl-[14px] flex items-center [-webkit-app-region:drag]">
      <div className="flex justify-between w-full">
        <div className="flex-grow-[2] flex items-center">
          <Button
            isIconOnly
            aria-label="Like"
            className="[-webkit-app-region:no-drag]"
          >
            <BiHome size={20} onClick={() => navigate('/')} />
          </Button>
        </div>

        <div className="center flex-grow-[4] flex justify-center items-center">
          <div className="w-full [-webkit-app-region:no-drag]">
            <Input
              ref={keyEnterRef}
              endContent={<LuSearch size={20} />}
              aria-label="想播放什么?"
              labelPlacement="outside"
              placeholder="想播放什么?"
              type="text"
              onKeyDown={handleEnter}
            />
          </div>
        </div>

        <div className="right flex-grow-[2] flex justify-end items-center space-x-2">
          <div
            onClick={minimizeChange}
            className="h-[50px] flex items-center justify-center w-10 cursor-pointer text-center hover:bg-[#414141b0] [-webkit-app-region:no-drag]"
          >
            <LuMinus size={20} />
          </div>
          <div
            onClick={closeClick}
            className="h-[50px] flex items-center justify-center w-[45px] cursor-pointer text-center hover:bg-[#414141b0] [-webkit-app-region:no-drag]"
          >
            <IoClose size={20} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderSearch
