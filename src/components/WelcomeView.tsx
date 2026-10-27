import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, KeyRound, Lock, Unlock, ArrowRight, Volume2 } from 'lucide-react';
import { SurpriseConfig } from '../types';

interface WelcomeViewProps {
  config: SurpriseConfig;
  onUnlocked: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ config, onUnlocked }) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const targetPin = config.birthdayPin || '2710';

  const handleDigitChange = (index: number, val: string) => {
    setError(false);
    // Allow only single numeric digit
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto-advance to next input
    if (cleaned && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Check if all 4 digits entered
    const codeEntered = newDigits.join('');
    if (codeEntered.length === 4) {
      validateCode(codeEntered);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const validateCode = (code: string) => {
    if (code === targetPin) {
      setIsSuccess(true);
      setError(false);

      // Launch celebratory purple and gold confetti
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#A855F7', '#C084FC', '#9333EA', '#E9D5FF', '#FFD700', '#FFFFFF']
      });

      // Short delay for the unlock animation before starting the music and clues
      setTimeout(() => {
        onUnlocked();
      }, 700);
    } else {
      setError(true);
      // Vibrate if available on mobile
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(200);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateCode(digits.join(''));
  };

  return (
    <div className="relative z-10 min-h-[88vh] flex flex-col items-center justify-center px-4 py-6 max-w-lg mx-auto text-center">
      {/* Decorative Top Badge in Purple */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/90 border border-purple-300 text-purple-900 text-xs font-semibold uppercase tracking-wider mb-5 shadow-sm">
        <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Para Naomi al llegar a casa</span>
        <span className="text-purple-400">·</span>
        <span>27 de Octubre 💜</span>
      </div>

      {/* Main Birthday Greeting */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif-romantic font-bold text-purple-950 tracking-tight leading-tight mb-4">
        {config.welcomeGreeting}
      </h1>

      <p className="text-base sm:text-lg text-purple-900/80 font-serif-romantic italic leading-relaxed mb-6 max-w-md mx-auto">
        "{config.welcomeSubtitle}"
      </p>

      {/* Atmosphere Audio Notice */}
      <div className="flex items-center justify-center gap-2 text-xs font-medium text-purple-800 bg-white/75 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-purple-200/70 mb-6 shadow-sm">
        <Volume2 className="w-4 h-4 text-purple-600" />
        <span>Sube el volumen de tu teléfono antes de continuar</span>
      </div>

      {/* Secret Code Padlock Card */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-purple-200/90 shadow-xl shadow-purple-950/10 mb-6 transition-all">
        {/* Padlock Icon */}
        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-all duration-300 ${
          isSuccess 
            ? 'bg-emerald-100 text-emerald-600 scale-110' 
            : error 
            ? 'bg-red-50 text-red-500' 
            : 'bg-purple-50 text-purple-700'
        }`}>
          {isSuccess ? (
            <Unlock className="w-7 h-7 animate-bounce" />
          ) : (
            <Lock className="w-7 h-7" />
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {isSuccess ? '¡Código correcto! Abriendo sorpresa...' : 'Introduce tu clave mágica'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Para desbloquear la música y tus pistas de hoy, escribe tu fecha de nacimiento (DDMM):
        </p>

        {/* 4 Digit Inputs */}
        <form onSubmit={handleManualSubmit}>
          <div className="flex justify-center gap-3 sm:gap-4 mb-4">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={isSuccess}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                placeholder="•"
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono rounded-2xl border-2 transition-all duration-200 focus:outline-none ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : error
                    ? 'border-red-400 bg-red-50 text-red-600 animate-shake'
                    : digit
                    ? 'border-purple-500 bg-purple-50 text-purple-950 shadow-inner'
                    : 'border-slate-200 bg-white text-slate-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium mb-4 animate-fadeIn">
              Ups, ese no es... Pista: El día que nació la mujer más guapa del mundo (27 de octubre) 💜
            </p>
          )}

          <button
            type="submit"
            disabled={isSuccess || digits.join('').length < 4}
            className={`w-full min-h-[50px] px-6 py-3.5 rounded-2xl font-medium text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2 ${
              isSuccess
                ? 'bg-emerald-600 text-white'
                : digits.join('').length === 4
                ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-600/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSuccess ? '¡Desbloqueando!' : 'Comenzar la aventura'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      <p className="text-xs text-purple-800/70 font-light flex items-center justify-center gap-1.5">
        <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500 inline" />
        <span>Una sorpresa preparada con todo mi amor para ti</span>
      </p>
    </div>
  );
};
