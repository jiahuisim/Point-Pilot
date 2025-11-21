import React, { useState } from 'react';
import { PointsProvider } from './context/PointsContext';
import Dashboard from './components/Dashboard';
import ProgramList from './components/ProgramList';
import AIAdvisor from './components/AIAdvisor';
import AIAddModal from './components/AIAddModal';
import { LayoutDashboard, CreditCard, MessageSquareMore, Plus, LogOut } from 'lucide-react';

type View = 'dashboard' | 'programs' | 'advisor';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: View; icon: any; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left ${
        currentView === view
          ? 'bg-indigo-50 text-indigo-600 font-semibold'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <PointsProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                 P
               </div>
               PointsPilot
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="programs" icon={CreditCard} label="My Programs" />
            <NavItem view="advisor" icon={MessageSquareMore} label="AI Advisor" />
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-600 w-full text-left text-sm">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Mobile Nav (Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-20 flex justify-around shadow-lg">
          <button onClick={() => setCurrentView('dashboard')} className={`p-2 rounded-full ${currentView === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <LayoutDashboard size={24} />
          </button>
          <button onClick={() => setCurrentView('programs')} className={`p-2 rounded-full ${currentView === 'programs' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <CreditCard size={24} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="p-3 -mt-8 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200">
            <Plus size={24} />
          </button>
          <button onClick={() => setCurrentView('advisor')} className={`p-2 rounded-full ${currentView === 'advisor' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'}`}>
            <MessageSquareMore size={24} />
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {/* Mobile Header */}
          <div className="md:hidden mb-6 flex items-center justify-between">
            <div className="text-indigo-600 font-bold text-lg">PointsPilot</div>
            <div className="text-xs text-slate-400">v1.0</div>
          </div>

          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                {currentView === 'dashboard' && 'Financial Dashboard'}
                {currentView === 'programs' && 'Program Management'}
                {currentView === 'advisor' && 'Rewards Advisor'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {currentView === 'dashboard' && 'Overview of your loyalty portfolio.'}
                {currentView === 'programs' && 'Manage, edit, and track your accounts.'}
                {currentView === 'advisor' && 'Ask Gemini to optimize your points.'}
              </p>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg transition font-medium shadow-sm hover:shadow"
            >
              <Plus size={18} />
              Add Program
            </button>
          </header>

          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'programs' && <ProgramList />}
          {currentView === 'advisor' && <AIAdvisor />}
        </main>

        <AIAddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </PointsProvider>
  );
};

export default App;
