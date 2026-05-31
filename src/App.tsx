import { useState } from 'react';
import { useFlowrStore } from './store';
import { ZoneBoard } from './components/zone/ZoneBoard';
import { FlowGuardian } from './components/zone/FlowGuardian';
import { TransitionBuffer } from './components/zone/TransitionBuffer';
import { WhiplashAnalytics } from './components/dashboard/WhiplashAnalytics';
import { ShieldAlert, Compass, TrendingUp, Cpu, Award } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'analytics'>('board');
  
  // Guard triggers from store
  const isGuardianActive = useFlowrStore((state) => state.isGuardianActive);
  const isBufferActive = useFlowrStore((state) => state.isBufferActive);
  const switches = useFlowrStore((state) => state.switches);

  const totalSwitches = switches.length;
  const timeLostMinutes = totalSwitches * 15;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. FLOW GUARDIAN OVERLAY GUARD */}
      {isGuardianActive && <FlowGuardian />}

      {/* 2. TRANSITION BUFFER RESTORATION GUARD */}
      {isBufferActive && <TransitionBuffer />}

      {/* 3. MAIN WORKSPACE APP BAR */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand-500/10 p-2 rounded-xl border border-brand-500/20 text-brand-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
            <Cpu size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-100 flex items-center gap-1.5 m-0">
              <span>FLOWR</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20 text-brand-400">
                v1.0 Beta
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium tracking-wide">
              COGNITIVE CONTEXT SHIELD
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
              activeTab === 'board'
                ? 'bg-slate-800 text-brand-400 border border-slate-700/50 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Compass size={14} />
            <span>My Board</span>
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 relative ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-brand-400 border border-slate-700/50 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <TrendingUp size={14} />
            <span>Whiplash Analytics</span>
            
            {/* Alarm indicator if switches exceed 3 */}
            {totalSwitches >= 3 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-whiplash-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-whiplash-500"></span>
              </span>
            )}
          </button>
        </nav>

        {/* Workspace Quick Switch warning */}
        <div className="hidden md:flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
            totalSwitches >= 3
              ? 'bg-whiplash-500/10 border-whiplash-500/20 text-whiplash-400'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <ShieldAlert size={14} className={totalSwitches >= 3 ? 'animate-bounce text-whiplash-500' : ''} />
            <span className="text-[11px] font-bold">
              {totalSwitches >= 3 
                ? `Whiplash Warning: ${timeLostMinutes}m lost` 
                : 'Cognitive shield: Stable'}
            </span>
          </div>
        </div>
      </header>

      {/* 4. MAIN LAYOUT AREA */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col overflow-hidden">
        {activeTab === 'board' ? <ZoneBoard /> : <WhiplashAnalytics />}
      </main>

      {/* 5. Sleek Footnote */}
      <footer className="border-t border-slate-900/60 py-4 px-6 text-center bg-slate-950/30 flex flex-col md:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <p className="text-[10px] text-slate-500">
          FLOWR © 2026. Made with Google DeepMind Antigravity framework.
        </p>
        <div className="flex items-center gap-1 text-[10px] text-slate-600">
          <Award size={12} className="text-brand-500/60" />
          <span>Active context protection protects 40% of executive function capacity.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
