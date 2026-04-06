import React from 'react';
import Sidebar from './components/Sidebar';
import CommandCenter from './components/CommandCenter';
import KanbanBoard from './components/KanbanBoard';
import ProfilesManager from './components/ProfilesManager';
import { useUIStore } from './store/uiStore';

export default function App() {
  const { activeTab } = useUIStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'command-center':
        return <CommandCenter />;
      case 'kanban':
        return <KanbanBoard />;
      case 'profiles':
        return <ProfilesManager />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-stone-500 flex-col gap-8">
            <div className="p-16 glass-panel rounded-[40px] flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-white/[0.03] rounded-3xl flex items-center justify-center border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.3)]">
                <div className="w-10 h-10 border-4 border-[#c5a059]/20 border-t-[#c5a059] rounded-full animate-spin shadow-[0_0_30px_rgba(197,160,89,0.4)]" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black text-stone-100 tracking-tighter text-glow">Module Initializing</h2>
                <p className="text-stone-400 mt-2 font-black uppercase tracking-[0.2em] text-[10px]">The {activeTab} console is being prepared...</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans selection:bg-[#c5a059]/30 selection:text-[#e2d1c3]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative scrollbar-hide">
        {/* Top Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[#c5a059]/10 blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
