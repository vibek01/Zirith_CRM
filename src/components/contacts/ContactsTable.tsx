"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Trash2, UserPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: any[];
  data: TData[];
}

export function ContactsTable<TData extends { createdAt?: string, lastActivityDate?: string }, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState<string>("");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (dateFilter === "all") return true;
      
      const dateStr = item.createdAt || item.lastActivityDate;
      if (!dateStr) return true;
      
      const itemDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === "today") {
        return itemDate >= today;
      }
      if (dateFilter === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return itemDate >= yesterday && itemDate < today;
      }
      if (dateFilter === "this_week") {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return itemDate >= startOfWeek;
      }
      if (dateFilter === "last_15_days") {
        const last15 = new Date(today);
        last15.setDate(today.getDate() - 15);
        return itemDate >= last15;
      }
      if (dateFilter === "last_month") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        return itemDate >= startOfMonth && itemDate <= endOfMonth;
      }
      if (dateFilter === "custom") {
        if (!customDate) return true;
        const targetDate = new Date(customDate);
        targetDate.setHours(0, 0, 0, 0);
        const itemDay = new Date(itemDate);
        itemDay.setHours(0, 0, 0, 0);
        return itemDay.getTime() === targetDate.getTime();
      }
      
      return true;
    });
  }, [data, dateFilter, customDate]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleBulkDelete = () => {
    toast.error(`Deleted ${selectedRows.length} contacts`);
    table.resetRowSelection();
  };

  const handleBulkReassign = () => {
    toast.success(`Reassigned ${selectedRows.length} contacts`);
    table.resetRowSelection();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center w-full max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 text-zinc-500" />
          <Input
            placeholder="Search contacts..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 focus-visible:ring-zinc-400"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={dateFilter} onValueChange={(val) => setDateFilter(val || "all")}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 focus:ring-zinc-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <SelectValue placeholder="Filter by date" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_15_days">Last 15 Days</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === "custom" && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <Input 
                type="date" 
                value={typeof customDate === "string" ? customDate : ""}
                onChange={(e) => setCustomDate(e.target.value as any)}
                className="w-auto text-sm border-zinc-300 dark:border-zinc-700"
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar for Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <span className="text-sm font-medium text-indigo-900">
            {selectedRows.length} contact{selectedRows.length !== 1 && 's'} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 bg-white" onClick={handleBulkReassign}>
              <UserPlus className="h-3.5 w-3.5 mr-2" />
              Reassign
            </Button>
            <Button variant="destructive" size="sm" className="h-8" onClick={handleBulkDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <Table>
        <TableHeader className="bg-[#f5f6f8] dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-700 [&_th]:border-r [&_th]:border-zinc-300 dark:[&_th]:border-zinc-700 [&_th:last-child]:border-r-0">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-zinc-500">
                No contacts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    </div>
  );
}
