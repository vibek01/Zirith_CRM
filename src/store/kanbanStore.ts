import { create } from 'zustand';
import { DealStage, DealType } from '@/types';

type KanbanDeal = DealType;

interface KanbanStore {
  deals: KanbanDeal[];
  setDeals: (deals: KanbanDeal[]) => void;
  updateDealStage: (dealId: string, newStage: DealStage) => void;
  updateDealNotes: (dealId: string, note: any) => void;
  removeDealNote: (dealId: string, noteId: string) => void;
  selectedDealIds: string[];
  toggleDealSelection: (dealId: string) => void;
  selectAllDeals: () => void;
  clearSelection: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  customDate: string;
  setCustomDate: (date: string) => void;
}

export const useKanbanStore = create<KanbanStore>((set) => ({
  deals: [],
  setDeals: (deals) => set({ deals }),
  updateDealStage: (dealId, newStage) => 
    set((state) => ({
      deals: state.deals.map((deal) => 
        deal._id === dealId ? { ...deal, currentStage: newStage } : deal
      )
    })),
  updateDealNotes: (dealId, note) =>
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal._id === dealId ? { ...deal, notes: [...(deal.notes || []), note] } : deal
      )
    })),
  removeDealNote: (dealId, noteId) =>
    set((state) => ({
      deals: state.deals.map((deal) =>
        deal._id === dealId ? { ...deal, notes: deal.notes?.filter((n: any) => n._id !== noteId) } : deal
      )
    })),
  selectedDealIds: [],
  toggleDealSelection: (dealId) =>
    set((state) => ({
      selectedDealIds: state.selectedDealIds.includes(dealId)
        ? state.selectedDealIds.filter((id) => id !== dealId)
        : [...state.selectedDealIds, dealId],
    })),
  selectAllDeals: () => set((state) => ({ selectedDealIds: state.deals.map(d => d._id as string) })),
  clearSelection: () => set({ selectedDealIds: [] }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  dateFilter: 'all',
  setDateFilter: (filter) => set({ dateFilter: filter }),
  customDate: '',
  setCustomDate: (date) => set({ customDate: date }),
}));
