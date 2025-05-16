import React from "react";

import { LiaRandomSolid } from 'react-icons/lia'
import { MdSkipPrevious, MdSkipNext } from 'react-icons/md'
import { IoPauseSharp } from 'react-icons/io5'
import { GrPowerCycle } from 'react-icons/gr'
import { Slider } from "@heroui/react";

const PlayerSlider: React.FC = () => {
  const classNameIcon = 'hover:text-gray-400'
  const iconSize = 20
  const nextPrive = 30
  return (

    <div className={'flex flex-col justify-evenly py-[9px]'}>
      <div className={'grid gap-[6px] justify-center items-center justify-items-center'}
           style={{ gridTemplateColumns: '4% 6% 4% 5% 4%' }}>
        <div className={'cursor-pointer'}>
          <LiaRandomSolid size={iconSize} />
        </div>
        <div className={'cursor-pointer'}>
          <MdSkipPrevious size={nextPrive} className={classNameIcon} />
        </div>
        <div className={'cursor-pointer'}>
          <IoPauseSharp size={30} className={classNameIcon} />
          {/*{isPlay ? (
              <IoPauseSharp size={30} className={classNameIcon} />
            ) : (
              <FaPlay size={iconSize} className={classNameIcon} />
            )}*/}
        </div>
        <div className={'cursor-pointer'}>
          <MdSkipNext size={nextPrive} className={classNameIcon} />
        </div>
        <div className={'cursor-pointer'}>
          <GrPowerCycle size={iconSize} className={`${classNameIcon}`} />
        </div>
      </div>
      <div
        className={'grid items-center gap-[19px] text-sm mx-auto w-[70%]'}
        style={{ gridTemplateColumns: '10% 80% 10%' }}
      >
        <div>time</div>
        <div>
          <Slider
            className="max-w-md"
            color="danger"
            defaultValue={1}
            fillOffset={0}
            formatOptions={{ signDisplay: 'always' }}
            aria-label="Exposure"
            maxValue={100}
            minValue={1}
            size="sm"
            step={0.01}
          />
        </div>
        <div>总时间</div>
      </div>
    </div>
  );
};

export default PlayerSlider;
