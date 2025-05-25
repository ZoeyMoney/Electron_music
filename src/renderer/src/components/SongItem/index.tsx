import React, { useState } from 'react';
import { Pause, Play, MoreHorizontal } from 'lucide-react';
import { SongProps } from '@renderer/InterFace';
import LikeButton from '@renderer/components/LikeButton';
import { useSelector } from 'react-redux';
import { RootState } from '@renderer/store/store';
import { useLike } from '@renderer/components/LikeHandle';
import { getAlbumColor, useHandleDoubleClickPlay } from '@renderer/utils';

interface SongItemProps {
  item: SongProps; // 单个歌曲数据
}

export const SongItem: React.FC<SongItemProps> = ({ item }) => {
  const { myLikeMusic, audioState, playInfo } = useSelector((state: RootState) => state.counter);
  const { isLiked, handleToggleLike } = useLike({ myLikeMusic });
  const [isHovered, setIsHovered] = useState(false);
  const [showPlay, setShowPlay] = useState(false);
  const handleDoubleClickPlay = useHandleDoubleClickPlay();

  const getInitials = (title: string): string => {
    return title
      .split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className={`group flex items-center gap-4 p-3 rounded-lg transition-all duration-200 cursor-pointer relative hover:bg-gray-800/60 ${
        audioState.isPlaying && playInfo.id === item.id ? 'bg-green-900/20' : ''
      } ${isHovered && !audioState.isPlaying ? 'bg-gray-800/60' : ''}`}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowPlay(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowPlay(false);
      }}
      onDoubleClick={() => handleDoubleClickPlay(item)}
    >
      {/* 专辑封面 */}
      <div className="relative flex-shrink-0">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all duration-200 ${getAlbumColor(
            item.id
          )} ${audioState.isPlaying && playInfo.id === item.id ? 'shadow-lg shadow-green-500/25' : ''}`}
        >
          {getInitials(item.music_title)}
        </div>
        <div
          className={`absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center transition-opacity duration-200 ${
            showPlay || (audioState.isPlaying && playInfo.id === item.id) ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {audioState.isPlaying && playInfo.id === item.id ? (
            <Pause className="w-5 h-5 text-white fill-white" />
          ) : (
            <Play className="w-5 h-5 text-white fill-white" />
          )}
        </div>
      </div>
      {/* 歌曲信息 */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate transition-colors duration-200">{item.music_title}</h3>
        <p className="text-sm text-gray-400 truncate">{item.artist}</p>
      </div>
      {/* 喜欢按钮 */}
      <div className="flex items-center gap-2 z-[1]">
        <LikeButton liked={isLiked(item.href)} onToggle={() => handleToggleLike(item)} />
      </div>
      {/* 更多菜单 */}
      <div className="flex items-center">
        <button
          className="p-2 rounded-full transition-all duration-200 hover:scale-110 hover:bg-gray-700 text-[#efefef] hover:bg-[#4f4f4f] opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      {/* 播放指示器 */}
      {audioState.isPlaying && playInfo.id === item.id && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-400 rounded-r-full"></div>
      )}
      {/* 加载更多 */}
    </div>
  );
};
