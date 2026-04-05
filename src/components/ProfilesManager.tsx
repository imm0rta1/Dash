import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Bot, 
  Cpu, 
  Activity,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { GlassPanel, GlassCard, Button, SectionHeader } from './ui/GlassComponents';

interface AgentProfile {
  id: string;
  name: string;
  role: string;
  modelAlias: string;
  description: string;
  hermesHome: string;
  isActive: boolean;
}

export default function ProfilesManager() {
  const [profiles, setProfiles] = useState<AgentProfile[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AgentProfile>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProfiles = async () => {
    const res = await fetch('/api/profiles');
    const data = await res.json();
    setProfiles(data);
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleEdit = (profile: AgentProfile) => {
    setIsEditing(profile.id);
    setEditForm(profile);
  };

  const handleSave = async () => {
    if (!isEditing) return;
    
    await fetch(`/api/profiles/${isEditing}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    
    setIsEditing(null);
    fetchProfiles();
  };

  const handleAdd = async () => {
    await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    
    setIsAdding(false);
    setEditForm({});
    fetchProfiles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    
    await fetch(`/api/profiles/${id}`, {
      method: 'DELETE',
    });
    
    fetchProfiles();
  };

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <SectionHeader 
        title="Agent Profiles" 
        subtitle="Configure and manage your Hermes specialist agents"
      >
        <Button 
          onClick={() => {
            setIsAdding(true);
            setEditForm({ name: '', role: '', modelAlias: 'gemini-3.1-flash-preview', description: '', hermesHome: '' });
          }}
        >
          <Plus size={18} />
          Add Profile
        </Button>
      </SectionHeader>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-600 group-focus-within:text-[#c5a059] transition-colors" size={22} />
        <input 
          type="text"
          placeholder="Search profiles by name or role..."
          className="w-full pl-14 pr-6 py-5 bg-stone-900/40 backdrop-blur-2xl border border-white/5 rounded-[24px] focus:outline-none focus:border-[#c5a059]/30 transition-all text-stone-100 placeholder:text-stone-700 font-bold tracking-tight shadow-2xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {isAdding && (
          <ProfileForm 
            form={editForm} 
            setForm={setEditForm} 
            onSave={handleAdd} 
            onCancel={() => setIsAdding(false)} 
            title="New Agent Profile"
          />
        )}

        {filteredProfiles.map((profile) => (
          isEditing === profile.id ? (
            <ProfileForm 
              key={profile.id}
              form={editForm} 
              setForm={setEditForm} 
              onSave={handleSave} 
              onCancel={() => setIsEditing(null)} 
              title="Edit Agent Profile"
            />
          ) : (
            <GlassPanel key={profile.id} className="group hover:border-[#c5a059]/30 transition-all duration-700 p-8 rounded-[32px]">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-[#c5a059]/10 text-[#c5a059] rounded-[24px] border border-[#c5a059]/20 shadow-[0_0_30px_rgba(197,160,89,0.1)] group-hover:scale-110 transition-transform duration-500">
                    <Bot size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-stone-100 tracking-tighter text-glow">{profile.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c5a059] bg-[#c5a059]/10 px-3 py-1.5 rounded-xl border border-[#c5a059]/20 mt-2 inline-block">
                      {profile.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-3 group-hover:translate-y-0 duration-500">
                  <button 
                    onClick={() => handleEdit(profile)}
                    className="p-3 text-stone-500 hover:text-[#c5a059] hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(profile.id)}
                    className="p-3 text-stone-500 hover:text-red-400 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/5"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <p className="text-base text-stone-500 mb-10 line-clamp-3 min-h-[4.5rem] leading-relaxed font-medium">
                {profile.description || "No description provided for this specialist agent."}
              </p>

              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 text-stone-600">
                  <Cpu size={18} className="text-[#c5a059]/50" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-stone-400">{profile.modelAlias}</span>
                </div>
                <div className="flex items-center gap-4 text-stone-600">
                  <Activity size={18} className="text-emerald-500/50" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-stone-400">{profile.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </GlassPanel>
          )
        ))}
      </div>
    </div>
  );
}

function ProfileForm({ form, setForm, onSave, onCancel, title }: any) {
  return (
    <GlassPanel className="border-2 border-[#c5a059]/30 shadow-[0_0_80px_rgba(197,160,89,0.15)] space-y-8 p-10 rounded-[40px] bg-stone-900/60 backdrop-blur-3xl">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-stone-100 tracking-tighter uppercase">{title}</h3>
        <button onClick={onCancel} className="p-2 text-stone-600 hover:text-stone-200 transition-colors hover:bg-white/5 rounded-xl">
          <X size={28} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] mb-3 block">Agent Name</label>
          <input 
            type="text"
            className="w-full px-6 py-4 bg-stone-950/40 border border-white/5 rounded-[18px] focus:border-[#c5a059]/30 outline-none text-stone-100 font-bold tracking-tight transition-all placeholder:text-stone-800"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. SEO Specialist"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] mb-3 block">Role</label>
          <input 
            type="text"
            className="w-full px-6 py-4 bg-stone-950/40 border border-white/5 rounded-[18px] focus:border-[#c5a059]/30 outline-none text-stone-100 font-bold tracking-tight transition-all placeholder:text-stone-800"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="e.g. Listing SEO"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] mb-3 block">Model Alias</label>
          <select 
            className="w-full px-6 py-4 bg-stone-950/40 border border-white/5 rounded-[18px] focus:border-[#c5a059]/30 outline-none text-stone-100 font-bold tracking-tight transition-all appearance-none"
            value={form.modelAlias}
            onChange={(e) => setForm({ ...form, modelAlias: e.target.value })}
          >
            <option value="gemini-3.1-flash-preview" className="bg-stone-950">Gemini 3.1 Flash</option>
            <option value="gemini-3.1-pro-preview" className="bg-stone-950">Gemini 3.1 Pro</option>
            <option value="gemini-3.1-flash-lite-preview" className="bg-stone-950">Gemini 3.1 Flash Lite</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] mb-3 block">Description</label>
          <textarea 
            className="w-full px-6 py-4 bg-stone-950/40 border border-white/5 rounded-[18px] focus:border-[#c5a059]/30 outline-none text-stone-100 font-bold tracking-tight transition-all min-h-[150px] resize-none leading-relaxed placeholder:text-stone-800"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What does this agent do?"
          />
        </div>
      </div>

      <div className="flex gap-5 pt-6">
        <Button 
          onClick={onSave}
          className="flex-1 h-14 text-base"
        >
          <Save size={22} />
          Save Profile
        </Button>
        <Button 
          onClick={onCancel}
          variant="secondary"
          className="px-10 h-14"
        >
          Cancel
        </Button>
      </div>
    </GlassPanel>
  );
}
