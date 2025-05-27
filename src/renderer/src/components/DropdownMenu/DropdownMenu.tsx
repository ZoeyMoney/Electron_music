import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MenuItemProps, SongProps } from '@renderer/InterFace'

interface DropdownMenuProps {
  isOpen: boolean
  onClose: () => void
  song: SongProps
  position: { x: number; y: number }
  menuItems: MenuItemProps[]
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  onClose,
  song,
  position,
  menuItems
}) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [submenuDirection, setSubmenuDirection] = useState<'left' | 'right'>('right')
  useEffect(() => {
    setMounted(true)
  }, [])
  const handleMouseEnter = (e: React.MouseEvent): void => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    if (rect.right + 200 > window.innerWidth) {
      setSubmenuDirection('left')
    } else {
      setSubmenuDirection('right')
    }
  }
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen && mounted) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, mounted])

  if (!mounted || !isOpen) return null
  // 计算菜单位置
  const menuWidth = 220
  const menuHeight = 250

  let adjustedX = position.x
  let adjustedY = position.y

  if (typeof window !== 'undefined') {
    if (position.x + menuWidth > window.innerWidth) {
      adjustedX = window.innerWidth - menuWidth - 10
    }
    if (position.y + menuHeight > window.innerHeight) {
      adjustedY = window.innerHeight - menuHeight - 10
    }
    if (adjustedX < 10) adjustedX = 10
    if (adjustedY < 10) adjustedY = 10
  }
  const menuContent = (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      {/* 下拉菜单 */}
      <div
        ref={menuRef}
        className="fixed z-[9999] bg-gray-800 border border-gray-600 rounded-xl shadow-2xl py-2 min-w-[200px]"
        style={{
          left: adjustedX,
          top: adjustedY,
          animation: 'dropdownIn 0.15s ease-out'
        }}
      >
        {/* 菜单头部 */}
        <div className="px-4 py-2 border-b border-gray-700">
          <p className="text-sm font-medium text-white truncate">{song.music_title}</p>
          <p className="text-xs text-gray-400 truncate">{song.artist}</p>
        </div>

        {/* 菜单项 */}
        <div className="py-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon

            return (
              <div
                key={index}
                className="relative group"
                onMouseEnter={handleMouseEnter}
              >
                <button
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-gray-700 text-left ${
                    item.danger
                      ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.children && (
                    <span className="ml-auto text-gray-400 group-hover:text-white">▶</span>
                  )}
                </button>

                {/* 子菜单 */}
                {item.children && (
                  <div
                    className={`absolute overflow-hidden top-0 ${
                      submenuDirection === 'left' ? 'right-full mr-0' : 'left-full ml-0'
                    } w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg
          opacity-0 group-hover:opacity-100 group-hover:visible invisible
          transition-all duration-200 z-10
          pointer-events-none group-hover:pointer-events-auto`}
                  >
                    {item.children.map((subItem, subIndex) => (
                      <button
                        key={subIndex}
                        onClick={subItem.onClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white"
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )

  // 使用 Portal 但延迟渲染，确保不影响主组件
  return createPortal(menuContent, document.body)
}

export default DropdownMenu
