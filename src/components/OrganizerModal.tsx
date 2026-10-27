import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Copy, 
  Check, 
  RotateCcw, 
  Save, 
  Plus, 
  Trash2, 
  ExternalLink, 
  QrCode as QrIcon, 
  Edit3, 
  Gift, 
  X,
  FileText,
  Video,
  Upload,
  Play,
  Cloud,
  Download,
  RefreshCw
} from 'lucide-react';
import { SurpriseConfig, Clue } from '../types';
import { DEFAULT_CONFIG, getCleanAppUrl } from '../utils/defaultData';
import { saveVideoBlob, getVideoBlob, deleteVideoBlob } from '../utils/videoStorage';

interface OrganizerModalProps {
  config: SurpriseConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (newConfig: SurpriseConfig) => void;
  onResetToDefaults: () => void;
  onTestAsNaomi: () => void;
}

export const OrganizerModal: React.FC<OrganizerModalProps> = ({
  config,
  isOpen,
  onClose,
  onSaveConfig,
  onResetToDefaults,
  onTestAsNaomi,
}) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'clues' | 'gifts' | 'letter' | 'video' | 'backup'>('qr');
  const [formConfig, setFormConfig] = useState<SurpriseConfig>(config);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [newSnack, setNewSnack] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [backupInput, setBackupInput] = useState<string>('');
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Video state
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [videoFileSize, setVideoFileSize] = useState<string>('');
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentOrigin = typeof window !== 'undefined' ? (window.location.origin || '') : '';
  const activeQrTargetUrl = (formConfig.customQrUrl && !formConfig.customQrUrl.includes('ais-pre-') && formConfig.customQrUrl.trim())
    ? formConfig.customQrUrl.trim()
    : (getCleanAppUrl(formConfig) || currentOrigin);

  useEffect(() => {
    setFormConfig(config);
  }, [config]);

  // Load existing video on open
  useEffect(() => {
    if (isOpen) {
      getVideoBlob().then((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setUploadedVideoUrl(url);
          setVideoFileSize((blob.size / (1024 * 1024)).toFixed(1) + ' MB');
        }
      });
    }
  }, [isOpen]);

  // Generate QR Code dynamically from the activeQrTargetUrl
  useEffect(() => {
    if (activeQrTargetUrl) {
      QRCode.toDataURL(activeQrTargetUrl, {
        width: 340,
        margin: 2,
        color: {
          dark: '#581C87', // deep royal purple
          light: '#FFFFFF'
        }
      })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR', err));
    }
  }, [activeQrTargetUrl]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(activeQrTargetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintDoorSign = () => {
    window.print();
  };

  const handleSave = async () => {
    onSaveConfig(formConfig);
    setSavedSuccess(true);
    setIsSyncing(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formConfig)
      });
      setBackupStatus({ type: 'success', text: '¡Guardado y sincronizado en el servidor para el móvil de Naomi!' });
    } catch (e) {
      console.warn('Sync warning', e);
    } finally {
      setIsSyncing(false);
      setTimeout(() => {
        setSavedSuccess(false);
      }, 3500);
    }
  };

  const handleCopyBackupJson = () => {
    const jsonStr = JSON.stringify(formConfig, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setBackupStatus({ type: 'success', text: '¡Copia de seguridad copiada al portapapeles! Guárdala en tus notas si deseas.' });
    setTimeout(() => setBackupStatus(null), 3500);
  };

  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify(formConfig, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sorpresa-naomi-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupStatus({ type: 'success', text: 'Archivo de copia de seguridad descargado correctamente.' });
    setTimeout(() => setBackupStatus(null), 3500);
  };

  const handleRestoreBackupJson = () => {
    if (!backupInput.trim()) {
      setBackupStatus({ type: 'error', text: 'Pega primero el texto JSON de tu copia de seguridad.' });
      return;
    }
    try {
      const parsed = JSON.parse(backupInput.trim());
      if (parsed && typeof parsed === 'object') {
        const merged: SurpriseConfig = {
          ...formConfig,
          ...parsed,
          gifts: {
            ...formConfig.gifts,
            ...(parsed.gifts || {})
          }
        };
        if (Array.isArray(parsed.clues) && parsed.clues.length > 0) {
          merged.clues = parsed.clues;
        }
        setFormConfig(merged);
        onSaveConfig(merged);
        setBackupStatus({ type: 'success', text: '¡Copia de seguridad restaurada y guardada con éxito!' });
        setBackupInput('');
        setTimeout(() => setBackupStatus(null), 4000);
      } else {
        setBackupStatus({ type: 'error', text: 'El formato del texto no es un JSON válido.' });
      }
    } catch (err: any) {
      setBackupStatus({ type: 'error', text: 'Error al interpretar el JSON: ' + (err?.message || 'inválido') });
    }
  };

  const handleClueChange = (index: number, field: keyof Clue, value: string | number) => {
    const updatedClues = [...formConfig.clues];
    updatedClues[index] = {
      ...updatedClues[index],
      [field]: value
    };
    setFormConfig({ ...formConfig, clues: updatedClues });
  };

  const handleAddClue = () => {
    const newClue: Clue = {
      id: `clue-${Date.now()}`,
      stepNumber: formConfig.clues.length + 1,
      title: `Pista ${formConfig.clues.length + 1}`,
      locationRiddle: 'Escribe aquí el acertijo romántico...',
      extraHint: 'Pista de ayuda si se atasca...',
      targetRoom: 'Lugar de la casa'
    };
    setFormConfig({ ...formConfig, clues: [...formConfig.clues, newClue] });
  };

  const handleRemoveClue = (index: number) => {
    if (formConfig.clues.length <= 1) return;
    const updated = formConfig.clues.filter((_, idx) => idx !== index).map((c, i) => ({
      ...c,
      stepNumber: i + 1
    }));
    setFormConfig({ ...formConfig, clues: updated });
  };

  const handleAddSnack = () => {
    if (!newSnack.trim()) return;
    setFormConfig({
      ...formConfig,
      gifts: {
        ...formConfig.gifts,
        favoriteSnacks: [...formConfig.gifts.favoriteSnacks, newSnack.trim()]
      }
    });
    setNewSnack('');
  };

  const handleRemoveSnack = (index: number) => {
    setFormConfig({
      ...formConfig,
      gifts: {
        ...formConfig.gifts,
        favoriteSnacks: formConfig.gifts.favoriteSnacks.filter((_, i) => i !== index)
      }
    });
  };

  // Video handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await saveVideoBlob(file);
      const url = URL.createObjectURL(file);
      if (uploadedVideoUrl) {
        URL.revokeObjectURL(uploadedVideoUrl);
      }
      setUploadedVideoUrl(url);
      setVideoFileName(file.name);
      setVideoFileSize((file.size / (1024 * 1024)).toFixed(1) + ' MB');
      setFormConfig({ ...formConfig, hasCustomVideo: true });
    } catch (err) {
      console.error('Error saving video blob', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async () => {
    await deleteVideoBlob();
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    setUploadedVideoUrl(null);
    setVideoFileName('');
    setVideoFileSize('');
    setFormConfig({ ...formConfig, hasCustomVideo: false, videoExternalUrl: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-purple-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600 text-white rounded-xl shadow-sm">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Panel de Preparación de la Sorpresa
              </h3>
              <p className="text-xs text-purple-700/80">
                Genera el QR para la puerta, graba tu vídeo y personaliza pistas 💜
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 px-6 bg-white shrink-0 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'qr'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrIcon className="w-4 h-4" />
            <span>QR & Cartel</span>
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'video'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Vídeo Especial</span>
            {uploadedVideoUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('clues')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'clues'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Pistas ({formConfig.clues.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('gifts')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gifts'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Regalos & Snacks</span>
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'letter'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Clave & Bienvenida</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Sincronización & Copia</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB: VIDEO DEDICADO */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl text-xs sm:text-sm text-purple-950 leading-relaxed">
                <strong>¡Dile algo bonito en persona a través de un vídeo!</strong> Grábate con tu móvil diciendo tus palabras de cumpleaños o felicidades, y súbelo aquí. Naomi lo verá en la pantalla final cuando abra la caja de su regalo.
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Título de tu vídeo para Naomi
                </label>
                <input
                  type="text"
                  value={formConfig.videoMessageTitle || ''}
                  onChange={(e) => setFormConfig({ ...formConfig, videoMessageTitle: e.target.value })}
                  placeholder="Ej. Tengo algo muy especial que decirte... 📹💜"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Upload Card */}
              <div className="bg-slate-50 border-2 border-dashed border-purple-300 rounded-3xl p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadedVideoUrl ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video max-w-md mx-auto rounded-2xl overflow-hidden bg-black shadow-lg">
                      <video
                        src={uploadedVideoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
                      <span className="font-medium text-purple-950">
                        {videoFileName || 'Vídeo cargado'} ({videoFileSize})
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
                      >
                        Cambiar por otro vídeo
                      </button>
                      <button
                        onClick={handleDeleteVideo}
                        className="px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar vídeo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center mb-3 shadow-inner">
                      <Upload className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1">
                      {isUploading ? 'Guardando vídeo...' : 'Sube tu vídeo grabado'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                      Formatos compatibles: MP4, MOV, WebM (desde la galería de tu teléfono o cámara del ordenador).
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium shadow-md shadow-purple-600/20 transition-transform active:scale-95 cursor-pointer"
                    >
                      {isUploading ? 'Procesando archivo...' : 'Seleccionar o grabar vídeo'}
                    </button>
                  </div>
                )}
              </div>

              {/* Optional external URL fallback */}
              <div className="border-t border-slate-200 pt-4">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  O si prefieres, pega un enlace directo a tu vídeo (YouTube, Vimeo o URL MP4):
                </label>
                <input
                  type="url"
                  value={formConfig.videoExternalUrl || ''}
                  onChange={(e) => setFormConfig({ ...formConfig, videoExternalUrl: e.target.value })}
                  placeholder="https://... (opcional)"
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          )}

          {/* TAB 1: QR CODE & DOOR SIGN */}
          {activeTab === 'qr' && (
            <div className="space-y-6">
              <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-4 text-xs sm:text-sm text-purple-950 leading-relaxed">
                <strong>¿Cómo colocarlo?</strong> Imprime este cartel o descarga el código QR. Pégalo en la puerta exterior de casa a la altura de los ojos. Cuando Naomi llegue, abrirá la cámara de su móvil, escaneará el código y la sorpresa se abrirá en su pantalla.
              </div>

              {/* URL Target Configuration */}
              <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm">
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Enlace al que redirige el código QR:
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="url"
                    value={formConfig.customQrUrl || ''}
                    onChange={(e) => setFormConfig({ ...formConfig, customQrUrl: e.target.value })}
                    placeholder={currentOrigin || 'https://...'}
                    className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-mono text-purple-950"
                  />
                  {activeQrTargetUrl && (
                    <a
                      href={activeQrTargetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Probar enlace</span>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-500">Acciones rápidas:</span>
                  {currentOrigin && (
                    <button
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, customQrUrl: currentOrigin })}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium border border-purple-200/70 cursor-pointer"
                    >
                      Usar URL de esta aplicación ({currentOrigin})
                    </button>
                  )}
                  {formConfig.customQrUrl && (
                    <button
                      type="button"
                      onClick={() => setFormConfig({ ...formConfig, customQrUrl: '' })}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 cursor-pointer"
                    >
                      Detectar automáticamente
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-2">
                  💡 <em>Nota sobre la publicación:</em> Si publicas la web desde el botón de la esquina superior de AI Studio, puedes pegar aquí el enlace público que te dé para que el QR de la puerta quede siempre apuntando a tu web definitiva.
                </p>
              </div>

              {/* Printable Door Sign Preview */}
              <div id="door-sign-print" className="bg-white border-2 border-dashed border-purple-300 rounded-3xl p-6 sm:p-8 text-center max-w-sm mx-auto shadow-sm">
                <div className="text-xs uppercase tracking-widest text-purple-600 font-semibold mb-1">
                  Bienvenida a casa
                </div>
                <h4 className="text-xl sm:text-2xl font-serif-romantic font-bold text-purple-950 mb-2">
                  ¡Para Naomi! 💜
                </h4>
                <p className="text-xs text-slate-600 mb-4">
                  Antes de abrir la puerta, escanea este código con tu teléfono:
                </p>

                {qrDataUrl ? (
                  <div className="inline-block p-3 bg-purple-50/50 rounded-2xl border border-purple-200 mb-4 shadow-sm">
                    <img src={qrDataUrl} alt="Código QR para la puerta" className="w-48 h-48 mx-auto" />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-purple-50 rounded-2xl flex items-center justify-center text-xs text-purple-400 mx-auto mb-4">
                    Generando QR...
                  </div>
                )}

                <div className="text-xs text-purple-900 font-serif-romantic italic">
                  "Sube el volumen y prepárate para tu sorpresa... 🎈🌹"
                </div>

                <div className="mt-3 text-[10px] text-slate-400 font-mono truncate max-w-[200px] mx-auto">
                  {activeQrTargetUrl}
                </div>
              </div>

              {/* Action Buttons for QR */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handlePrintDoorSign}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-900 text-white hover:bg-purple-800 text-xs sm:text-sm font-medium shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir cartel para la puerta</span>
                </button>

                <button
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium shadow-sm cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '¡Enlace copiado!' : 'Copiar enlace directo'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CLUES EDITOR */}
          {activeTab === 'clues' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-slate-600">
                  Edita las pistas y habitaciones según la distribución real de tu casa.
                </p>
                <button
                  onClick={handleAddClue}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 text-xs font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir otra pista</span>
                </button>
              </div>

              <div className="space-y-4">
                {formConfig.clues.map((clue, idx) => (
                  <div key={clue.id} className="p-4 rounded-2xl border border-purple-100 bg-purple-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                        Pista #{idx + 1}
                      </span>
                      {formConfig.clues.length > 1 && (
                        <button
                          onClick={() => handleRemoveClue(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-md cursor-pointer"
                          title="Eliminar pista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Título de la pista
                        </label>
                        <input
                          type="text"
                          value={clue.title}
                          onChange={(e) => handleClueChange(idx, 'title', e.target.value)}
                          className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Habitación / Lugar objetivo
                        </label>
                        <input
                          type="text"
                          value={clue.targetRoom}
                          onChange={(e) => handleClueChange(idx, 'targetRoom', e.target.value)}
                          className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Acertijo que leerá Naomi
                      </label>
                      <textarea
                        rows={2}
                        value={clue.locationRiddle}
                        onChange={(e) => handleClueChange(idx, 'locationRiddle', e.target.value)}
                        className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Pista de ayuda extra (si no lo encuentra)
                      </label>
                      <input
                        type="text"
                        value={clue.extraHint}
                        onChange={(e) => handleClueChange(idx, 'extraHint', e.target.value)}
                        className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GIFTS & SNACKS */}
          {activeTab === 'gifts' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">
                  Chuches y snacks de la Boo Basket
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  Agrega las golosinas exactas que le has comprado a Naomi para que aparezcan en su tarjeta final:
                </p>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSnack}
                    onChange={(e) => setNewSnack(e.target.value)}
                    placeholder="Ej. Nubes de azúcar, bombones Lindt..."
                    className="flex-1 text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSnack()}
                  />
                  <button
                    onClick={handleAddSnack}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Añadir
                  </button>
                </div>

                <div className="space-y-2">
                  {formConfig.gifts.favoriteSnacks.map((snack, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-medium text-slate-800">{snack}</span>
                      <button
                        onClick={() => handleRemoveSnack(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mensaje final de la tarjeta dedicada
                </label>
                <textarea
                  rows={3}
                  value={formConfig.gifts.personalCardMessage}
                  onChange={(e) =>
                    setFormConfig({
                      ...formConfig,
                      gifts: { ...formConfig.gifts, personalCardMessage: e.target.value }
                    })
                  }
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>
          )}

          {/* TAB 4: ENTRADA & CLAVE */}
          {activeTab === 'letter' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-950 leading-normal">
                <strong>Clave de desbloqueo:</strong> Naomi deberá introducir este código de 4 dígitos para que empiece a sonar la música y se desbloqueen las pistas al escanear el QR.
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Código PIN de cumpleaños para Naomi (por defecto: 2710)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={formConfig.birthdayPin}
                  onChange={(e) => setFormConfig({ ...formConfig, birthdayPin: e.target.value })}
                  className="w-36 text-center text-lg font-mono font-bold tracking-widest px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Saludo principal al escanear
                </label>
                <input
                  type="text"
                  value={formConfig.welcomeGreeting}
                  onChange={(e) => setFormConfig({ ...formConfig, welcomeGreeting: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Subtítulo / Mensaje de entrada
                </label>
                <textarea
                  rows={4}
                  value={formConfig.welcomeSubtitle}
                  onChange={(e) => setFormConfig({ ...formConfig, welcomeSubtitle: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 font-serif-romantic"
                />
              </div>
            </div>
          )}

          {/* TAB 5: SINCRONIZACIÓN & COPIA DE SEGURIDAD */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-50/90 border border-purple-200 rounded-2xl text-xs sm:text-sm text-purple-950 leading-relaxed">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <Cloud className="w-4 h-4 text-purple-700" />
                  <span>Sincronización Automática con el Móvil</span>
                </div>
                Cada vez que pulsas <strong>"Guardar configuración"</strong>, tus pistas, snacks y dedicatorias se guardan en el servidor central. De esta forma, cuando Naomi escanee el código QR desde su teléfono móvil, su dispositivo recibirá automáticamente todos los cambios que hayas preparado desde tu ordenador.
              </div>

              {backupStatus && (
                <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  backupStatus.type === 'success' 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {backupStatus.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
                  <span>{backupStatus.text}</span>
                </div>
              )}

              {/* Cloud Sync Button */}
              <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Sincronizar cambios actuales con el servidor
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Asegura que el enlace web compartido tenga exactamente lo que ves en pantalla.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}</span>
                </button>
              </div>

              {/* Export / Backup Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-purple-600" />
                  <span>Guardar copia de seguridad de tus pistas</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Si deseas guardar una copia de tus pistas y textos por seguridad en tu ordenador o notas personales:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCopyBackupJson}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5 text-purple-600" />
                    <span>Copiar copia de seguridad (JSON)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-600" />
                    <span>Descargar archivo .json</span>
                  </button>
                </div>
              </div>

              {/* Restore Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  <span>Restaurar desde texto de copia de seguridad</span>
                </h4>
                <p className="text-xs text-slate-600">
                  Si tenías pistas guardadas y quieres recuperarlas, pega aquí el código JSON y pulsa Restaurar:
                </p>
                <textarea
                  rows={3}
                  value={backupInput}
                  onChange={(e) => setBackupInput(e.target.value)}
                  placeholder='Pega aquí tu JSON de copia de seguridad...'
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="button"
                  onClick={handleRestoreBackupJson}
                  className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Restaurar y guardar configuración</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onResetToDefaults}
              className="text-xs text-slate-500 hover:text-slate-800 underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar por defecto</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={onTestAsNaomi}
              className="text-xs text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Probar como Naomi</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>¡Cambios guardados!</span>
              </span>
            )}
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-medium shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar configuración</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
