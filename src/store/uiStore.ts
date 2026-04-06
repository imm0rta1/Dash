import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  isTicketDrawerOpen: boolean;
  setTicketDrawerOpen: (open: boolean) => void;
  dashboardTitle: string;
  setDashboardTitle: (title: string) => void;
  dashboardLogo: string | null;
  setDashboardLogo: (logo: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userAvatar: string;
  setUserAvatar: (avatar: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  activeTab: 'command-center',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedTicketId: null,
  setSelectedTicketId: (id) => set({ selectedTicketId: id }),
  isTicketDrawerOpen: false,
  setTicketDrawerOpen: (open) => set({ isTicketDrawerOpen: open }),
  dashboardTitle: 'HERMES',
  setDashboardTitle: (title) => set({ dashboardTitle: title }),
  dashboardLogo: null,
  setDashboardLogo: (logo) => set({ dashboardLogo: logo }),
  userName: 'Operator',
  setUserName: (name) => set({ userName: name }),
  userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  setUserAvatar: (avatar) => set({ userAvatar: avatar }),
}));
