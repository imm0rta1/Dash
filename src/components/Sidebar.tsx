import React, { useState, useRef } from 'react';
import { 
  LayoutDashboard, 
  Trello, 
  PlayCircle, 
  CheckSquare, 
  ShoppingBag, 
  Zap, 
  Database, 
  Settings,
  Menu,
  ChevronLeft,
  Users,
  Camera,
  Edit3,
  X,
  Check,
  Sparkles,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUIStore } from '../store/uiStore';
import { cn } from '../lib/utils';
import { Button, GlassPanel } from './ui/GlassComponents';

const navItems = [
  { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
  { id: 'kanban', label: 'Task Board', icon: Trello },
  { id: 'runs', label: 'Run Monitor', icon: PlayCircle },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare },
  { id: 'profiles', label: 'Agent Profiles', icon: Users },
  { id: 'etsy-ops', label: 'Etsy Ops', icon: ShoppingBag },
  { id: 'automations', label: 'Automations', icon: Zap },
  { id: 'memory', label: 'Memory & Skills', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
];

const PRESET_LOGOS = [
  'https://api.dicebear.com/7.x/shapes/svg?seed=Hermes',
  'https://api.dicebear.com/7.x/shapes/svg?seed=Apollo',
  'https://api.dicebear.com/7.x/shapes/svg?seed=Zeus',
  'https://api.dicebear.com/7.x/shapes/svg?seed=Athena',
];

export default function Sidebar() {
  const { 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    activeTab, 
    setActiveTab,
    dashboardTitle,
    setDashboardTitle,
    userName,
    setUserName,
    userAvatar,
    setUserAvatar
  } = useUIStore();
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(dashboardTitle);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLogoSettings, setShowLogoSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      setDashboardTitle(tempTitle.toUpperCase());
    } else {
      setTempTitle(dashboardTitle);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTitleSubmit();
    if (e.key === 'Escape') {
      setTempTitle(dashboardTitle);
      setIsEditingTitle(false);
    }
  };

  const handleProfileSave = () => {
    setUserName(tempName);
    setShowProfileSettings(false);
  };

  const generateNewAvatar = () => {
    setIsGenerating(true);
    // Simulate generation with a random seed
    const randomSeed = Math.random().toString(36).substring(7);
    setTimeout(() => {
      setUserAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
      setIsGenerating(false);
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        useUIStore.getState().setDashboardLogo(reader.result as string);
        setShowLogoSettings(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <aside 
        className={cn(
          "bg-stone-950/40 backdrop-blur-3xl border-r border-white/10 transition-all duration-700 flex flex-col h-screen sticky top-0 z-40 shadow-[20px_0_50px_rgba(0,0,0,0.5),inset_-1px_0_0_rgba(255,255,255,0.05)]",
          sidebarCollapsed ? "w-24" : "w-80"
        )}
      >
        <div className="p-8 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-4 group/title cursor-pointer relative">
              <div 
                className="w-10 h-10 bg-[#c5a059] rounded-xl flex items-center justify-center shadow-[0_10px_20px_rgba(197,160,89,0.4),inset_0_1px_0_rgba(255,255,255,0.4)] shrink-0 transition-transform group-hover/title:scale-110 duration-500 overflow-hidden relative"
                onClick={() => setShowLogoSettings(true)}
              >
                {useUIStore.getState().dashboardLogo ? (
                  <img src={useUIStore.getState().dashboardLogo!} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Zap size={22} className="text-stone-950" fill="currentColor" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/title:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit3 size={14} className="text-white" />
                </div>
              </div>
              {isEditingTitle ? (
                <input
                  autoFocus
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={handleKeyDown}
                  className="bg-white/5 border border-[#c5a059]/30 rounded-lg px-3 py-1 text-white font-black text-xl tracking-tighter italic w-full outline-none shadow-inner"
                />
              ) : (
                <span 
                  onClick={() => {
                    setTempTitle(dashboardTitle);
                    setIsEditingTitle(true);
                  }}
                  className="font-black text-stone-100 text-2xl tracking-tighter italic hover:text-[#c5a059] transition-all duration-500 text-glow"
                >
                  {dashboardTitle}
                </span>
              )}
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2.5 hover:bg-white/5 rounded-2xl transition-all text-stone-500 hover:text-stone-200 border border-transparent hover:border-white/5"
          >
            {sidebarCollapsed ? <Menu size={22} /> : <ChevronLeft size={22} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center p-4 rounded-[20px] transition-all duration-500 relative group overflow-hidden",
                activeTab === item.id 
                  ? "bg-stone-800/60 text-[#c5a059] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.2)] border border-[#c5a059]/30" 
                  : "text-stone-500 hover:bg-white/[0.05] hover:text-stone-300 border border-transparent hover:border-white/10"
              )}
            >
              <item.icon size={22} className={cn(sidebarCollapsed ? "mx-auto" : "mr-5")} />
              {!sidebarCollapsed && (
                <span className="font-bold tracking-tight text-sm">{item.label}</span>
              )}
              {activeTab === item.id && !sidebarCollapsed && (
                <div className="absolute right-5 w-2 h-2 rounded-full bg-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,1)]" />
              )}
              {sidebarCollapsed && (
                <div className="absolute left-24 bg-stone-900 border border-white/10 text-white px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-15px] group-hover:translate-x-0 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10">
          {!sidebarCollapsed && (
            <div className="bg-stone-900/50 rounded-[24px] p-5 border border-white/10 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative group/profile">
              <button 
                onClick={() => {
                  setTempName(userName);
                  setShowProfileSettings(true);
                }}
                className="absolute top-4 right-4 p-2 text-stone-600 hover:text-[#c5a059] opacity-0 group-hover/profile:opacity-100 transition-all hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5"
              >
                <Edit3 size={14} />
              </button>
              
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#c5a059] to-[#8c7851] p-0.5 shadow-lg relative">
                  <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center overflow-hidden border border-white/10">
                    <img src={userAvatar} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <button 
                    onClick={() => setShowProfileSettings(true)}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-stone-900 border border-white/10 rounded-full flex items-center justify-center text-[#c5a059] hover:text-white transition-colors shadow-lg"
                  >
                    <Camera size={10} />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-black text-stone-100 tracking-tight">{userName}</p>
                  <p className="text-[10px] text-stone-600 font-black tracking-widest uppercase">v1.2.4-stable</p>
                </div>
              </div>
              <button className="w-full py-3 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 hover:text-stone-200 transition-all border border-white/5">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      <AnimatePresence>
        {showLogoSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoSettings(false)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md"
            >
              <GlassPanel className="p-8 border-2 border-[#c5a059]/30 shadow-[0_0_80px_rgba(197,160,89,0.2)] rounded-[40px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-stone-100 tracking-tighter uppercase italic">Dashboard Logo</h3>
                  <button 
                    onClick={() => setShowLogoSettings(false)}
                    className="p-2 text-stone-500 hover:text-stone-100 hover:bg-white/5 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] block">Choose Logo</label>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => logoInputRef.current?.click()}
                          className="flex items-center gap-2 text-[10px] font-black text-[#c5a059] uppercase tracking-widest hover:text-white transition-colors"
                        >
                          <Upload size={12} />
                          Upload Custom
                        </button>
                        <input 
                          type="file"
                          ref={logoInputRef}
                          onChange={handleLogoChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      {PRESET_LOGOS.map((logo, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            useUIStore.getState().setDashboardLogo(logo);
                            setShowLogoSettings(false);
                          }}
                          className={cn(
                            "aspect-square rounded-2xl overflow-hidden border-2 transition-all p-2",
                            useUIStore.getState().dashboardLogo === logo 
                              ? "border-[#c5a059] bg-[#c5a059]/10 shadow-[0_0_20px_rgba(197,160,89,0.3)]" 
                              : "border-white/5 bg-stone-950 hover:border-white/20"
                          )}
                        >
                          <img src={logo} alt={`logo-${idx}`} className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5">
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        useUIStore.getState().setDashboardLogo(null);
                        setShowLogoSettings(false);
                      }}
                      className="w-full"
                    >
                      Reset to Default Icon
                    </Button>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileSettings(false)}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md"
            >
              <GlassPanel className="p-8 border-2 border-[#c5a059]/30 shadow-[0_0_80px_rgba(197,160,89,0.2)] rounded-[40px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-stone-100 tracking-tighter uppercase italic">Profile Settings</h3>
                  <button 
                    onClick={() => setShowProfileSettings(false)}
                    className="p-2 text-stone-500 hover:text-stone-100 hover:bg-white/5 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Name Section */}
                  <div>
                    <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] mb-3 block">Display Name</label>
                    <div className="relative">
                      <input 
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full px-6 py-4 bg-stone-950/40 border border-white/5 rounded-[18px] focus:border-[#c5a059]/30 outline-none text-stone-100 font-bold tracking-tight transition-all"
                        placeholder="Enter your name"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-700">
                        <Edit3 size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Avatar Section */}
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] block">Choose Avatar</label>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest hover:text-[#c5a059] transition-colors"
                        >
                          <Upload size={12} />
                          Upload Custom
                        </button>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button 
                          onClick={generateNewAvatar}
                          disabled={isGenerating}
                          className="flex items-center gap-2 text-[10px] font-black text-[#c5a059] uppercase tracking-widest hover:text-white transition-colors disabled:opacity-50"
                        >
                          <Sparkles size={12} className={cn(isGenerating && "animate-spin")} />
                          {isGenerating ? 'Generating...' : 'Generate AI Avatar'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      {PRESET_AVATARS.map((avatar, idx) => (
                        <button
                          key={idx}
                          onClick={() => setUserAvatar(avatar)}
                          className={cn(
                            "aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1",
                            userAvatar === avatar 
                              ? "border-[#c5a059] bg-[#c5a059]/10 shadow-[0_0_20px_rgba(197,160,89,0.3)]" 
                              : "border-white/5 bg-stone-950 hover:border-white/20"
                          )}
                        >
                          <img src={avatar} alt={`avatar-${idx}`} className="w-full h-full object-cover rounded-xl" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      onClick={handleProfileSave}
                      className="flex-1 h-14"
                    >
                      <Check size={20} />
                      Save Changes
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => setShowProfileSettings(false)}
                      className="px-8 h-14"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
