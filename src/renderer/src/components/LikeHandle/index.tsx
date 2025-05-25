import { useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SongProps } from '@renderer/InterFace'
import { setMyLikeMusicList } from '@renderer/store/counterSlice'

interface MyLikeMusicGroup {
  id: number | string;
  songs: SongProps[];
}

interface UseLikeOptions {
  myLikeMusic: MyLikeMusicGroup[];
}

export const useLike = ({ myLikeMusic }: UseLikeOptions) => {
  const dispatch = useDispatch();

  // 计算 isLiked 函数，只依赖 myLikeMusic 变化时更新
  const isLiked = useMemo(() => {
    return (href: string): boolean => {
      const favoriteGroup = myLikeMusic.find((group) => group.id === 1);
      return favoriteGroup ? favoriteGroup.songs.some((song) => song.href === href) : false;
    };
  }, [myLikeMusic]);

  // 点赞 / 取消点赞函数
  const handleToggleLike = useCallback(
    async (
      song: SongProps,
      groupId: string | number = 1,
      forceAdd: boolean = false
    ): Promise<void> => {
      const alreadyLiked = isLiked(song.href);
      if (alreadyLiked && !forceAdd) {
        // 取消点赞
        dispatch(
          setMyLikeMusicList({
            type: 'remove',
            id: groupId,
            song,
          })
        );
      } else {
        // 添加点赞
        dispatch(
          setMyLikeMusicList({
            type: 'add',
            id: groupId,
            song,
          })
        );
      }
    },
    [dispatch, isLiked]
  );

  return {
    isLiked,
    handleToggleLike,
  };
}
