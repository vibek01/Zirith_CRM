"use client";

import React, { useMemo } from 'react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { useKanbanStore } from '@/store/kanbanStore';
import { DEAL_STAGES, DealStage } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2, UserPlus, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';

export function KanbanBoard() {
  const { 
    deals, 
    updateDealStage, 
    selectedDealIds, 
    clearSelection,
    searchQuery,
    dateFilter,
    customDate
  } = useKanbanStore();

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = deal.contactName?.toLowerCase().includes(query) || false;
        const matchesCompany = deal.companyName?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesCompany) return false;
      }

      // Date Filter
      if (dateFilter !== "all") {
        const dateStr = deal.createdAt || deal.lastActivityDate;
        if (!dateStr) return true;
        
        const itemDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dateFilter === "today" && itemDate < today) return false;
        if (dateFilter === "yesterday") {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (itemDate < yesterday || itemDate >= today) return false;
        }
        if (dateFilter === "this_week") {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          if (itemDate < startOfWeek) return false;
        }
        if (dateFilter === "last_15_days") {
          const last15 = new Date(today);
          last15.setDate(today.getDate() - 15);
          if (itemDate < last15) return false;
        }
        if (dateFilter === "last_month") {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
          if (itemDate < startOfMonth || itemDate > endOfMonth) return false;
        }
        if (dateFilter === "custom") {
          if (!customDate) return true;
          const targetDate = new Date(customDate);
          targetDate.setHours(0, 0, 0, 0);
          const itemDay = new Date(itemDate);
          itemDay.setHours(0, 0, 0, 0);
          if (itemDay.getTime() !== targetDate.getTime()) return false;
        }
      }

      return true;
    });
  }, [deals, searchQuery, dateFilter, customDate]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;
    
    let newStage: DealStage;
    if (DEAL_STAGES.includes(overId as DealStage)) {
      newStage = overId as DealStage;
    } else {
      const overDeal = deals.find(d => d._id === overId);
      if (overDeal) {
        newStage = overDeal.currentStage;
      } else {
        return;
      }
    }
    
    // Find the deal
    const deal = deals.find(d => d._id === dealId);
    if (!deal || deal.currentStage === newStage) return;
    
    // Optimistic UI Update
    updateDealStage(dealId, newStage);

    // Backend Update
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStage: newStage }),
      });
      if (!res.ok) {
        throw new Error('Failed to update deal stage');
      }
    } catch (error) {
      console.error(error);
      // Revert optimism if failed (requires storing previous state)
    }
  };

  const handleBulkDelete = () => {
    // In production, call API
    toast.error(`Deleted ${selectedDealIds.length} deals`);
    clearSelection();
  };

  const handleBulkReassign = () => {
    // In production, open a dialog
    toast.success(`Reassigned ${selectedDealIds.length} deals`);
    clearSelection();
  };

  return (
    <div className="relative flex h-full w-full overflow-x-auto p-4 gap-8 bg-gray-50/50 dark:bg-zinc-950/50 min-h-[calc(100vh-4rem)] custom-horizontal-scrollbar">

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        {DEAL_STAGES.map((stage) => {
          const stageDeals = filteredDeals.filter(deal => deal.currentStage === stage);
          return (
            <KanbanColumn 
              key={stage} 
              stage={stage} 
              deals={stageDeals} 
            />
          );
        })}
      </DndContext>

      {/* Floating Action Bar for Bulk Actions */}
      {selectedDealIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-50 border border-indigo-100 rounded-full py-2 px-4 flex items-center gap-4 shadow-lg animate-in fade-in slide-in-from-bottom-5">
          <span className="text-sm font-medium text-indigo-900 whitespace-nowrap">
            {selectedDealIds.length} deal{selectedDealIds.length !== 1 && 's'} selected
          </span>
          <div className="flex gap-2 border-l border-indigo-200 pl-4">
            <Button variant="outline" size="sm" className="h-8 bg-white rounded-full" onClick={handleBulkReassign}>
              <UserPlus className="h-3.5 w-3.5 mr-2" />
              Reassign
            </Button>
            <Button variant="destructive" size="sm" className="h-8 rounded-full" onClick={handleBulkDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
