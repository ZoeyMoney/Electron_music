import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button, Input } from '@heroui/react'
import { RootState } from '@renderer/store/store'
import { useDispatch, useSelector } from 'react-redux'
import { setDownloadPath } from '@renderer/store/counterSlice'

interface FolderSelectorProps {
  defaultPath?: string;
  placeholder?: string;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({
  placeholder = '请选择下载文件夹'
}) => {
  const { downloadPath } = useSelector((state: RootState) => state.counter)
  const dispatch = useDispatch()

  const handleSelectFolder = async (): Promise<void> => {
    try {
      const path = await window.api.selectDownloadFolder()
      console.log(path)
      dispatch(setDownloadPath(path))
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full max-w-[314px] mt-5">
      <div className="flex gap-2">
        <Input
          type="text"
          size={'md'}
          value={downloadPath || '请设置下载地址'}
          placeholder={placeholder}
          className="flex-1 text-sm w-[100px]"
          readOnly={false}
        />
        <Button color="danger" onPress={handleSelectFolder} isIconOnly>
          <FolderOpen className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default FolderSelector;
