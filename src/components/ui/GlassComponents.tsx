import React from 'react';
import { cn } from '../../lib/utils';

export const GlassPanel = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("glass-panel rounded-3xl p-6", className)} {...props}>
    {children}
  </div>
);

export const GlassCard = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("glass-card rounded-2xl p-4", className)} {...props}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg' }) => {
  const variants = {
    primary: "bg-[#c5a059]/80 hover:bg-[#c5a059] text-stone-950 shadow-[0_0_20px_rgba(197,160,89,0.2)] border border-[#c5a059]/20",
    secondary: "bg-stone-800/40 hover:bg-stone-700/60 text-stone-200 border border-white/5 backdrop-blur-md",
    ghost: "hover:bg-white/5 text-stone-500 hover:text-stone-200",
    danger: "bg-red-900/20 hover:bg-red-800/40 text-red-400 border border-red-500/10"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <button 
      className={cn(
        "rounded-[14px] font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 tracking-tight",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const StatusBadge = ({ status, className }: { status: string, className?: string }) => {
  const getStatusStyles = (s: string) => {
    const lower = s.toLowerCase();
    if (['running', 'active', 'success', 'succeeded', 'done'].includes(lower)) 
      return "bg-emerald-900/20 text-emerald-400/80 border-emerald-500/10";
    if (['failed', 'error', 'blocked', 'urgent'].includes(lower)) 
      return "bg-red-900/20 text-red-400/80 border-red-500/10";
    if (['waiting', 'pending', 'queued', 'planned'].includes(lower)) 
      return "bg-amber-900/20 text-amber-400/80 border-amber-500/10";
    if (['high'].includes(lower))
      return "bg-orange-900/20 text-orange-400/80 border-orange-500/10";
    return "bg-stone-800/40 text-stone-400 border-white/5";
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border backdrop-blur-sm",
      getStatusStyles(status),
      className
    )}>
      {status}
    </span>
  );
};

export const MetricCard = ({ label, value, icon: Icon, trend }: any) => (
  <GlassCard className="flex items-center gap-5 border-white/5 p-6">
    <div className="p-4 rounded-2xl bg-stone-800/50 text-[#c5a059] border border-white/5">
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.15em] mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-stone-100 text-glow tracking-tight">{value}</p>
        {trend && (
          <span className={cn("text-[10px] font-black tracking-wider", trend > 0 ? "text-emerald-500/80" : "text-red-500/80")}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  </GlassCard>
);

export const SectionHeader = ({ title, subtitle, children }: any) => (
  <div className="flex justify-between items-end mb-10">
    <div>
      <h2 className="text-4xl font-black text-stone-100 tracking-tighter text-glow">{title}</h2>
      {subtitle && <p className="text-stone-500 mt-2 font-medium tracking-tight">{subtitle}</p>}
    </div>
    <div className="flex gap-4">
      {children}
    </div>
  </div>
);

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className={cn(
      "w-full bg-stone-900/40 border border-white/5 rounded-[14px] px-4 py-3 text-sm text-stone-200 outline-none focus:border-[#c5a059]/30 focus:bg-stone-800/50 transition-all placeholder:text-stone-600",
      className
    )}
    {...props}
  />
);

export const TableShell = ({ headers, children, className }: any) => (
  <div className={cn("w-full overflow-hidden glass-panel p-0 rounded-[24px]", className)}>
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-white/5 bg-white/[0.02]">
          {headers.map((h: string, i: number) => (
            <th key={i} className="px-6 py-4 text-[10px] font-black text-stone-500 uppercase tracking-[0.15em]">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {children}
      </tbody>
    </table>
  </div>
);
