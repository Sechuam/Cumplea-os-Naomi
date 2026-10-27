export interface Clue {
  id: string;
  stepNumber: number;
  title: string;
  locationRiddle: string;
  extraHint: string;
  targetRoom: string;
}

export interface GiftDetails {
  booBasketTitle: string;
  booBasketDescription: string;
  favoriteSnacks: string[];
  sneakersTitle: string;
  sneakersDescription: string;
  personalCardMessage: string;
}

export interface SurpriseConfig {
  recipientName: string;
  partnerName: string;
  welcomeGreeting: string;
  welcomeSubtitle: string;
  birthdayPin: string; // e.g. "2710" for 27 Octubre
  customQrUrl?: string; // Target URL for QR code
  videoMessageTitle?: string;
  videoExternalUrl?: string;
  hasCustomVideo?: boolean;
  clues: Clue[];
  gifts: GiftDetails;
  secretPin: string;
}
