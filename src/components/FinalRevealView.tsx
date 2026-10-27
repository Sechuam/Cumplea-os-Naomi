import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Gift, PackageOpen, PartyPopper, RotateCcw, ArrowRight } from 'lucide-react';
import { SurpriseConfig } from '../types';
import { getVideoBlob } from '../utils/videoStorage';
import { SurpriseVideoPlayer } from './SurpriseVideoPlayer';
import booBasketImg from '../assets/images/boo_basket_gift_1793086271699.jpg';
import sneakersImg from '../assets/images/new_balance_408_1793087524972.jpg';

interface FinalRevealViewProps {
  config: SurpriseConfig;
  onRestart: () => void;
  onOpenOrganizer?: () => void;
}

export const FinalRevealView: React.FC<FinalRevealViewProps> = ({ config, onRestart, onOpenOrganizer }) => {
  const [hasOpenedPhysicalBox, setHasOpenedPhysicalBox] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    getVideoBlob().then((blob) => {
      if (blob) {
        objectUrl = URL.createObjectURL(blob);
        setVideoUrl(objectUrl);
      } else if (config.videoExternalUrl) {
        setVideoUrl(config.videoExternalUrl);
      }
    });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [config.videoExternalUrl]);

  const fireConfetti = () => {
    const count = 230;
    const defaults = { origin: { y: 0.65 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#A855F7', '#C084FC', '#FFFFFF'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#F59E0B', '#FBBF24', '#D8B4FE'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#7E22CE', '#9333EA', '#A855F7'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#FFD700', '#E9D5FF', '#FFF'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleOpenBox = () => {
    setHasOpenedPhysicalBox(true);
    fireConfetti();
    setTimeout(fireConfetti, 1200);
  };

  // STEP 4A: Naomi has arrived at the spot, prompt her to open the physical box
  if (!hasOpenedPhysicalBox) {
    return (
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8 text-center animate-fadeIn">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>¡Fin del recorrido!</span>
          <Sparkles className="w-4 h-4 text-purple-600" />
        </div>

        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-tr from-purple-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/30 animate-pulse">
          <Gift className="w-12 h-12" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif-romantic font-bold text-purple-950 mb-4 leading-tight">
          ¡Has llegado al escondite secreto!
        </h1>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-purple-200/90 shadow-lg mb-8 max-w-md mx-auto">
          <p className="text-base sm:text-lg text-slate-700 font-serif-romantic leading-relaxed mb-3">
            ¿Ves la caja esperándote en este rincón?
          </p>
          <p className="text-xs sm:text-sm text-purple-900/80 leading-normal">
            Cógela en tus brazos con calma, ábrela en la vida real... y cuando veas lo que hay dentro, pulsa el botón para continuar con tu dedicatoria especial.
          </p>
        </div>

        <button
          onClick={handleOpenBox}
          className="group w-full max-w-sm min-h-[54px] px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white font-medium text-base sm:text-lg shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/35 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer"
        >
          <PackageOpen className="w-5 h-5 text-purple-200 group-hover:scale-110 transition-transform" />
          <span>¡Ya tengo la caja abierta! 💝</span>
          <ArrowRight className="w-5 h-5 text-purple-200 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  // STEP 4B: Full digital celebration & dedicated card after she opens her real box
  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-6 sm:py-8 animate-fadeIn">
      {/* Top Celebration Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm">
          <PartyPopper className="w-4 h-4 text-purple-600" />
          <span>¡Felicidades mi amor!</span>
          <PartyPopper className="w-4 h-4 text-purple-600" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif-romantic font-bold text-purple-950 tracking-tight mb-3">
          ¡Feliz Cumpleaños Naomi! 💜
        </h1>
        <p className="text-base sm:text-lg text-purple-900 max-w-md mx-auto leading-relaxed">
          ¡Espero que te haya encantado la sorpresa! Todo esto lo preparé pensando en sacarte la mayor de tus sonrisas.
        </p>

        <div className="mt-4 flex justify-center">
          <button
            onClick={fireConfetti}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-800 hover:bg-purple-50 text-xs font-medium shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>¡Tocar para más confeti! 🎉</span>
          </button>
        </div>
      </div>

      {/* Special Dedicated Video Player */}
      <SurpriseVideoPlayer
        videoUrl={videoUrl}
        title={config.videoMessageTitle}
        onOpenOrganizer={onOpenOrganizer}
      />

      {/* Gift 1: The Boo Basket */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-purple-950/10 border border-purple-200/90 overflow-hidden mb-6">
        <div className="relative w-full aspect-[4/3] bg-purple-50 overflow-hidden">
          <img
            src={booBasketImg}
            alt="Boo Basket de cumpleaños para Naomi"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-xs uppercase tracking-wider font-semibold text-purple-200 block mb-1">
              Tu sorpresa número 1
            </span>
            <h3 className="text-xl sm:text-2xl font-serif-romantic font-bold">
              {config.gifts.booBasketTitle}
            </h3>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
            {config.gifts.booBasketDescription}
          </p>

          <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-700 mb-2.5">
            Tus chuches y snacks favoritos incluidos:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            {config.gifts.favoriteSnacks.map((snack, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950"
              >
                <Heart className="w-3 h-3 text-purple-400 fill-purple-400 shrink-0" />
                <span className="font-medium">{snack}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gift 2: The New Balance 408 Sneakers */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-purple-950/10 border border-purple-200/90 overflow-hidden mb-6">
        <div className="relative w-full aspect-[4/3] bg-purple-50 overflow-hidden">
          <img
            src={sneakersImg}
            alt="Zapatillas New Balance 408 de regalo para Naomi"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-xs uppercase tracking-wider font-semibold text-purple-200 block mb-1">
              Tu sorpresa número 2
            </span>
            <h3 className="text-xl sm:text-2xl font-serif-romantic font-bold">
              {config.gifts.sneakersTitle}
            </h3>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {config.gifts.sneakersDescription}
          </p>
        </div>
      </div>

      {/* Dedicated Card */}
      <div className="bg-gradient-to-br from-[#FAF7FD] to-purple-50/90 rounded-3xl border border-purple-200 p-6 sm:p-8 mb-8 text-center shadow-md">
        <div className="w-12 h-12 rounded-full bg-purple-100 mx-auto flex items-center justify-center text-purple-600 mb-3 shadow-inner">
          <Heart className="w-6 h-6 fill-purple-600 text-purple-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-serif-romantic font-bold text-purple-950 mb-3">
          Tarjeta Dedicada
        </h3>
        <p className="text-base sm:text-lg font-serif-romantic italic text-purple-950 leading-relaxed max-w-lg mx-auto mb-4">
          "{config.gifts.personalCardMessage}"
        </p>
        <span className="text-xs text-purple-700/80 uppercase tracking-widest font-semibold block">
          Con todo mi amor para ti hoy y siempre
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-purple-200 text-slate-700 hover:text-purple-700 hover:bg-purple-50 text-sm font-medium shadow-sm transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Volver a ver las pistas desde el inicio</span>
        </button>
      </div>
    </div>
  );
};
