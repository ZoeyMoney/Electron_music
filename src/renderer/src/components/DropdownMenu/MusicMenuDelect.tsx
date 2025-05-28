import React from 'react'

interface MenuItem {
  label: string | React.ReactNode
  onClick: () => void
  className?: string
  icon?: React.ReactNode
}

interface DropdownMenuProps {
  isOpen: boolean
  onClose: () => void
  song: any
  position: { x: number; y: number }
  menuItems: MenuItem[]
}

const MusicMenuDelect: React.FC<DropdownMenuProps> = ({ isOpen, onClose, position, menuItems }) => {
  if (!isOpen) return null

  const handleItemClick = (onClick: () => void): void => {
    onClick()
    onClose()
  }

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 z-40" onClick={onClose} style={{ background: 'transparent' }} />

      {/* 右键菜单 */}
      <div
        className="fixed z-50 min-w-[120px] shadow-lg border border-gray-200  bg-[#3f3f3f] rounded-[4px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      >
        <div className="p-1">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                hover:bg-[#333333] rounded transition-colors
                ${item.className || ''}
              `}
              onClick={() => handleItemClick(item.onClick)}
            >
              {item.icon && <span className="text-base">{item.icon}</span>}
              <span className={'text-[13px]'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default MusicMenuDelect

