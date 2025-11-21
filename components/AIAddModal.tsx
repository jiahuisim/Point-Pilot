import React, { useState } from 'react';
import { parseProgramFromText } from '../services/geminiService';
import { usePoints } from '../context/PointsContext';
import { Program, ProgramType, Benefit, BenefitType } from '../types';
import { X, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';

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
  
  // Manual Benefits State
  const [manualBenefits, setManualBenefits] = useState<Benefit[]>([]);
  const [newBenefit, setNewBenefit] = useState<Partial<Benefit>>({
    type: BenefitType.GENERIC,
    title: '',
    count: 1
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
        benefits: (parsedData.benefits || []).map((b: any, idx: number) => ({
          id: `b-${idx}`,
          title: b.title,
          description: b.description || 'Extracted by AI',
          type: b.type as BenefitType || BenefitType.GENERIC,
          count: b.count || 1,
          expirationDate: b.expirationDate
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

  const addManualBenefit = () => {
    if (!newBenefit.title) return;
    setManualBenefits(prev => [...prev, {
      id: generateId(),
      title: newBenefit.title!,
      type: newBenefit.type as BenefitType,
      count: newBenefit.count || 1,
      description: newBenefit.description,
      expirationDate: newBenefit.expirationDate
    }]);
    setNewBenefit({ type: BenefitType.GENERIC, title: '', count: 1, description: '', expirationDate: '' });
  };

  const removeManualBenefit = (id: string) => {
    setManualBenefits(prev => prev.filter(b => b.id !== id));
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
      benefits: manualBenefits
    };
    addProgram(newProgram);
    onClose();
    // Reset
    setManualData({ type: ProgramType.CREDIT_CARD, currencyName: 'Points' });
    setManualBenefits([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 overflow-hidden animate-scale-in">
        
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

        <div className="p-6 pt-2 max-h-[70vh] overflow-y-auto">
          {mode === 'ai' ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Paste a message like: "I have an Alaska card with 12k miles and a Companion Fare expiring next month."
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
            <form onSubmit={handleManualSubmit} className="space-y-4">
               {/* Basic Info */}
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1">Provider</label>
                   <input 
                      required
                      type="text" 
                      placeholder="e.g. Chase"
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      onChange={e => setManualData({...manualData, provider: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1">Program Name</label>
                   <input 
                      required
                      type="text" 
                      placeholder="e.g. Sapphire"
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      onChange={e => setManualData({...manualData, name: e.target.value})}
                   />
                 </div>
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

               {/* Benefits Section */}
               <div className="border-t border-slate-100 pt-4">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Benefits & Credits</label>
                  
                  {manualBenefits.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {manualBenefits.map(b => (
                        <div key={b.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-sm border border-slate-100">
                           <div className="flex items-center gap-2">
                             <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                               b.type === BenefitType.FREE_NIGHT ? 'bg-indigo-100 text-indigo-700' : 
                               b.type === BenefitType.COMPANION_FARE ? 'bg-pink-100 text-pink-700' : 'bg-slate-200 text-slate-600'
                             }`}>{b.type}</span>
                             <span className="font-medium text-slate-700">{b.count && b.count > 1 ? `(${b.count}) ` : ''}{b.title}</span>
                           </div>
                           <button type="button" onClick={() => removeManualBenefit(b.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                     <div className="flex gap-2">
                        <select 
                          className="w-1/3 p-2 border border-slate-300 rounded-lg text-xs"
                          value={newBenefit.type}
                          onChange={e => setNewBenefit({...newBenefit, type: e.target.value as BenefitType})}
                        >
                          <option value={BenefitType.GENERIC}>Generic</option>
                          <option value={BenefitType.FREE_NIGHT}>Free Night</option>
                          <option value={BenefitType.COMPANION_FARE}>Comp. Fare</option>
                          <option value={BenefitType.TRAVEL_CREDIT}>Credit</option>
                          <option value={BenefitType.LOUNGE_ACCESS}>Lounge</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Benefit Name (e.g. Annual Free Night)" 
                          className="flex-1 p-2 border border-slate-300 rounded-lg text-xs"
                          value={newBenefit.title}
                          onChange={e => setNewBenefit({...newBenefit, title: e.target.value})}
                        />
                     </div>
                     <div className="flex gap-2">
                        <input 
                           type="number" 
                           placeholder="Qty" 
                           className="w-16 p-2 border border-slate-300 rounded-lg text-xs"
                           value={newBenefit.count}
                           onChange={e => setNewBenefit({...newBenefit, count: Number(e.target.value)})}
                        />
                        <input 
                           type="date" 
                           className="flex-1 p-2 border border-slate-300 rounded-lg text-xs"
                           value={newBenefit.expirationDate || ''}
                           onChange={e => setNewBenefit({...newBenefit, expirationDate: e.target.value})}
                        />
                        <button 
                          type="button" 
                          onClick={addManualBenefit}
                          disabled={!newBenefit.title}
                          className="px-3 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Add
                        </button>
                     </div>
                  </div>
               </div>

               <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 mt-4 transition"
              >
                Save Program
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAddModal;