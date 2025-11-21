import React, { useState } from 'react';
import { usePoints } from '../context/PointsContext';
import { Program, ProgramType } from '../types';
import { Trash2, Edit2, Plane, Hotel, CreditCard, Gift, MoreVertical, AlertTriangle } from 'lucide-react';

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

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return 'Never';
    return new Date(isoDate).toLocaleDateString();
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
                  <p className="text-slate-400 text-xs mb-1">Expires</p>
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

              {/* Benefits Expansion (Simple list for now) */}
              {program.benefits.length > 0 && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2">
                  {program.benefits.map((b, idx) => (
                    <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {b.title}
                    </span>
                  ))}
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
