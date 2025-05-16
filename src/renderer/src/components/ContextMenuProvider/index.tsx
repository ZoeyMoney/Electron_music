import React from 'react'
import { Menu, Item, Separator, Submenu, type ItemParams } from 'react-contexify'
import 'react-contexify/dist/ReactContexify.css'

export const MENU_ID = 'global-context-menu'

export type ContextMenuItem = {
  label: string
  onClick?: (params: ItemParams) => void
  children?: ContextMenuItem[]
}

interface ContextMenuProps {
  items: ContextMenuItem[]
}

const renderMenuItems = (items: ContextMenuItem[]): any => {
  return items.map((item, index) => {
    if (item.label === '-') {
      return <Separator key={index} />
    }

    if (item.children && item.children.length > 0) {
      return (
        <Submenu key={index} label={item.label}>
          {renderMenuItems(item.children)}
        </Submenu>
      )
    }

    return <Item key={index} onClick={item.onClick}>{item.label}</Item>
  })
}

const ContextMenuProvider: React.FC<ContextMenuProps> = ({ items }) => {
  return (
    <Menu
      id={MENU_ID}
      theme={'dark'}
      animation={'scale'}
    >
      {renderMenuItems(items)}
    </Menu>
  )
}

export default ContextMenuProvider
