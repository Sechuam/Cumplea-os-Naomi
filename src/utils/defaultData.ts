import { SurpriseConfig } from '../types';

export function getCleanAppUrl(config?: SurpriseConfig): string {
  if (config?.customQrUrl && config.customQrUrl.trim() && !config.customQrUrl.includes('ais-pre-')) {
    return config.customQrUrl.trim();
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}

export const DEFAULT_CONFIG: SurpriseConfig = {
  recipientName: 'Naomi',
  partnerName: 'Tu amor',
  welcomeGreeting: '¡Feliz Cumpleaños, mi amor! 🎂✨',
  welcomeSubtitle: 'Hoy celebramos tu día especial, tu luz y la alegría infinita que traes a mi vida. He preparado una sorpresa mágica esperándote al otro lado de la puerta...',
  birthdayPin: '2710', // 27 de octubre
  customQrUrl: '',
  videoMessageTitle: 'Tengo algo muy especial que decirte... 📹💜',
  videoExternalUrl: '',
  hasCustomVideo: false,
  clues: [
    {
      id: 'clue-1',
      stepNumber: 1,
      title: 'Primera sorpresa ❤️',
      locationRiddle: 'Hay cosas que saben mejor cuando están hechas con cariño. Y estas las he preparado yo para ti.\n\nNo busques muy lejos. Piensa en ese sitio donde dejamos algo cada vez que entramos en casa y que casi nunca miramos dos veces.\n\nTu primera sorpresa está esperando ahí. 🍪',
      extraHint: 'Donde dejamos las llaves al llegar a casa. ',
      targetRoom: 'El Recibidor / Entrada'
    },
    {
      id: 'clue-2',
      stepNumber: 2,
      title: 'Segunda sorpresa ❤️',
      locationRiddle: 'Lo primero estaba hecho para disfrutarlo; esto es para que te pares un momento y lo leas con calma.\n\nHay cosas que a veces cuesta decir en voz alta, pero que merece la pena poner por escrito.\n\nBusca en ese rincón de casa donde nos sentamos a descansar, entre cojines y ratitos juntos. Allí te espera algo que he escrito solo para ti.\n\nLéelo cuando te apetezca, sin prisas. ❤️',
      extraHint: 'Busca donde nos sentamos a descansar, y fíjate bien en los cojines.',
      targetRoom: 'El Salón / Sofá'
    },
    {
      id: 'clue-3',
      stepNumber: 3,
      title: 'Tercera sorpresa 🎃🖤',
      locationRiddle: 'Quería prepararte algo con un poquito de espíritu de Halloween y algunos detalles que he elegido pensando en ti.\n\nEspero que te guste y que te saque una sonrisa, porque todavía me quedan cosas que quiero que descubras hoy.\n\nPara encontrar esta sorpresa, tendrás que salir un momento de casa, pero no hace falta que vayas muy lejos. Busca ese rincón donde podemos tomar el aire sin salir de nuestro hogar.\n\nAllí te espera algo. 👻❤️',
      extraHint: 'Busca en ese lugar de casa donde podemos estar al aire libre sin cruzar la puerta de la calle. ',
      targetRoom: 'La Terraza'
    },
    {
      id: 'clue-4',
      stepNumber: 4,
      title: 'Última sorpresa ❤️',
      locationRiddle: 'Y ahora sí, queda una última cosa por descubrir.\n\nQuería regalarte algo que puedas usar en tu día a día, que te guste de verdad y que, cuando te lo pongas, te acuerdes de que hoy también pensé en ti.\n\nPara encontrarlo, ve a ese lugar donde termina el día, nos ponemos cómodos y descansamos.\n\nMira bien, porque te espera algo más. ❤️',
      extraHint: 'La última sorpresa está donde descansamos cada noche. Esta vez, no tienes que buscar debajo de la almohada.',
      targetRoom: 'La habitación '
    }
  ],
  gifts: {
    booBasketTitle: '¡Tu Boo Basket de Cumpleaños! 🎃👻🍬',
    booBasketDescription: 'Una cesta temática hecha a mano con todo mi amor, llena de tus golosinas favoritas, chocolates y detalles dulces.',
    favoriteSnacks: [
      'Gominolas y regalices favoritos',
      'Chocolates y bombones gourmet',
      'Tus patatitas y snacks crujientes preferidos',
      'Chuches dulces especiales'
    ],
    sneakersTitle: '¡Tus nuevas New Balance 408! 👟✨',
    sneakersDescription: 'Las New Balance 408 que tanto querías, elegidas con todo el amor del mundo para acompañar cada uno de tus pasos, viajes y aventuras juntos.',
    personalCardMessage: 'Gracias por cada risa, cada mirada y cada momento a tu lado. Que este nuevo año te traiga todo lo que sueñas. ¡Te amo muchísimo, Naomi!'
  },
  secretPin: '0000'
};

const STORAGE_KEY = 'naomi_birthday_surprise_config_v5';
const PROGRESS_KEY = 'naomi_birthday_progress_v5';

export function loadConfig(): SurpriseConfig {
  try {
    // 1. First check explicit candidate keys in order of recency
    const candidateKeys = [
      'naomi_birthday_surprise_config_v5',
      'naomi_birthday_surprise_config_v4',
      'naomi_birthday_surprise_config_v3',
      'naomi_birthday_surprise_config_v2',
      'naomi_birthday_surprise_config_v1',
      'naomi_birthday_surprise_config'
    ];

    for (const key of candidateKeys) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            const merged = mergeWithDefaults(parsed);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          }
        } catch (parseErr) {
          console.warn('Error parsing key', key, parseErr);
        }
      }
    }

    // 2. Also search across any remaining localStorage keys for any stored configuration
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('naomi') || key.includes('surprise') || key.includes('config'))) {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (parsed && typeof parsed === 'object' && (parsed.clues || parsed.birthdayPin)) {
              const merged = mergeWithDefaults(parsed);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              return merged;
            }
          } catch {}
        }
      }
    }
  } catch (e) {
    console.warn('Error reading config from localStorage', e);
  }
  return DEFAULT_CONFIG;
}

