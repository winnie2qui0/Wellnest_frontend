// useAudioManager.js
import { useState } from 'react';

const useAudioManager = () => {
  const [bgmSound, setBgmSound] = useState(null);
  const [audioQueue, setAudioQueue] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);

  const playBackgroundMusic = () => {
    const bgm = playSound(BGM_URL);
    setBgmSound(bgm);
  };

  const playAudioQueue = () => {
    // 播放音频队列的逻辑
  };

  const stopAndReleaseSound = (sound) => {
    if (sound) {
      sound.stop(() => {
        sound.release();
      });
    }
  };

  const handleModalClose = () => {
    stopAndReleaseSound(bgmSound);
    setBgmSound(null);

    audioQueue.forEach(stopAndReleaseSound);
    setAudioQueue([]);
    setCurrentAudioIndex(0);
  };

  return { playBackgroundMusic, playAudioQueue, handleModalClose, setAudioQueue };
};

export default useAudioManager;