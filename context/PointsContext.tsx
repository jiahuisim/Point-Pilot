import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Program, ProgramType, Benefit } from '../types';

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
      { id: 'b1', title: '$300 Travel Credit', description: 'Annual reimbursement for travel purchases.' },
      { id: 'b2', title: 'Priority Pass Select', description: 'Access to airport lounges worldwide.' },
      { id: 'b3', title: 'TSA PreCheck/Global Entry Credit', description: 'Up to $100 statement credit every 4 years.' }
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
    expirationDate: undefined, // Delta miles don't expire
    benefits: [
      { id: 'b4', title: 'Main Cabin 1 Boarding', description: 'Board early with Main Cabin 1.' }
    ]
  },
  {
    id: '3',
    name: 'Marriott Bonvoy',
    provider: 'Marriott',
    type: ProgramType.HOTEL,
    balance: 85000,
    currencyName: 'Points',
    lastUpdated: new Date().toISOString(),
    expirationDate: '2025-12-31', 
    benefits: [
      { id: 'b5', title: 'Free Night Award', description: 'One free night up to 35k points.' }
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
