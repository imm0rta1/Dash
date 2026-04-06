import React, { useEffect, useState } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Plus, Clock, User, Filter, Tag } from 'lucide-react';
import { cn } from '../lib/utils';
import { GlassPanel, GlassCard, Button, SectionHeader, StatusBadge } from './ui/GlassComponents';
import { useUIStore } from '../store/uiStore';
import TicketDrawer from './TicketDrawer';

const COLUMNS = [
  { id: 'Backlog', title: 'Backlog' },
  { id: 'Planned', title: 'Planned' },
  { id: 'Running', title: 'Running' },
  { id: 'Waiting Approval', title: 'Waiting Approval' },
  { id: 'Blocked', title: 'Blocked' },
  { id: 'Done', title: 'Done' },
];

export default function KanbanBoard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { setTicketDrawerOpen, setSelectedTicketId, isTicketDrawerOpen } = useUIStore();

  useEffect(() => {
    // Initial fetch
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => setTickets(data));

    // SSE connection for real-time updates
    const eventSource = new EventSource('/api/stream/events');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'TICKET_CREATED') {
          setTickets(prev => {
            // Prevent duplicates
            if (prev.some(t => t.id === data.ticket.id)) return prev;
            return [data.ticket, ...prev];
          });
        } else if (data.type === 'TICKET_UPDATED') {
          setTickets(prev => prev.map(t => t.id === data.ticket.id ? data.ticket : t));
        } else if (data.type === 'TICKET_DELETED') {
          setTickets(prev => prev.filter(t => t.id !== data.ticketId));
        }
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []); // Run once on mount

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateTicket = async () => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Task',
          description: '',
          priority: 'medium',
          boardColumn: 'Backlog'
        })
      });
      if (res.ok) {
        const newTicket = await res.json();
        setSelectedTicketId(newTicket.id);
        setTicketDrawerOpen(true);
      }
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const activeTicket = tickets.find(t => t.id === active.id);
    const overColumn = COLUMNS.find(c => c.id === over.id) || COLUMNS.find(c => c.id === tickets.find(t => t.id === over.id)?.boardColumn);

    if (activeTicket && overColumn && activeTicket.boardColumn !== overColumn.id) {
      setTickets(prev => prev.map(t => 
        t.id === active.id ? { ...t, boardColumn: overColumn.id } : t
      ));

      await fetch(`/api/tickets/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardColumn: overColumn.id })
      });
    }

    setActiveId(null);
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <SectionHeader 
        title="Workflow Board" 
        subtitle="Manage your agent task pipeline"
      >
        <Button variant="secondary">
          <Filter size={18} />
          Filter
        </Button>
        <Button onClick={handleCreateTicket}>
          <Plus size={18} />
          Create Ticket
        </Button>
      </SectionHeader>

      <div className="flex-1 flex gap-5 pb-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map(column => (
            <KanbanColumn 
              key={column.id} 
              column={column} 
              tickets={tickets.filter(t => t.boardColumn === column.id)} 
            />
          ))}
          
          <DragOverlay>
            {activeId ? (
              <TicketCard 
                ticket={tickets.find(t => t.id === activeId)} 
                isOverlay 
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TicketDrawer />
    </div>
  );
}

function KanbanColumn({ column, tickets }: any) {
  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-stone-900/20 backdrop-blur-3xl rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden">
      <div className="p-5 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="font-black text-stone-100 text-xs tracking-tight uppercase truncate" title={column.title}>{column.title}</h3>
          <span className="bg-stone-800/50 text-stone-400 text-[10px] px-2 py-0.5 rounded-lg font-black border border-white/10 tracking-widest shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] shrink-0">
            {tickets.length}
          </span>
        </div>
        <button className="text-stone-500 hover:text-stone-200 transition-colors p-1.5 hover:bg-white/10 rounded-xl shrink-0">
          <MoreHorizontal size={18} />
        </button>
      </div>
      
      <div className="flex-1 p-4 space-y-5 overflow-y-auto scrollbar-hide pb-10">
        <SortableContext items={tickets.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map((ticket: any) => (
            <SortableTicket key={ticket.id} ticket={ticket} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function SortableTicket({ ticket }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TicketCard ticket={ticket} />
    </div>
  );
}

function TicketCard({ ticket, isOverlay }: any) {
  if (!ticket) return null;
  const { setTicketDrawerOpen, setSelectedTicketId } = useUIStore();

  const handleClick = (e: React.MouseEvent) => {
    // Don't open if we're dragging
    if (isOverlay) return;
    
    setSelectedTicketId(ticket.id);
    setTicketDrawerOpen(true);
  };

  return (
    <GlassCard 
      onClick={handleClick}
      className={cn(
        "border-white/10 group cursor-pointer hover:border-[#c5a059]/40 transition-all duration-500 rounded-[20px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]",
        isOverlay && "shadow-[0_30px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] border-[#c5a059]/60 rotate-3 bg-stone-800/80 backdrop-blur-3xl scale-105"
      )}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="shrink-0">
          <StatusBadge status={ticket.priority} />
        </div>
        <span className="text-[9px] text-stone-600 font-black tracking-widest uppercase truncate max-w-[100px] text-right" title={ticket.id}>{ticket.id}</span>
      </div>
      <h4 className="font-black text-stone-100 text-sm mb-1.5 leading-snug group-hover:text-[#c5a059] transition-colors tracking-tight">{ticket.title}</h4>
      <p className="text-[11px] text-stone-500 line-clamp-2 mb-4 leading-relaxed font-medium">{ticket.description}</p>
      
      {ticket.category && (
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1 rounded-md bg-[#c5a059]/10 border border-[#c5a059]/20">
            <Tag size={10} className="text-[#c5a059]" />
          </div>
          <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-[0.15em]">{ticket.category}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-stone-600">
          <Clock size={11} />
          <span className="text-[9px] font-black tracking-widest uppercase">
            {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="flex -space-x-2">
          <div className="w-7 h-7 rounded-full bg-stone-800 border-2 border-stone-900 flex items-center justify-center shadow-xl overflow-hidden">
            <User size={12} className="text-stone-500" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
