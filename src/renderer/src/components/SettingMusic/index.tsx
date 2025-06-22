import React, { useState, useEffect } from 'react'
import { addToast, Select, SelectItem, Switch } from '@heroui/react'
import { SettingDataProps } from '@renderer/InterFace'
import FolderSelector from '@renderer/components/FolderSelector'
import { useDispatch, useSelector } from 'react-redux'
import { setCloseToQuit } from '@renderer/store/counterSlice'
import { RootState } from '@renderer/store/store'

const SettingMusic: React.FC = () => {
  const dispatch = useDispatch()
  const { closeToQuit } = useSelector((state: RootState) => state.counter)
  //代理存储
  const [proxySetting, setProxySetting] = useState<string>('AutoSetting')
  // const { downloadPath } = useSelector((state: RootState) => state.counter)
  // 开机启动
  const handleSelectChange = (): void => {
    addToast({
      description: '为了更好的体验：不在设置开机自启动，并且防止开机缓慢卡顿',
      timeout: 5000,
      color: 'success'
    })
  }
  //代理设置
  const handleDl = async (event: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
    //调用updateConfig来更新配置
    console.log(window.api.updateConfig)
    const success = await window.api.updateConfig({
      settings: {
        proxySetting: event.target.value
      }
    })
    console.log(success)
    setProxySetting(event.target.value)
  }
  // 同步 closeToQuit 到主进程
  useEffect(() => {
    if (window.electron) {
      window.electron.ipcRenderer.send('set-close-to-quit', closeToQuit)
    }
  }, [closeToQuit])
  const settingMap: SettingDataProps[] = [
    {
      title: '开机启动/最小化/关闭',
      data: [
        {
          label: '开机自动运行',
          component: (
            <Select
              labelPlacement={'outside'}
              label=""
              className="max-w-[65px]"
              selectedKeys={['false']}
              aria-label={'选择开机是否自动启动'}
              onChange={handleSelectChange}
            >
              <SelectItem key={'true'}>是</SelectItem>
              <SelectItem key={'false'}>否</SelectItem>
            </Select>
          )
        },
        {
          label: '点击关闭按钮时，最小化潮汐窗口',
          component: (
            <Switch
              defaultSelected={closeToQuit}
              color="success"
              onChange={(e) => dispatch(setCloseToQuit(e.target.checked))}
            />
          )
        }
      ]
    },
    {
      title: '播放',
      data: [
        {
          label: '淡出/淡入歌曲',
          component: <Switch defaultSelected={false} color="success" />
        }
      ]
    },
    {
      title: '存储',
      data: [
        {
          label: '歌曲加入我喜欢的歌单中自动下载本歌曲',
          component: <Switch defaultSelected={false} color="success" />
        },
        {
          label: '默认下载位置',
          component: <FolderSelector placeholder="选择歌曲下载文件夹" />
        }
      ]
    },
    {
      title: '代理设置',
      data: [
        {
          label: '代理类型',
          component: (
            <Select
              labelPlacement={'outside'}
              label=""
              className="max-w-[146px] width-[146px]"
              selectedKeys={[proxySetting]}
              aria-label={'自动检测设置'}
              onChange={handleDl}
            >
              <SelectItem key={'AutoSetting'}>自动检测设置</SelectItem>
              <SelectItem key={'noSetting'}>不使用代理</SelectItem>
              <SelectItem key={'http'}>HTTP</SelectItem>
              <SelectItem key={'SOCKS4'}>SOCKS4</SelectItem>
              <SelectItem key={'SOCKS5'}>SOCKS5</SelectItem>
            </Select>
          )
        }
      ]
    }
  ]
  return (
    <div className={'w-[90%] mx-auto'}>
      <div className="flex">
        <h2 className={'pb-3 pt-3 text-2xl font-bold'}>常规设置</h2>
      </div>
      <div className={'py-5 w-full mt-3'}>
        {settingMap.map((item, index) => (
          <div key={index} className={'mb-5'}>
            <h6 className={'text-[14px] font-bold mb-2'}>{item.title}</h6>
            <div>
              {item.data.map((i_children, i_index) => (
                <div key={i_index} className={'flex justify-between items-center py-2 h-[40px]'}>
                  <div className={'text-[13px]'}>{i_children.label}</div>
                  {i_children.component}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SettingMusic
