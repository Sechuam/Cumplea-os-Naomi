import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';
import { romanticAudio } from '../utils/audio';

interface AudioPlayerControlProps {
  autoStarted?: boolean;
}

export const AudioPlayerControl: React.FC<AudioPlayerControlProps> = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(romanticAudio.getIsPlaying());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.4);

  useEffect(() => {
    const checkState = () => {
      setIsPlaying(romanticAudio.getIsPlaying());
    };
    const interval = setInterval(checkState, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePlay = () => {
    const newState = romanticAudio.toggle();
    setIsPlaying(newState);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      romanticAudio.setVolume(volume);
      setIsMuted(false);
    } else {
      romanticAudio.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    romanticAudio.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
      <div className="bg-white/90 backdrop-blur-md border border-purple-200/80 shadow-md rounded-full px-3 py-1.5 flex items-center gap-2 text-purple-900 transition-all duration-200">
        <button
          onClick={handleTogglePlay}
          className="flex items-center gap-1.5 text-xs font-medium hover:text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full"
          title={isPlaying ? 'Pausar música ambiental' : 'Reproducir música ambiental'}
          aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        >
          {isPlaying ? (
            <>
              <div className="relative flex items-center justify-center w-5 h-5">
                <Music className="w-3.5 h-3.5 text-purple-600 animate-bounce" />
              </div>
              <Pause className="w-3.5 h-3.5 text-purple-500" />
            </>
          ) : (
            <>
              <Music className="w-3.5 h-3.5 text-slate-400" />
              <Play className="w-3.5 h-3.5 text-slate-600 ml-0.5" />
            </>
          )}
          <span className="hidden sm:inline text-[11px] text-purple-800 font-medium">
            {isPlaying ? 'Música activa' : 'Música'}
          </span>
        </button>

        <div className="w-px h-3.5 bg-purple-200" />

        <button
          onClick={handleToggleMute}
          className="text-purple-700 hover:text-purple-900 focus-visible:outline-none rounded-full p-0.5"
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
          aria-label="Silenciar o activar sonido"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-purple-600" />
          )}
        </button>

        <button
          onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          className="text-[10px] text-purple-500 hover:text-purple-800 underline underline-offset-2 ml-0.5"
        >
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </button>
      </div>

      {showVolumeSlider && (
        <div className="bg-white/95 backdrop-blur-md border border-purple-200 shadow-lg rounded-2xl p-2.5 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 accent-purple-500 h-1.5 cursor-pointer bg-purple-100 rounded-lg"
            aria-label="Control de volumen"
          />
        </div>
      )}
    </div>
  );
};
