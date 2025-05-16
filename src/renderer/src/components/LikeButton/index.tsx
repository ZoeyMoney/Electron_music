import { useRef, useEffect } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import like from '@renderer/assets/lottie/like.json';

interface LikeButtonProps {
  liked: boolean; // 当前点赞状态
  onToggle: (newLiked: boolean) => void; // 切换点赞状态的回调函数
  className?: string; // 自定义样式类名
}

const LikeButton = ({ liked, onToggle, className }: LikeButtonProps): JSX.Element => {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const isAnimating = useRef(false);

  const handleClick = (): void => {
    if (isAnimating.current) return; // 防止重复点击
    isAnimating.current = true;

    if (!liked) {
      // 播放 0 到 60 帧的动画（点赞）
      lottieRef.current?.playSegments([0, 60], true);
    } else {
      // 播放 60 到 0 帧的动画（取消点赞）
      lottieRef.current?.playSegments([60, 0], true);
    }
  };

  useEffect(() => {
    // 初始化显示，确保根据 `liked` 状态设置动画到正确的帧
    lottieRef.current?.goToAndStop(liked ? 60 : 0, true);
  }, [liked]);

  return (
    <div onClick={handleClick} className={'cursor-pointer h-[26px] flex items-center'}>
      <Lottie
        lottieRef={lottieRef}
        animationData={like}
        loop={false}
        autoplay={false}
        onComplete={() => {
          isAnimating.current = false; // 动画完成后允许再次点击
          onToggle(!liked); // 切换点赞状态
        }}
        className={`w-[50px] z-[100] ${className}`}
      />
    </div>
  );
};

export default LikeButton;
