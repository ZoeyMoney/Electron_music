import React from 'react'
import { FaVolumeMute } from 'react-icons/fa'
import { Slider } from '@heroui/react'

/* 声音 */
const PlaySound: React.FC = () => {
  return (
    <div className={'grid items-center gap-[10px] h-[80px]'} style={{ gridTemplateColumns: '10% 80%' }}>
      <div>
        <FaVolumeMute />
        {/*{volume === 0 ? (
            <FaVolumeMute />
          ) : (
            <FaVolumeLow />
          )}*/}
      </div>
      <div>
        <Slider
          className="max-w-md"
          color="danger"
          defaultValue={50}
          hideValue={true}
          aria-label="Temperature"
          size="sm"
          maxValue={100}
          minValue={0}
          step={1}
        />
      </div>
    </div>
  );
};

export default PlaySound;
