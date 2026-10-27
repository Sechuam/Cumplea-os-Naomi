import React, { useRef, useState, useEffect } from 'react';
import { Video, Play, Pause, Volume2, Sparkles, Heart } from 'lucide-react';
import { romanticAudio } from '../utils/audio';

interface SurpriseVideoPlayerProps {
  videoUrl: string | null;
  title?: string;
  onOpenOrganizer?: () => void;
}

export const SurpriseVideoPlayer: React.FC<SurpriseVideoPlayerProps> = ({
  videoUrl,
  title = 'Tengo algo muy especial que decirte... 📹💜',
  onOpenOrganizer,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handlePlay = () => {
    setIsPlaying(true);
    romanticAudio.pauseForVideo();
  };

  const handlePause = () => {
    setIsPlaying(false);
    romanticAudio.resumeAfterVideo();
  };

  const handleEnded = () => {
    setIsPlaying(false);
    romanticAudio.resumeAfterVideo();
  };

  // Clean up if component unmounts while video was playing
  useEffect(() => {
    return () => {
      romanticAudio.resumeAfterVideo();
    };
  }, []);

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-purple-950/10 border border-purple-200/90 overflow-hidden mb-8 transition-all">
      {/* Video Section Header */}
      <div className="p-5 sm:p-6 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50/80 via-[#FAF7FD] to-violet-50/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-700 block">
              Vídeo Dedicado
            </span>
            <h3 className="text-lg sm:text-xl font-serif-romantic font-bold text-purple-950">
              {title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1 text-purple-500">
          <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
          <Heart className="w-4 h-4 fill-purple-500" />
        </div>
      </div>

      {/* Video Content */}
      <div className="p-4 sm:p-6">
        {videoUrl ? (
          <div className="relative w-full aspect-video sm:aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden shadow-inner group">
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              controls
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              className="w-full h-full object-contain bg-black"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-video sm:aspect-[16/10] bg-purple-50/80 rounded-2xl border-2 border-dashed border-purple-300 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 shadow-inner">
              <Video className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-purple-950 mb-1">
              Tu vídeo aparecerá aquí
            </h4>
            <p className="text-xs sm:text-sm text-purple-800/80 max-w-sm mb-4 leading-relaxed">
              Puedes grabar o subir tu vídeo con tus palabras bonitas desde el <strong>Panel de Preparación</strong> (icono del candado arriba).
            </p>
            {onOpenOrganizer && (
              <button
                onClick={onOpenOrganizer}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                Grabar o subir mi vídeo ahora
              </button>
            )}
          </div>
        )}

        <div className="mt-3.5 flex items-center justify-between text-xs text-purple-800/70">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-purple-600" />
            <span>La música ambiental se pausará automáticamente al dar al play</span>
          </span>
        </div>
      </div>
    </div>
  );
};
