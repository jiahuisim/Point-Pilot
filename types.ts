export enum ProgramType {
  AIRLINE = 'Airline',
  HOTEL = 'Hotel',
  CREDIT_CARD = 'Credit Card',
  OTHER = 'Other'
}

export interface Benefit {
  id: string;
  title: string;
  description?: string;
  value?: number; // Estimated monetary value
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
  benefits: string[]; // Simple string list from AI initially
  type: string;
}
