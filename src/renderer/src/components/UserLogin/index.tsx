import React from 'react'
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, User } from '@heroui/react'
// import { User } from '@nextui-org/user'
import { CiShare1 } from 'react-icons/ci'
import { useNavigate } from 'react-router-dom'

const UserLogin: React.FC = (): JSX.Element => {
  const navigate = useNavigate()
  //应用退出
  const AppQuit = (): void => {
    const ipcHandleClose = (): void => window.electron.ipcRenderer.send('quit-app')
    ipcHandleClose()
  }
  //设置
  const settingApp = (): void => {
    navigate('/SettingMusic')
  }

  return (
    <div className={'userLogin'}>
      <Dropdown placement="bottom-start">
        <DropdownTrigger>
          <User
            as="button"
            avatarProps={{
              isBordered: true,
              src: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
              size: 'sm',
              color: 'danger'
            }}
            className="transition-transform"
            name="厉不厉害你鸡哥"
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="User Actions" variant="flat">
          <DropdownItem key="user_name" textValue="UserName">
            <div className={'flex items-center justify-between'}>
              <p>账号</p>
              <CiShare1 size={'18px'} />
            </div>
          </DropdownItem>
          <DropdownItem key="team_settings" textValue="Settings" onClick={settingApp}>
            设置
          </DropdownItem>
          <DropdownItem key="loginOut" textValue="Login out" color={'danger'} onClick={AppQuit}>
            退出
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

export default UserLogin
