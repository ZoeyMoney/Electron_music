import React from "react";
import PlaySound from "@renderer/components/MusiPlayer/PlaySound";
import PlayerSlider from "@renderer/components/MusiPlayer/PlayerSlider";
import PlayerTitle from "@renderer/components/MusiPlayer/PlayerTitle";

const MusicPlayer: React.FC = () => {
  return (
    <div className={'w-[95%] mx-auto grid'} style={{ gridTemplateColumns: '20% 60% 20%' }}>
      <PlayerTitle />
      <PlayerSlider />
      <PlaySound />
    </div>
  );
};

export default MusicPlayer;
