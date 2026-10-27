import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Lock, Heart, Sparkles, QrCode as QrIcon, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SurpriseConfig } from './types';
import { 
  loadConfig, 
  saveConfig, 
  loadCurrentStep, 
  saveCurrentStep, 
  resetProgress, 
  getCleanAppUrl,
  fetchServerConfig,
  DEFAULT_CONFIG 
} from './utils/defaultData';
import { romanticAudio } from './utils/audio';
import { PetalCanvas } from './components/PetalCanvas';
import { AudioPlayerControl } from './components/AudioPlayerControl';
import { WelcomeView } from './components/WelcomeView';
import { ClueHuntView } from './components/ClueHuntView';
import { FinalRevealView } from './components/FinalRevealView';
import { OrganizerModal } from './components/OrganizerModal';

export default function App() {
  const [config, setConfig] = useState<SurpriseConfig>(DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentClueIndex, setCurrentClueIndex] = useState<number>(0);
  const [isOrganizerOpen, setIsOrganizerOpen] = useState<boolean>(false);
  const [showPinPrompt, setShowPinPrompt] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [doorQrUrl, setDoorQrUrl] = useState<string>('');

  // Load configuration and progress on mount, syncing with server across devices
  useEffect(() => {
    const loaded = loadConfig();
    setConfig(loaded);
    const savedStep = loadCurrentStep();
    const safeStep = (savedStep === 1 || savedStep === 2) ? savedStep : 0;
    setCurrentStep(safeStep);

    // Fetch server configuration so Naomi's phone automatically gets any changes made on the boyfriend's PC
    fetchServerConfig().then((serverData) => {
      if (serverData) {
        setConfig((prev) => {
          // If server has data, merge with current
          const merged = { ...prev, ...serverData };
          saveConfig(merged, false); // persist to local device storage without loop
          return merged;
        });
      }
    });
  }, []);

  // Generate door QR whenever config (or customQrUrl) updates
  useEffect(() => {
    const targetUrl = getCleanAppUrl(config) || (typeof window !== 'undefined' ? window.location.href : '');
    if (targetUrl) {
      QRCode.toDataURL(targetUrl, {
        width: 380,
        margin: 2,
        color: { dark: '#581C87', light: '#FFFFFF' }
      }).then(setDoorQrUrl).catch(console.error);
    }
  }, [config.customQrUrl]);

  const handleUnlocked = () => {
    // Start ambient romantic music box when 2710 is unlocked
    romanticAudio.play();
    setCurrentStep(1); // Clue Hunt
    saveCurrentStep(1);
  };

  const handleClueCompleted = (index: number) => {
    if (index < config.clues.length - 1) {
      setCurrentClueIndex(index + 1);
    } else {
      // Completed all clues!
      setCurrentStep(2); // Final Reveal
      saveCurrentStep(2);
    }
  };

  const handlePrevClue = () => {
    if (currentClueIndex > 0) {
      setCurrentClueIndex(currentClueIndex - 1);
    }
  };

  const handleBackToStart = () => {
    setCurrentStep(0);
    saveCurrentStep(0);
  };

  const handleRestart = () => {
    resetProgress();
    setCurrentStep(0);
    setCurrentClueIndex(0);
  };

  const handleSaveConfig = (newConfig: SurpriseConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleResetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    saveConfig(DEFAULT_CONFIG);
  };

  const handleOpenOrganizer = () => {
    setShowPinPrompt(true);
    setPinInput('');
    setPinError(false);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === config.secretPin || pinInput === '0000') {
      setShowPinPrompt(false);
      setIsOrganizerOpen(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7FD] via-[#F5EDFD] to-[#EDE0FC] text-slate-800 relative selection:bg-purple-200 selection:text-purple-900 pb-16">
      {/* Floating Rose & Violet Petal Canvas */}
      <PetalCanvas />

      {/* Floating Audio Controls (Top Right) */}
      <div className="no-print">
        <AudioPlayerControl />
      </div>

      {/* Discreet Header Bar */}
      <header className="no-print border-b border-purple-100/70 bg-white/50 backdrop-blur-md sticky top-0 z-30 px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif-romantic font-bold text-purple-950 text-sm sm:text-base tracking-tight">
              Para Naomi 💜
            </span>
            <span className="text-purple-300">·</span>
            <span className="text-[11px] text-purple-700 font-medium">
              Sorpresa Especial
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handleRestart}
                className="text-[11px] text-purple-700 hover:text-purple-950 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-purple-50 cursor-pointer transition-colors"
                title="Reiniciar sorpresa"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            )}
            <button
              onClick={handleOpenOrganizer}
              className="text-xs text-slate-500 hover:text-purple-800 p-1.5 rounded-full hover:bg-white/80 transition-colors flex items-center gap-1 cursor-pointer"
              title="Panel del Organizador (Preparar QR y Pistas)"
              aria-label="Panel del Organizador"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden md:inline text-slate-400">Preparación</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Experience Router with Smooth Opacity Fade-In Transitions */}
      <main className="no-print relative z-10 pt-2 sm:pt-4">
        <AnimatePresence mode="wait">
          {currentStep === 1 ? (
            <motion.div
              key="clues"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ClueHuntView
                clues={config.clues && config.clues.length > 0 ? config.clues : DEFAULT_CONFIG.clues}
                currentClueIndex={currentClueIndex}
                onClueCompleted={handleClueCompleted}
                onPrevClue={handlePrevClue}
                onBackToLetter={handleBackToStart}
              />
            </motion.div>
          ) : currentStep === 2 ? (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <FinalRevealView
                config={config}
                onRestart={handleRestart}
                onOpenOrganizer={handleOpenOrganizer}
              />
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <WelcomeView config={config} onUnlocked={handleUnlocked} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Dedicated Print Layout for Door Poster */}
      <div className="print-only hidden p-8 text-center bg-white max-w-lg mx-auto border-4 border-purple-300 rounded-3xl">
        <div className="mb-4">
          <span className="text-sm font-bold uppercase tracking-widest text-purple-600 block mb-1">
            Sorpresa de Cumpleaños
          </span>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
            ¡Bienvenida a casa, Naomi! 💜
          </h1>
          <p className="text-base text-slate-700 font-medium">
            No abras la puerta todavía. Apunta con la cámara de tu móvil a este código:
          </p>
        </div>

        {doorQrUrl && (
          <div className="my-6 p-4 inline-block border-2 border-purple-400 rounded-2xl bg-white shadow-md">
            <img src={doorQrUrl} alt="Código QR de la puerta" className="w-64 h-64 mx-auto" />
          </div>
        )}

        <div className="space-y-2 text-slate-600 text-sm">
          <p className="font-serif italic text-lg text-purple-900">
            "Sube el volumen de tu teléfono y sigue el camino de pétalos y globos..."
          </p>
          <p className="text-xs text-slate-400">
            Tu sorpresa especial te espera dentro ✨
          </p>
        </div>
      </div>

      {/* Secret PIN Prompt Modal */}
      {showPinPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-purple-200 text-center animate-fadeIn">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Modo Organizador
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Introduce el PIN para generar el QR o editar las pistas (PIN por defecto: 0000)
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="PIN"
                autoFocus
                className="w-full text-center text-lg tracking-widest font-mono py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {pinError && (
                <p className="text-xs text-red-500 font-medium">
                  PIN incorrecto. (Usa 0000)
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinPrompt(false)}
                  className="flex-1 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organizer Suite Modal */}
      <OrganizerModal
        config={config}
        isOpen={isOrganizerOpen}
        onClose={() => setIsOrganizerOpen(false)}
        onSaveConfig={handleSaveConfig}
        onResetToDefaults={handleResetToDefaults}
        onTestAsNaomi={() => {
          setIsOrganizerOpen(false);
          handleRestart();
        }}
      />
    </div>
  );
}
