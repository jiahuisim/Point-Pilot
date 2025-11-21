import React, { useState } from 'react';
import { usePoints } from '../context/PointsContext';
import { Program, ProgramType, BenefitType } from '../types';
import { Trash2, Plane, Hotel, CreditCard, Gift, AlertTriangle, Moon, Ticket, Armchair, Sparkles, Utensils, Car, Wallet } from 'lucide-react';

const ProgramList: React.FC = () => {
  const { programs, deleteProgram } = usePoints();
  const [filter, setFilter] = useState<string>('All');

  const filteredPrograms = filter === 'All' 
    ? programs 
    : programs.filter(p => p.type === filter);

  const getIcon = (type: ProgramType) => {
    switch(type) {
      case ProgramType.AIRLINE: return <Plane size={18} />;
      case ProgramType.HOTEL: return <Hotel size={18} />;
      case ProgramType.CREDIT_CARD: return <CreditCard size={18} />;
      default: return <Gift size={18} />;
    }
  };

  const getBenefitIcon = (type: BenefitType) => {
    switch(type) {
      case BenefitType.FREE_NIGHT: return <Moon size={14} />;
      case BenefitType.COMPANION_FARE: return <Ticket size={14} />;
      case BenefitType.LOUNGE_ACCESS: return <Armchair size={14} />;
      case BenefitType.STATUS: return <Sparkles size={14} />;
      case BenefitType.DINING_CREDIT: return <Utensils size={14} />;
      case BenefitType.RIDE_CREDIT: return <Car size={14} />;
      case BenefitType.TRAVEL_CREDIT: return <Wallet size={14} />;
      default: return <Gift size={14} />;
    }
  };

  const getBenefitStyle = (type: BenefitType) => {
    switch(type) {
      case BenefitType.FREE_NIGHT: return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
      case BenefitType.COMPANION_FARE: return 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100';
      case BenefitType.TRAVEL_CREDIT: return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case BenefitType.DINING_CREDIT: return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100';
      case BenefitType.RIDE_CREDIT: return 'bg-slate-800 text-white border-slate-700';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
    }
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return 'Never';
    return new Date(isoDate).toLocaleDateString();
  };

  const isExpiringSoon = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const date = new Date(dateStr);
    const threeMonths = new Date();
    threeMonths.setMonth(today.getMonth() + 3);
    return date > today && date <= threeMonths;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">My Programs</h2>
        
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          {['All', ProgramType.CREDIT_CARD, ProgramType.AIRLINE, ProgramType.HOTEL].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                filter === type 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPrograms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400">No programs found in this category.</p>
          </div>
        ) : (
          filteredPrograms.map(program => (
            <div key={program.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition group">
              <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                
                {/* Icon & Main Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    program.type === ProgramType.AIRLINE ? 'bg-sky-100 text-sky-600' :
                    program.type === ProgramType.HOTEL ? 'bg-orange-100 text-orange-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {getIcon(program.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{program.provider}</h3>
                    <p className="text-slate-500 text-sm">{program.name}</p>
                  </div>
                </div>

                {/* Balance */}
                <div className="flex-1 sm:text-right">
                  <p className="text-2xl font-bold text-slate-800 tracking-tight">
                    {new Intl.NumberFormat('en-US').format(program.balance)}
                  </p>
                  <p className="text-xs text-slate-400 uppercase font-medium">{program.currencyName}</p>
                </div>

                {/* Expiration */}
                <div className="w-full sm:w-32 text-sm">
                  <p className="text-slate-400 text-xs mb-1">Points Expiration</p>
                  <div className={`flex items-center gap-1.5 font-medium ${program.expirationDate ? 'text-slate-700' : 'text-green-600'}`}>
                     {program.expirationDate && <AlertTriangle size={14} className="text-orange-400"/>}
                     {formatDate(program.expirationDate)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:border-l sm:pl-6 border-slate-100">
                  <button 
                    onClick={() => deleteProgram(program.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete Program"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Benefits Expansion */}
              {program.benefits.length > 0 && (
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Benefits, Credits & Certificates</p>
                    <span className="text-xs text-slate-400">{program.benefits.length} items</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {program.benefits.map((b, idx) => {
                       const expiring = isExpiringSoon(b.expirationDate);
                       return (
                        <div key={idx} className={`flex flex-col p-3 rounded-lg border transition-all ${getBenefitStyle(b.type)}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-1.5 font-bold text-sm">
                              {getBenefitIcon(b.type)}
                              {b.count && b.count > 1 && <span className="bg-white/80 backdrop-blur px-1.5 py-0.5 rounded text-xs shadow-sm">{b.count}x</span>}
                            </div>
                            {b.expirationDate && (
                              <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${expiring ? 'bg-red-100 text-red-600' : 'bg-white/50 text-slate-600'}`}>
                                {expiring && <AlertTriangle size={10}/>}
                                {new Date(b.expirationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                          </div>
                          <div className="font-semibold text-sm mb-1 leading-tight">{b.title}</div>
                          {b.description && <p className="text-xs opacity-80 line-clamp-2">{b.description}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProgramList;