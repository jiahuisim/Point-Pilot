import React from 'react';
import { usePoints } from '../context/PointsContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Plane, Hotel, CreditCard, AlertCircle, TrendingUp } from 'lucide-react';
import { ProgramType } from '../types';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

const Dashboard: React.FC = () => {
  const { programs, totalPoints } = usePoints();

  // Aggregate data for charts
  const dataByType = [
    { name: 'Airline', value: programs.filter(p => p.type === ProgramType.AIRLINE).reduce((acc, p) => acc + p.balance, 0) },
    { name: 'Hotel', value: programs.filter(p => p.type === ProgramType.HOTEL).reduce((acc, p) => acc + p.balance, 0) },
    { name: 'Credit Card', value: programs.filter(p => p.type === ProgramType.CREDIT_CARD).reduce((acc, p) => acc + p.balance, 0) },
    { name: 'Other', value: programs.filter(p => p.type === ProgramType.OTHER).reduce((acc, p) => acc + p.balance, 0) },
  ].filter(d => d.value > 0);

  // Check expirations (within 6 months)
  const today = new Date();
  const sixMonthsOut = new Date();
  sixMonthsOut.setMonth(today.getMonth() + 6);

  const expiringPrograms = programs.filter(p => {
    if (!p.expirationDate) return false;
    const expDate = new Date(p.expirationDate);
    return expDate > today && expDate <= sixMonthsOut;
  });

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Points Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <TrendingUp size={64} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Balance</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatNumber(totalPoints)}</h3>
          </div>
          <div className="mt-4 text-xs text-slate-400">Across {programs.length} programs</div>
        </div>

        {/* Expiration Alert Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10 text-red-500">
            <AlertCircle size={64} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Expiring Soon</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{expiringPrograms.length}</h3>
          </div>
          <div className="mt-4 space-y-2">
            {expiringPrograms.length === 0 ? (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                 All points are safe!
              </span>
            ) : (
              expiringPrograms.slice(0, 2).map(p => (
                <div key={p.id} className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {p.provider} {p.name}: {p.expirationDate}
                </div>
              ))
            )}
          </div>
        </div>

         {/* Top Benefit Card (Mock) */}
         <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-md text-white flex flex-col justify-between relative overflow-hidden">
           <div>
            <p className="text-sm font-medium text-indigo-100">Top Benefit Value</p>
            <h3 className="text-xl font-bold mt-1">Lounge Access</h3>
            <p className="text-xs text-indigo-200 mt-1">Available on {programs.filter(p => p.benefits.some(b => b.title.toLowerCase().includes('lounge') || b.title.toLowerCase().includes('priority'))).length} cards</p>
           </div>
           <button className="mt-4 bg-white/20 hover:bg-white/30 transition px-3 py-1.5 rounded-lg text-xs font-semibold w-fit">
             View All Benefits
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Portfolio Allocation</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => formatNumber(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent/Highlights List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Program Highlights</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {programs.slice(0, 5).map(program => (
              <div key={program.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    program.type === ProgramType.AIRLINE ? 'bg-sky-100 text-sky-600' :
                    program.type === ProgramType.HOTEL ? 'bg-orange-100 text-orange-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {program.type === ProgramType.AIRLINE ? <Plane size={16} /> :
                     program.type === ProgramType.HOTEL ? <Hotel size={16} /> :
                     <CreditCard size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{program.provider}</p>
                    <p className="text-xs text-slate-500">{program.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-700">{formatNumber(program.balance)}</p>
                  <p className="text-[10px] text-slate-400 uppercase">{program.currencyName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
