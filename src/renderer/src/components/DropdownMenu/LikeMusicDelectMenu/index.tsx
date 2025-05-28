/*自建歌单删除*/
import { Trash } from 'lucide-react'
import React from 'react'

interface MenuItem {
  label: string | React.ReactNode
  onClick: () => void
  className?: string
  icon?: React.ReactNode
}

export const getDeleteOnlyMenuItems = (
  item: any,
  closeMenu: () => void,
  handleRemoveMusic: (id: string | number) => void
): MenuItem[] => {
  return [
    {
      label: '删除歌单',
      onClick: () => {
        handleRemoveMusic(item.id)
        closeMenu()
      },
      className: 'text-red-600 hover:bg-red-50 hover:text-red-700',
      icon: <Trash size={14} />
    }
  ]
}
