import React from 'react'
import { Skeleton, Spacer } from "@heroui/react";

interface HTableProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}
const HskeletonCard: React.FC<HTableProps> = ({ loading, children }) => {
  if (!loading) return <>{children}</>
  return (
    <div className="max-w-[300px] w-full flex items-center gap-3">
      <div className="w-full flex flex-col gap-2">
        <Skeleton className="h-4 w-4/5 rounded-lg" />
        <Spacer y={3} />
        <Skeleton className="h-4 w-4/5 rounded-lg" />
        <Spacer y={3} />
        <Skeleton className="h-4 w-4/5 rounded-lg" />
        <Spacer y={3} />
        <Skeleton className="h-4 w-4/5 rounded-lg" />
        <Spacer y={3} />
        <Skeleton className="h-4 w-4/5 rounded-lg" />
      </div>
    </div>
  )
}

export default HskeletonCard
