import React, { useEffect, useRef, useState } from "react"
import { Plus, ListPlus, Download, Share, Info, Trash2 } from "lucide-react"

interface MusicItem {
  id: number
  title: string
  artist: string
  cover: string
  isLiked: boolean
  isPlaying?: boolean
}

interface DropdownMenuProps {
  isOpen: boolean
  onClose: () => void
  track: MusicItem
  buttonRef: React.RefObject<HTMLButtonElement>
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, onClose, track, buttonRef }) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 200
      const menuHeight = 220
      let x = rect.right - menuWidth
      let y = rect.bottom + 8
      if (x < 10) x = rect.left
      if (y + menuHeight > window.innerHeight) {
        y = rect.top - menuHeight - 8
      }
      setPosition({ x, y })
    }
  }, [isOpen, buttonRef])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const menuItems = [
    { icon: Plus, label: "添加到播放队列" },
    { icon: ListPlus, label: "添加到播放列表" },
    { icon: Download, label: "下载" },
    { icon: Share, label: "分享" },
    { icon: Info, label: "查看详情" },
    { icon: Trash2, label: "从列表中移除", danger: true },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        ref={menuRef}
        className="fixed z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl py-2 min-w-[200px]"
        style={{ left: position.x, top: position.y }}
      >
        <div className="px-4 py-2 border-b border-gray-700">
          <p className="text-sm font-medium text-white truncate">{track.title}</p>
          <p className="text-xs text-gray-400 truncate">{track.artist}</p>
        </div>
        <div className="py-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                console.log(`${item.label}:`, track.title)
                onClose()
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-gray-700 text-left ${
                item.danger
                  ? "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  : "text-gray-200 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default DropdownMenu
