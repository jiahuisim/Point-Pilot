import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Program, ProgramType, Benefit, BenefitType } from '../types';

interface PointsContextType {
  programs: Program[];
  addProgram: (program: Program) => void;
  updateProgram: (id: string, updates: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  getProgramById: (id: string) => Program | undefined;
  totalPoints: number;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

const MOCK_PROGRAMS: Program[] = [
  {
    id: '1',
    name: 'Sapphire Reserve',
    provider: 'Chase',
    type: ProgramType.CREDIT_CARD,
    balance: 125430,
    currencyName: 'UR Points',
    lastUpdated: new Date().toISOString(),
    expirationDate: undefined,
    benefits: [
      { id: 'b1', type: BenefitType.TRAVEL_CREDIT, title: '$300 Travel Credit', description: 'Annual reimbursement for travel purchases.', value: 300 },
      { id: 'b2', type: BenefitType.LOUNGE_ACCESS, title: 'Priority Pass Select', description: 'Access to airport lounges worldwide.' },
      { id: 'b3', type: BenefitType.GENERIC, title: 'TSA PreCheck/Global Entry Credit', description: 'Up to $100 statement credit every 4 years.', value: 100 }
    ]
  },
  {
    id: '2',
    name: 'SkyMiles',
    provider: 'Delta',
    type: ProgramType.AIRLINE,
    balance: 45200,
    currencyName: 'Miles',
    lastUpdated: new Date().toISOString(),
    expirationDate: undefined, 
    benefits: [
      { id: 'b4', type: BenefitType.STATUS, title: 'Main Cabin 1 Boarding', description: 'Board early with Main Cabin 1.' }
    ]
  },
  {
    id: '3',
    name: 'Bonvoy Boundless',
    provider: 'Marriott',
    type: ProgramType.HOTEL,
    balance: 85000,
    currencyName: 'Points',
    lastUpdated: new Date().toISOString(),
    expirationDate: '2025-12-31', 
    benefits: [
      { id: 'b5', type: BenefitType.FREE_NIGHT, title: 'Free Night Award (35k)', description: 'One free night up to 35k points.', count: 1, expirationDate: '2024-11-30', value: 200 },
      { id: 'b6', type: BenefitType.STATUS, title: 'Silver Elite Status', description: '10% bonus points on stays.' }
    ]
  },
  {
    id: '4',
    name: 'Mileage Plan',
    provider: 'Alaska Airlines',
    type: ProgramType.AIRLINE,
    balance: 12000,
    currencyName: 'Miles',
    lastUpdated: new Date().toISOString(),
    expirationDate: undefined,
    benefits: [
      { id: 'b7', type: BenefitType.COMPANION_FARE, title: 'Famous Companion Fare', description: 'Buy one ticket, get one for $99 + taxes.', count: 1, expirationDate: '2024-10-15', value: 400 }
    ]
  }
];

export const PointsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [programs, setPrograms] = useState<Program[]>(() => {
    const saved = localStorage.getItem('points_pilot_programs');
    return saved ? JSON.parse(saved) : MOCK_PROGRAMS;
  });

  useEffect(() => {
    localStorage.setItem('points_pilot_programs', JSON.stringify(programs));
  }, [programs]);

  const addProgram = (program: Program) => {
    setPrograms(prev => [...prev, program]);
  };

  const updateProgram = (id: string, updates: Partial<Program>) => {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProgram = (id: string) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
  };

  const getProgramById = (id: string) => programs.find(p => p.id === id);

  const totalPoints = programs.reduce((sum, p) => sum + p.balance, 0);

  return (
    <PointsContext.Provider value={{ programs, addProgram, updateProgram, deleteProgram, getProgramById, totalPoints }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};