export function mergeWithDefaults(parsed: any): SurpriseConfig {
  const merged = { ...DEFAULT_CONFIG, ...parsed };
  if (Array.isArray(parsed.clues) && parsed.clues.length > 0) {
    merged.clues = parsed.clues;
  }
  if (parsed.gifts) {
    merged.gifts = { 
      ...DEFAULT_CONFIG.gifts, 
      ...parsed.gifts,
      favoriteSnacks: Array.isArray(parsed.gifts.favoriteSnacks) 
        ? parsed.gifts.favoriteSnacks 
        : DEFAULT_CONFIG.gifts.favoriteSnacks
    };
  }
  return merged;
}

export async function fetchServerConfig(): Promise<SurpriseConfig | null> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data === 'object' && (data.clues || data.birthdayPin || data.gifts)) {
      return mergeWithDefaults(data);
    }
  } catch (e) {
    console.warn('Could not fetch server config', e);
  }
  return null;
}

export function saveConfig(config: SurpriseConfig, syncServer = true): void {
  try {
    const serialized = JSON.stringify(config);
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem('naomi_birthday_surprise_config_v4', serialized);
    localStorage.setItem('naomi_birthday_surprise_config_v3', serialized);
    localStorage.setItem('naomi_birthday_surprise_config', serialized);

    // Sync to backend so Naomi's phone automatically receives the updated configuration
    if (syncServer) {
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serialized
      }).catch(err => console.warn('Server sync error', err));
    }
  } catch (e) {
    console.error('Error saving config', e);
  }
}

export function loadCurrentStep(): number {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed === 0 || parsed === 1 || parsed === 2) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading progress', e);
  }
  return 0; // 0: Welcome, 1: Clues, 2: Final Reveal
}

export function saveCurrentStep(step: number): void {
  try {
    localStorage.setItem(PROGRESS_KEY, step.toString());
  } catch (e) {
    console.error('Error saving progress', e);
  }
}

export function resetProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch (e) {
    console.error('Error resetting progress', e);
  }
}
