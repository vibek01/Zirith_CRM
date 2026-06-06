"use client";

import { useState } from "react";
import { 
  flexRender, 
  getCoreRowModel, 
  useReactTable, 
  getPaginationRowModel 
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Send, Trash2, Database, Clock, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeadBankClientProps {
  initialLeads: any[];
}

export function LeadBankClient({ initialLeads }: LeadBankClientProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [isPushing, setIsPushing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns = [
    {
      accessorKey: "companyName",
      header: "Company",
      cell: ({ row }: any) => <span className="font-medium text-zinc-900 dark:text-zinc-100">{row.original.companyName}</span>,
    },
    {
      accessorKey: "contactName",
      header: "Contact",
      cell: ({ row }: any) => <span className="text-zinc-600 dark:text-zinc-400">{row.original.contactName || '-'}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => <span className="text-zinc-600 dark:text-zinc-400">{row.original.email || '-'}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        return status === 'dispatched' ? (
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex w-fit gap-1 items-center">
            <CheckCircle2 className="w-3 h-3" />
            Dispatched
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 flex w-fit gap-1 items-center">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Added On",
      cell: ({ row }: any) => <span className="text-zinc-500 text-sm">{new Date(row.original.createdAt).toLocaleDateString()}</span>,
    },
  ];

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 100,
      },
    },
  });

  const handlePushLeads = async () => {
    setIsPushing(true);
    try {
      const res = await fetch('/api/leads/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 50 }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to push leads');
      
      toast.success(`Successfully dispatched ${data.pushed} leads to prospecting!`);
      
      // Refresh the page data (or update local state)
      // Since it's server component wrapper, reloading is easiest for full data sync
      window.location.reload();
    } catch (error) {
      toast.error('Failed to dispatch leads');
      console.error(error);
    } finally {
      setIsPushing(false);
    }
  };

  const handleDeleteDispatched = async () => {
    if (!confirm('Are you sure you want to delete all dispatched leads from the bank?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/leads/delete-dispatched', {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      
      toast.success(`Deleted ${data.deletedCount} dispatched leads from history.`);
      
      // Update local state to remove dispatched
      setLeads(leads.filter(l => l.status !== 'dispatched'));
    } catch (error) {
      toast.error('Failed to delete leads');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const pendingCount = leads.filter(l => l.status === 'pending').length;
  const dispatchedCount = leads.filter(l => l.status === 'dispatched').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex gap-6">
          <div>
            <p className="text-sm text-zinc-500 font-medium">Pending Leads</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{pendingCount}</p>
          </div>
          <div className="w-px bg-zinc-200 dark:bg-zinc-800"></div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">Dispatched</p>
            <p className="text-2xl font-bold text-emerald-600">{dispatchedCount}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleDeleteDispatched}
            disabled={isDeleting || dispatchedCount === 0}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Dispatched'}
          </Button>
          <Button 
            onClick={handlePushLeads}
            disabled={isPushing || pendingCount === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {isPushing ? 'Dispatching...' : 'Dispatch 50 Leads'}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f5f6f8] dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-700">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center">
                    <Database className="w-8 h-8 text-zinc-300 mb-2" />
                    <p>No leads found in the bank.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-zinc-500">
          Showing page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
