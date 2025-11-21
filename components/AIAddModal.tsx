import React, { useState } from 'react';
import { parseProgramFromText } from '../services/geminiService';
import { usePoints } from '../context/PointsContext';
import { Program, ProgramType } from '../types';
import { X, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // We'll simulate UUID since no package

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

interface AIAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAddModal: React.FC<AIAddModalProps> = ({ isOpen, onClose }) => {
  const { addProgram } = usePoints();
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual Form State
  const [manualData, setManualData] = useState<Partial<Program>>({
    type: ProgramType.CREDIT_CARD,
    currencyName: 'Points'
  });

  if (!isOpen) return null;

  const handleAIParse = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const parsedData = await parseProgramFromText(inputText);
      
      // Transform parsed data to internal Program model
      const newProgram: Program = {
        id: generateId(),
        name: parsedData.programName || 'Unknown Program',
        provider: parsedData.provider || 'Unknown Provider',
        type: parsedData.type as ProgramType || ProgramType.OTHER,
        balance: parsedData.balance || 0,
        currencyName: parsedData.currencyName || 'Points',
        expirationDate: parsedData.expirationDate || undefined,
        lastUpdated: new Date().toISOString(),
        benefits: (parsedData.benefits || []).map((b: string, idx: number) => ({
          id: `b-${idx}`,
          title: b,
          description: 'Extracted by AI'
        }))
      };

      addProgram(newProgram);
      onClose();
      setInputText('');
    } catch (err) {
      setError("Couldn't parse the text. Please try providing more details or switch to manual mode.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProgram: Program = {
      id: generateId(),
      name: manualData.name || 'New Program',
      provider: manualData.provider || 'Provider',
      type: manualData.type || ProgramType.OTHER,
      balance: Number(manualData.balance) || 0,
      currencyName: manualData.currencyName || 'Points',
      lastUpdated: new Date().toISOString(),
      expirationDate: manualData.expirationDate,
      benefits: []
    };
    addProgram(newProgram);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {mode === 'ai' ? <Sparkles size={18} className="text-indigo-500"/> : null}
            Add Program
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-100 m-4 rounded-lg">
          <button 
            onClick={() => setMode('ai')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'ai' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            AI Magic Paste
          </button>
          <button 
             onClick={() => setMode('manual')}
             className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === 'manual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            Manual Entry
          </button>
        </div>

        <div className="p-6 pt-2">
          {mode === 'ai' ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Paste an email summary, a text message, or just type details like "I have 50k points on my Chase Sapphire Reserve expiring never".
              </p>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste details here..."
                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
              />
              
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <button
                onClick={handleAIParse}
                disabled={isLoading || !inputText}
                className="w-full py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18} />}
                {isLoading ? 'Analyzing...' : 'Extract & Add'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3">
               <div>
                 <label className="block text-xs font-medium text-slate-700 mb-1">Provider</label>
                 <input 
                    required
                    type="text" 
                    placeholder="e.g. Chase, Delta"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    onChange={e => setManualData({...manualData, provider: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-xs font-medium text-slate-700 mb-1">Program Name</label>
                 <input 
                    required
                    type="text" 
                    placeholder="e.g. Sapphire Reserve"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    onChange={e => setManualData({...manualData, name: e.target.value})}
                 />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                    <select 
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      onChange={e => setManualData({...manualData, type: e.target.value as ProgramType})}
                    >
                      <option value={ProgramType.CREDIT_CARD}>Credit Card</option>
                      <option value={ProgramType.AIRLINE}>Airline</option>
                      <option value={ProgramType.HOTEL}>Hotel</option>
                      <option value={ProgramType.OTHER}>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Balance</label>
                    <input 
                        required
                        type="number" 
                        placeholder="0"
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        onChange={e => setManualData({...manualData, balance: Number(e.target.value)})}
                    />
                  </div>
               </div>
               <div>
                 <label className="block text-xs font-medium text-slate-700 mb-1">Expiration Date (Optional)</label>
                 <input 
                    type="date" 
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    onChange={e => setManualData({...manualData, expirationDate: e.target.value})}
                 />
               </div>
               <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 mt-2 transition"
              >
                Add Program
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAddModal;
