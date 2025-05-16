import React from 'react'
import { Card, Skeleton } from '@heroui/react'

interface SkeletonCardProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  loading,
  children,
  className = 'w-[140px] h-[184px] space-y-5 p-4'
}) => {
  if (!loading) return <>{children}</>
  return (
    <Card className={className} radius="lg">
      <Skeleton className="rounded-lg">
        <div className="h-24 rounded-lg bg-default-300" />
      </Skeleton>
      <div className="space-y-3">
        <Skeleton className="w-3/5 rounded-lg">
          <div className="h-3 w-3/5 rounded-lg bg-default-200" />
        </Skeleton>
        <Skeleton className="w-4/5 rounded-lg">
          <div className="h-3 w-4/5 rounded-lg bg-default-200" />
        </Skeleton>
        <Skeleton className="w-2/5 rounded-lg">
          <div className="h-3 w-2/5 rounded-lg bg-default-300" />
        </Skeleton>
      </div>
    </Card>
  );
};

export default SkeletonCard;
