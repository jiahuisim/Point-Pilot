export enum ProgramType {
  AIRLINE = 'Airline',
  HOTEL = 'Hotel',
  CREDIT_CARD = 'Credit Card',
  OTHER = 'Other'
}

export enum BenefitType {
  GENERIC = 'Generic',
  FREE_NIGHT = 'Free Night',
  COMPANION_FARE = 'Companion Fare',
  TRAVEL_CREDIT = 'Travel Credit',
  DINING_CREDIT = 'Dining Credit',
  RIDE_CREDIT = 'Ride Credit',
  LOUNGE_ACCESS = 'Lounge Access',
  INSURANCE = 'Insurance',
  STATUS = 'Status'
}

export interface Benefit {
  id: string;
  title: string;
  description?: string;
  value?: number; // Estimated monetary value
  type: BenefitType;
  count?: number; // e.g. 2 Free Night Awards
  expirationDate?: string; // Specific expiration for this benefit
}

export interface Program {
  id: string;
  name: string;
  provider: string; // e.g., "Chase", "Delta"
  type: ProgramType;
  balance: number;
  currencyName: string; // e.g., "Miles", "Points", "Avios"
  expirationDate?: string; // ISO Date string YYYY-MM-DD
  benefits: Benefit[];
  notes?: string;
  lastUpdated: string;
}

export interface ParsedProgramData {
  programName: string;
  provider: string;
  balance: number;
  expirationDate?: string;
  currencyName: string;
  type: string;
  benefits?: {
    title: string;
    description?: string;
    type: string;
    count?: number;
    expirationDate?: string;
  }[];
}