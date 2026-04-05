import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  RefreshCw,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

import { useUIStore } from '../store/uiStore';
import { cn } from '../lib/utils';
import { GlassPanel, GlassCard, MetricCard, Button, SectionHeader } from './ui/GlassComponents';

export default function CommandCenter() {
  const [stats, setStats] = useState({
    activeRuns: 0,
    failedRuns: 0,
    queueDepth: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [runsRes, approvalsRes] = await Promise.all([
          fetch('/api/runs'),
          fetch('/api/approvals')
        ]);
        const runs = await runsRes.json();
        const approvals = await approvalsRes.json();
        
        setStats({
          activeRuns: runs.filter((r: any) => r.status === 'running').length,
          failedRuns: runs.filter((r: any) => r.status === 'failed').length,
          queueDepth: runs.filter((r: any) => r.status === 'queued').length,
          pendingApprovals: approvals.length
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Mon', runs: 12 },
    { name: 'Tue', runs: 19 },
    { name: 'Wed', runs: 15 },
    { name: 'Thu', runs: 22 },
    { name: 'Fri', runs: 30 },
    { name: 'Sat', runs: 10 },
    { name: 'Sun', runs: 8 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <SectionHeader 
        title="Command Center" 
        subtitle="Global control and health overview"
      >
        <Button variant="secondary">
          <RefreshCw size={18} />
          Sync Etsy
        </Button>
        <Button>
          <Plus size={18} />
          New Ticket
        </Button>
      </SectionHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Active Runs" 
          value={stats.activeRuns} 
          icon={Activity} 
          trend={12}
        />
        <MetricCard 
          label="Failed Runs" 
          value={stats.failedRuns} 
          icon={AlertCircle} 
          trend={-5}
        />
        <MetricCard 
          label="Queue Depth" 
          value={stats.queueDepth} 
          icon={Clock} 
        />
        <MetricCard 
          label="Pending Approvals" 
          value={stats.pendingApprovals} 
          icon={CheckCircle2} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <GlassPanel className="lg:col-span-2 p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-stone-100 flex items-center gap-3 uppercase tracking-tight">
              <TrendingUp className="text-[#c5a059]" size={22} />
              Workflow Activity
            </h3>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-white/[0.03] rounded-xl text-[10px] font-black text-stone-500 uppercase tracking-widest border border-white/5">7 Days</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c5a059" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#c5a059" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#57534e', fontSize: 10, fontWeight: 900}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#57534e', fontSize: 10, fontWeight: 900}} 
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={{
                    backgroundColor: 'rgba(12, 10, 9, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 30px 60px -12px rgba(0,0,0,0.8)',
                    padding: '16px'
                  }}
                  itemStyle={{color: '#e7e5e4', fontWeight: '900', fontSize: '14px'}}
                  labelStyle={{color: '#57534e', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.1em'}}
                />
                <Bar dataKey="runs" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Quick Actions / Active Profiles */}
        <GlassPanel className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <Cpu className="text-[#c5a059]" size={22} />
            <h3 className="text-xl font-black text-stone-100 uppercase tracking-tight">Active Profiles</h3>
          </div>
          <div className="space-y-5">
            <ProfileItem name="Supervisor" status="Idle" model="gemini-3.1-pro" />
            <ProfileItem name="Researcher" status="Active" model="gemini-3.1-flash" />
            <ProfileItem name="SEO Optimizer" status="Idle" model="gemini-3.1-flash" />
            <ProfileItem name="Content Ops" status="Idle" model="gemini-3.1-flash" />
          </div>
          <Button 
            variant="secondary"
            onClick={() => useUIStore.getState().setActiveTab('profiles')}
            className="w-full mt-10 h-12"
          >
            Manage Profiles
          </Button>
        </GlassPanel>
      </div>
    </div>
  );
}

function ProfileItem({ name, status, model }: any) {
  return (
    <GlassCard className={cn(
      "flex items-center justify-between border-white/5 p-5 rounded-[20px]",
      status === 'Active' ? "border-[#c5a059]/20 bg-[#c5a059]/05" : ""
    )}>
      <div className="flex items-center gap-5">
        <div className={cn(
          "w-3.5 h-3.5 rounded-full shadow-inner",
          status === 'Active' ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" : "bg-stone-700"
        )} />
        <div>
          <p className="text-sm font-black text-stone-100 tracking-tight">{name}</p>
          <p className="text-[10px] text-stone-600 font-black uppercase tracking-[0.15em] mt-0.5">{model}</p>
        </div>
      </div>
      <span className={cn(
        "text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-[0.1em] border",
        status === 'Active' ? "bg-emerald-900/20 text-emerald-400 border-emerald-500/10" : "bg-white/[0.02] text-stone-600 border-white/5"
      )}>
        {status}
      </span>
    </GlassCard>
  );
}
