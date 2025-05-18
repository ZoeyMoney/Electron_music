import React from 'react'
import { FaVolumeMute } from 'react-icons/fa'
import { Slider } from '@heroui/react'
import { useSelector } from "react-redux";
import { RootState } from "@renderer/store/store";
import { setVolumeAudio } from "@renderer/utils/audioConfig";
import { FaVolumeLow } from 'react-icons/fa6'
/* 声音 */
const PlaySound: React.FC = () => {
  const { audioState } = useSelector((state: RootState) => state.counter)
  return (
    <div className={'grid items-center gap-[10px] h-[80px]'} style={{ gridTemplateColumns: '10% 80%' }}>
      <div>
        {audioState.volume === 0 ? (
            <FaVolumeMute />
          ) : (
            <FaVolumeLow />
          )}
      </div>
      <div>
        <Slider
          className="max-w-md"
          color="danger"
          defaultValue={audioState.volume}
          hideValue={true}
          aria-label="Temperature"
          size="sm"
          maxValue={100}
          minValue={0}
          step={1}
          onChange={(value) => {
            const volume = Array.isArray(value) ? value[0] : value
            setVolumeAudio(volume)
          }}
        />
      </div>
    </div>
  );
};

export default PlaySound;
