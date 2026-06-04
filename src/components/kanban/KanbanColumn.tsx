"use client";

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { DealStage } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface KanbanColumnProps {
  stage: DealStage;
  deals: any[]; // Using any[] here for simplicity, typically would be KanbanDeal[]
}

const STAGE_LABELS: Record<DealStage, string> = {
  'prospecting': 'Prospecting',
  'connection sent': 'Connection Sent',
  'value delivered': 'Value Delivered',
  'pitch dropped': 'Pitch Dropped',
  'follow-up': 'Follow-Up',
  'meeting booked': 'Meeting Booked',
  'closed won': 'Closed Won',
  'closed lost': 'Closed Lost',
  'unqualified': 'Unqualified',
};

const STAGE_COLORS: Record<DealStage, string> = {
  'prospecting': 'bg-blue-100 text-blue-800 border-blue-200',
  'connection sent': 'bg-sky-100 text-sky-800 border-sky-200',
  'value delivered': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'pitch dropped': 'bg-violet-100 text-violet-800 border-violet-200',
  'follow-up': 'bg-purple-100 text-purple-800 border-purple-200',
  'meeting booked': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  'closed won': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'closed lost': 'bg-red-100 text-red-800 border-red-200',
  'unqualified': 'bg-amber-100 text-amber-800 border-amber-300',
};

export function KanbanColumn({ stage, deals }: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    disabled: isCollapsed,
  });

  if (isCollapsed) {
    return (
      <Card 
        className="min-w-[48px] w-[48px] flex flex-col h-full bg-[#f5f6f8] dark:bg-zinc-800/60 border-0 shadow-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700/60 transition-colors"
        onClick={() => setIsCollapsed(false)}
      >
        <div className="py-4 flex flex-col items-center gap-4 h-full">
          <ChevronRight className="h-4 w-4 text-zinc-400" />
          <div className="flex items-center justify-center flex-1">
            <span className={`text-xs font-bold px-2 py-1 rounded border ${STAGE_COLORS[stage]} uppercase tracking-wider`} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              {STAGE_LABELS[stage]}
            </span>
          </div>
          <span className="bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs px-2 py-1 rounded-full font-bold">
            {deals.length}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      ref={setNodeRef}
      className={`min-w-[320px] w-[320px] flex flex-col h-full max-h-full bg-[#f5f6f8] dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 shadow-sm transition-colors ${isOver ? 'bg-zinc-200 dark:bg-zinc-800 ring-2 ring-blue-500/50' : ''}`}
    >
      <CardHeader className="py-3 px-4 border-b border-zinc-300 dark:border-zinc-700 pb-3 mb-2 bg-white/50 dark:bg-zinc-950/50 rounded-t-xl">
        <CardTitle className="flex items-center justify-between text-zinc-900 dark:text-zinc-100">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-md text-sm font-bold border ${STAGE_COLORS[stage]}`}>
               {STAGE_LABELS[stage]}
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 text-sm px-2 font-bold">
              {deals.length}
            </span>
          </div>
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0 overflow-y-auto space-y-3 custom-scrollbar min-h-0">
        <SortableContext items={deals.map(d => d._id)} strategy={verticalListSortingStrategy}>
          {deals.map(deal => (
            <KanbanCard key={deal._id} deal={deal} />
          ))}
        </SortableContext>
      </CardContent>
    </Card>
  );
}
