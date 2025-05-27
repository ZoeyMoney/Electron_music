import React from 'react'
import { Card, CardBody, CardFooter } from '@heroui/card'
import SkeletonCard from '@renderer/components/SkeletonCard'
import { useNavigate } from 'react-router-dom'

interface MusicListProps {
  title: string
  list: Array<{ url_href: string; name: string; pic: string }>
  loading: boolean // 这里表示**首次加载**状态
  onClick?: (item: { url_href: string; name: string; pic: string }) => void
  showViewMore?: boolean
}

const MusicList: React.FC<MusicListProps> = ({
  title,
  list,
  showViewMore = true,
  loading,
  onClick
}) => {
  const navigate = useNavigate()
  const viewMoreClick = (): void => {
    navigate('/ViewMore')
  }

  return (
    <div className={'relative mb-[20px]'}>
      <div className="grid grid-cols-2">
        <h1 className={'pb-5'}>{title}</h1>
        {list.length <= 9 || !showViewMore ? null : (
          <h2 className={'pb-5 text-end text-[14px]'}>
            <span
              className={'cursor-pointer text-[#808080] hover:text-white transition-all'}
              onClick={viewMoreClick}
            >
              显示更多
            </span>
          </h2>
        )}
      </div>
      <div className={`gap-4 grid grid-cols-4 sm:grid-cols-5`}>
        {loading
          ? Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard loading={true} key={index}>
                <div className="w-[140px] h-[184px] bg-gray-200 rounded animate-pulse" />
              </SkeletonCard>
            ))
          : list.map((item, index) =>
              index <= 9 || !showViewMore ? (
                <Card
                  key={index}
                  isPressable
                  shadow="sm"
                  onPress={() =>
                    onClick && onClick({ url_href: item.url_href, name: item.name, pic: item.pic })
                  }
                >
                  <CardBody className="overflow-visible p-0 relative buttonsHover">
                    <img
                      src={item.pic}
                      alt={item.name}
                      style={{ borderRadius: '5px', height: '140px' }}
                    />
                  </CardBody>
                  <CardFooter className="text-small justify-between py-[13px] px-[3px]">
                    <b
                      className={'whitespace-nowrap overflow-hidden w-[140px] text-[12px] mx-auto'}
                    >
                      {item.name}
                    </b>
                  </CardFooter>
                </Card>
              ) : null
            )}
      </div>
    </div>
  )
}

export default MusicList
