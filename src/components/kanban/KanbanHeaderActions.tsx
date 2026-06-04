"use client";

import { useKanbanStore } from '@/store/kanbanStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Search, Calendar } from 'lucide-react';

export function KanbanHeaderActions() {
  const { 
    deals, 
    selectedDealIds, 
    selectAllDeals, 
    clearSelection,
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    customDate,
    setCustomDate
  } = useKanbanStore();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Filter */}
      <div className="relative w-full sm:w-64">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <Input
          placeholder="Search deals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 focus-visible:ring-zinc-400"
        />
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-2">
        <Select value={dateFilter} onValueChange={(val) => setDateFilter(val || "all")}>
          <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 focus:ring-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <SelectValue placeholder="Filter Date" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="last_15_days">Last 15 Days</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="custom">Custom Date</SelectItem>
          </SelectContent>
        </Select>

        {dateFilter === "custom" && (
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="h-9 w-auto text-sm border-zinc-300 dark:border-zinc-700"
            />
          </div>
        )}
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="h-9 border-zinc-300 dark:border-zinc-700"
        onClick={() => deals.length > 0 && deals.length === selectedDealIds.length ? clearSelection() : selectAllDeals()}
      >
        <CheckSquare className="w-4 h-4 mr-2" />
        {deals.length > 0 && deals.length === selectedDealIds.length ? 'Deselect All' : 'Select All'}
      </Button>
    </div>
  );
}
