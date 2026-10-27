import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Compass, Lightbulb, CheckCircle2, ArrowRight, ArrowLeft, Heart, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Clue } from '../types';

interface ClueHuntViewProps {
  clues: Clue[];
  currentClueIndex: number;
  onClueCompleted: (index: number) => void;
  onPrevClue: () => void;
  onBackToLetter: () => void;
}

export const ClueHuntView: React.FC<ClueHuntViewProps> = ({
  clues,
  currentClueIndex,
  onClueCompleted,
  onPrevClue,
  onBackToLetter,
}) => {
  const [showHint, setShowHint] = useState<boolean>(false);
  const safeClues = clues && clues.length > 0 ? clues : [
    {
      id: 'clue-1',
      stepNumber: 1,
      title: 'Primera sorpresa ❤️',
      locationRiddle: 'Sigue el camino de pétalos...',
      extraHint: 'Busca cerca de la entrada.',
      targetRoom: 'Entrada'
    }
  ];
  const safeIndex = Math.max(0, Math.min(currentClueIndex, safeClues.length - 1));
  const currentClue = safeClues[safeIndex] || safeClues[0];
  const totalClues = safeClues.length;
  const isLastClue = safeIndex === totalClues - 1;

  const handleCompleteCurrent = () => {
    // Launch celebratory purple and gold confetti burst
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#A855F7', '#C084FC', '#9333EA', '#E9D5FF', '#FFD700']
    });

    setShowHint(false);
    onClueCompleted(currentClueIndex);
  };

  return (
    <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Navigation / Progress Strip */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={currentClueIndex === 0 ? onBackToLetter : onPrevClue}
          className="inline-flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-950 bg-white/75 backdrop-blur-sm px-3 py-1.5 rounded-full border border-purple-200/60 shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{currentClueIndex === 0 ? 'Volver al inicio' : 'Pista anterior'}</span>
        </button>

        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 bg-purple-100/90 px-3 py-1 rounded-full border border-purple-200">
          <Sparkles className="w-3 h-3 text-purple-600" />
          <span>Pista {currentClueIndex + 1} de {totalClues}</span>
        </div>
      </div>

      {/* Progress Dots Track */}
      <div className="flex items-center gap-2 mb-6 px-1">
        {clues.map((clue, idx) => {
          const isDone = idx < currentClueIndex;
          const isCurrent = idx === currentClueIndex;
          return (
            <div
              key={clue.id}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                isDone
                  ? 'bg-purple-600'
                  : isCurrent
                  ? 'bg-purple-500 ring-2 ring-purple-300 ring-offset-1'
                  : 'bg-purple-100'
              }`}
            />
          );
        })}
      </div>

      {/* Active Clue Card with Smooth Fade Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentClue.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl shadow-purple-950/10 border border-purple-200/90 p-6 sm:p-8 mb-6"
        >
          {/* Step Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
              <Compass className="w-3.5 h-3.5 text-purple-600" />
              <span>Paso {currentClue.stepNumber}</span>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span>Sigue el camino</span>
            </div>
          </div>

          {/* Clue Title */}
          <h2 className="text-xl sm:text-2xl font-serif-romantic font-bold text-purple-950 mb-4 leading-snug">
            {currentClue.title}
          </h2>

          {/* Riddle Box */}
          <div className="bg-gradient-to-br from-purple-50/80 via-[#FAF7FD] to-violet-50/60 p-5 rounded-2xl border border-purple-200/60 mb-6 shadow-inner">
            <p className="text-base sm:text-lg text-slate-800 font-serif-romantic italic leading-relaxed">
              "{currentClue.locationRiddle}"
            </p>
          </div>

          {/* Extra Hint Accordion */}
          <div className="mb-6">
            <button
              onClick={() => setShowHint(!showHint)}
              className="w-full text-left py-2.5 px-4 rounded-xl border border-purple-200/70 bg-purple-50/50 hover:bg-purple-50 text-xs sm:text-sm text-purple-800 font-medium flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>{showHint ? 'Ocultar pista de ayuda' : '¿Te cuesta encontrarlo? Toca para una pista extra'}</span>
              </span>
              <span className="text-xs text-purple-600 font-bold">{showHint ? '▲' : '▼'}</span>
            </button>

            {showHint && (
              <div className="mt-2 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs sm:text-sm text-amber-900 leading-normal animate-fadeIn">
                <span className="font-semibold">Pista de ayuda: </span>
                {currentClue.extraHint}
              </div>
            )}
          </div>

          {/* Primary Action Button (Natural Thumb Zone) */}
          <button
            onClick={handleCompleteCurrent}
            className="w-full min-h-[52px] px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white font-medium text-base shadow-lg shadow-purple-600/25 hover:shadow-xl hover:shadow-purple-600/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-purple-100" />
            <span>{isLastClue ? '¡Encontré el escondite final! 🎁' : '¡Llegué a este lugar! Siguiente pista'}</span>
            {!isLastClue && <ArrowRight className="w-4 h-4 text-purple-200 ml-1" />}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Encouragement note */}
      <div className="text-center">
        <p className="text-xs text-purple-800/70 flex items-center justify-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500 inline" />
          <span>Cada paso te acerca más a tu gran sorpresa 💜</span>
        </p>
      </div>
    </div>
  );
};
