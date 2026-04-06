import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  Trash2, 
  Clock, 
  User, 
  Tag, 
  AlertCircle,
  CheckCircle2,
  Play,
  MoreHorizontal,
  Edit3,
  ExternalLink,
  ShoppingBag,
  History
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { GlassPanel, Button, StatusBadge } from './ui/GlassComponents';
import { cn } from '../lib/utils';

export default function TicketDrawer() {
  const { isTicketDrawerOpen, setTicketDrawerOpen, selectedTicketId, setSelectedTicketId } = useUIStore();
  const [ticket, setTicket] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (selectedTicketId && isTicketDrawerOpen) {
      fetchTicket();
      fetchProfiles();
    }
  }, [selectedTicketId, isTicketDrawerOpen]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets`);
      const allTickets = await res.json();
      const found = allTickets.find((t: any) => t.id === selectedTicketId);
      if (found) {
        setTicket(found);
        setFormData(found);
      }
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      setProfiles(data);
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    
    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        handleClose();
      }
    } catch (err) {
      console.error("Failed to delete ticket:", err);
    }
  };

  const handleLaunchRun = async () => {
    if (!ticket?.assignedProfileId) {
      alert("Please assign an agent profile first.");
      setEditing(true);
      return;
    }

    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          profileId: ticket.assignedProfileId
        })
      });
      if (res.ok) {
        const { runId } = await res.json();
        alert(`Run ${runId} launched successfully!`);
        // Optionally redirect to run monitor
      }
    } catch (err) {
      console.error("Failed to launch run:", err);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await res.json();
        setTicket(updated);
        setEditing(false);
        // We might want to refresh the kanban board here, 
        // but for now let's just update local state
      }
    } catch (err) {
      console.error("Failed to update ticket:", err);
    }
  };

  const handleClose = () => {
    setTicketDrawerOpen(false);
    setSelectedTicketId(null);
    setEditing(false);
  };

  return (
    <AnimatePresence>
      {isTicketDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl h-full pointer-events-auto"
          >
            <GlassPanel className="h-full rounded-none border-l border-white/10 flex flex-col p-0 overflow-hidden bg-stone-950/60 backdrop-blur-3xl shadow-[-30px_0_60px_rgba(0,0,0,0.7),inset_1px_0_0_rgba(255,255,255,0.1)]">
              {/* Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-5">
                  <StatusBadge status={ticket?.priority || 'medium'} />
                  <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em]">{ticket?.id}</span>
                </div>
                <div className="flex items-center gap-3">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setFormData(ticket);
                          setEditing(false);
                        }} 
                        className="text-stone-500 hover:text-stone-200"
                      >
                        <X size={16} />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        className="bg-[#c5a059] text-stone-950 hover:bg-[#d4b47a]"
                      >
                        <Save size={16} />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setEditing(true)}
                      className="border-[#c5a059]/30 text-[#c5a059] hover:bg-[#c5a059]/10"
                    >
                      <Edit3 size={16} />
                      Edit Ticket
                    </Button>
                  )}
                  <button 
                    onClick={handleClose}
                    className="p-2.5 hover:bg-white/5 rounded-2xl transition-all text-stone-500 hover:text-stone-200 ml-2 border border-transparent hover:border-white/5"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSave(); }}
                className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide"
              >
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.3)]" />
                  </div>
                ) : (
                  <>
                    {/* Title Section */}
                    <section>
                      {editing ? (
                        <input 
                          className="w-full bg-stone-900/40 border-2 border-white/5 rounded-[24px] px-8 py-6 text-4xl font-black text-stone-100 outline-none focus:border-[#c5a059]/30 focus:bg-stone-800/50 transition-all placeholder:text-stone-700 shadow-2xl"
                          value={formData.title || ''}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ticket Title"
                          autoFocus
                        />
                      ) : (
                        <h1 className="text-4xl font-black text-stone-100 tracking-tighter text-glow leading-tight">{ticket?.title}</h1>
                      )}
                    </section>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Tag size={12} className="text-[#c5a059]" />
                          Status
                        </label>
                        {editing ? (
                          <select 
                            className="w-full bg-stone-950/40 border border-white/5 rounded-2xl px-5 py-3 text-sm text-stone-200 outline-none focus:border-[#c5a059]/30 transition-all"
                            value={formData.boardColumn || ''}
                            onChange={(e) => setFormData({ ...formData, boardColumn: e.target.value })}
                          >
                            <option value="Backlog" className="bg-stone-900">Backlog</option>
                            <option value="Planned" className="bg-stone-900">Planned</option>
                            <option value="Running" className="bg-stone-900">Running</option>
                            <option value="Waiting Approval" className="bg-stone-900">Waiting Approval</option>
                            <option value="Blocked" className="bg-stone-900">Blocked</option>
                            <option value="Done" className="bg-stone-900">Done</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-3 text-stone-200 font-bold tracking-tight">
                            <CheckCircle2 size={18} className="text-[#c5a059]" />
                            {ticket?.boardColumn}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <AlertCircle size={12} className="text-[#c5a059]" />
                          Priority
                        </label>
                        {editing ? (
                          <select 
                            className="w-full bg-stone-950/40 border border-white/5 rounded-2xl px-5 py-3 text-sm text-stone-200 outline-none focus:border-[#c5a059]/30 transition-all"
                            value={formData.priority || ''}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          >
                            <option value="low" className="bg-stone-900">Low</option>
                            <option value="medium" className="bg-stone-900">Medium</option>
                            <option value="high" className="bg-stone-900">High</option>
                            <option value="urgent" className="bg-stone-900">Urgent</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-3 text-stone-200 font-black uppercase text-xs tracking-[0.1em]">
                            {ticket?.priority}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Tag size={12} className="text-[#c5a059]" />
                          Category
                        </label>
                        {editing ? (
                          <input 
                            className="w-full bg-stone-950/40 border border-white/5 rounded-2xl px-5 py-3 text-sm text-stone-200 outline-none focus:border-[#c5a059]/30 transition-all"
                            value={formData.category || ''}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="e.g. SEO, Content, Research"
                          />
                        ) : (
                          <div className="text-stone-200 font-bold tracking-tight">
                            {ticket?.category || 'Uncategorized'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <User size={12} className="text-[#c5a059]" />
                          Assigned Agent
                        </label>
                        {editing ? (
                          <select 
                            className="w-full bg-stone-950/40 border border-white/5 rounded-2xl px-5 py-3 text-sm text-stone-200 outline-none focus:border-[#c5a059]/30 transition-all"
                            value={formData.assignedProfileId || ''}
                            onChange={(e) => setFormData({ ...formData, assignedProfileId: e.target.value })}
                          >
                            <option value="" className="bg-stone-900">Unassigned</option>
                            {profiles.map(p => (
                              <option key={p.id} value={p.id} className="bg-stone-900">{p.name} ({p.role})</option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-stone-200 font-bold tracking-tight">
                            {profiles.find(p => p.id === ticket?.assignedProfileId)?.name || 'Unassigned'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <ShoppingBag size={12} className="text-[#c5a059]" />
                          Etsy Listing
                        </label>
                        {editing ? (
                          <input 
                            className="w-full bg-stone-950/40 border border-white/5 rounded-2xl px-5 py-3 text-sm text-stone-200 outline-none focus:border-[#c5a059]/30 transition-all"
                            value={formData.linkedListingId || ''}
                            onChange={(e) => setFormData({ ...formData, linkedListingId: e.target.value })}
                            placeholder="Listing ID (e.g. 123456789)"
                          />
                        ) : (
                          ticket?.linkedListingId ? (
                            <a 
                              href={`https://www.etsy.com/listing/${ticket.linkedListingId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[#c5a059] hover:text-[#d4b47a] font-bold tracking-tight transition-colors"
                            >
                              <span>{ticket.linkedListingId}</span>
                              <ExternalLink size={14} />
                            </a>
                          ) : (
                            <div className="text-stone-500 italic text-sm">No listing linked</div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <section className="space-y-5">
                      <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MoreHorizontal size={12} className="text-[#c5a059]" />
                        Detailed Description
                      </label>
                      {editing ? (
                        <textarea 
                          className="w-full bg-stone-900/40 border-2 border-white/5 rounded-[24px] px-8 py-8 text-base text-stone-200 outline-none focus:border-[#c5a059]/30 focus:bg-stone-800/50 transition-all min-h-[350px] resize-none leading-relaxed placeholder:text-stone-700 shadow-2xl"
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe the task, requirements, and expected outcome in detail..."
                        />
                      ) : (
                        <div 
                          className="group relative cursor-pointer"
                          onClick={() => setEditing(true)}
                        >
                          <p className="text-stone-400 leading-relaxed whitespace-pre-wrap bg-white/[0.01] p-10 rounded-[32px] border border-white/5 group-hover:border-white/10 group-hover:bg-white/[0.02] transition-all min-h-[200px] font-medium">
                            {ticket?.description || 'No description provided. Click to add details.'}
                          </p>
                          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                              <Edit3 size={16} className="text-stone-500" />
                            </div>
                          </div>
                        </div>
                      )}
                    </section>

                    {!editing ? (
                      <div className="pt-6">
                        <Button 
                          variant="secondary" 
                          className="w-full h-12 border-[#c5a059]/30 text-[#c5a059] hover:bg-[#c5a059]/10"
                          onClick={() => setEditing(true)}
                        >
                          <Edit3 size={18} />
                          Edit Ticket
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-4 pt-6">
                        <Button type="submit" className="flex-1 h-12 bg-[#c5a059] text-stone-950 hover:bg-[#d4b47a]">
                          <Save size={18} />
                          Save Changes
                        </Button>
                        <Button 
                          variant="secondary" 
                          className="flex-1 h-12"
                          onClick={() => {
                            setFormData(ticket);
                            setEditing(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* History Section */}
                    <section className="space-y-5 pt-10 border-t border-white/5">
                      <label className="text-[10px] font-black text-stone-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <History size={12} className="text-[#c5a059]" />
                        Ticket History
                      </label>
                      <div className="space-y-4">
                        {(() => {
                          try {
                            const history = JSON.parse(ticket?.historyJson || "[]");
                            if (history.length === 0) return <p className="text-xs text-stone-600 italic">No history available for this ticket.</p>;
                            
                            return [...history].reverse().map((entry: any) => (
                              <div key={entry.id} className="relative pl-6 border-l border-white/5 pb-4 last:pb-0">
                                <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[#c5a059]/30 border border-[#c5a059]/50" />
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </span>
                                  <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest">
                                    {entry.user}
                                  </span>
                                </div>
                                <p className="text-sm text-stone-400 font-medium">{entry.description}</p>
                                {entry.changes && entry.changes.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {entry.changes.map((change: any, idx: number) => (
                                      <div key={idx} className="text-[9px] px-2 py-1 rounded bg-white/5 border border-white/10 text-stone-500 font-bold uppercase tracking-tighter">
                                        {change.field}: <span className="text-stone-600 line-through mr-1">{String(change.old || 'none')}</span> <span className="text-stone-300">{String(change.new || 'none')}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ));
                          } catch (e) {
                            return <p className="text-xs text-red-500/50 italic">Failed to load history.</p>;
                          }
                        })()}
                      </div>
                    </section>

                    {/* Footer Info */}
                    <div className="pt-10 border-t border-white/5 flex items-center justify-between text-stone-600">
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                          <Clock size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Created {new Date(ticket?.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <User size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Operator Console</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="danger" 
                        size="sm" 
                        className="opacity-40 hover:opacity-100"
                        onClick={handleDelete}
                      >
                        <Trash2 size={14} />
                        Delete Ticket
                      </Button>
                    </div>
                  </>
                )}
              </form>

              {/* Action Bar */}
              <div className="p-8 bg-white/[0.01] border-t border-white/5 flex gap-5">
                <Button className="flex-1 h-14" onClick={handleLaunchRun}>
                  <Play size={18} fill="currentColor" />
                  Launch Hermes Run
                </Button>
                <Button variant="secondary" className="flex-1 h-14">
                  Generate SOP
                </Button>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
