"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DEAL_STAGES, DealStage } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

export type ContactDeal = {
  id: string;
  companyName: string;
  contactName?: string;
  email?: string;
  linkedInUrl?: string;
  website?: string;
  currentStage: DealStage;
  lastActivityDate: string;
  createdAt?: string;
  assignedOwnerId?: string;
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

function StageSelectCell({ deal }: { deal: ContactDeal }) {
  const [stage, setStage] = useState<DealStage>(deal.currentStage);
  const [isLoading, setIsLoading] = useState(false);

  const handleStageChange = async (newStageStr: string | null) => {
    if (!newStageStr) return;
    const newStage = newStageStr as DealStage;
    const previousStage = stage;
    setStage(newStage);
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStage: newStage }),
      });
      if (!res.ok) {
        throw new Error('Failed to update deal stage');
      }
      toast.success('Stage updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update stage');
      setStage(previousStage); // Revert on failure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select value={stage} onValueChange={handleStageChange} disabled={isLoading}>
      <SelectTrigger className={`h-8 min-w-[140px] text-xs font-bold uppercase tracking-wider ${STAGE_COLORS[stage]}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {DEAL_STAGES.map((s) => (
          <SelectItem key={s} value={s} className="text-xs uppercase font-semibold">
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const columns: ColumnDef<ContactDeal>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          (table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")) as any
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "contactName",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("contactName") as string;
      return name ? (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-bold">
              {name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{name}</span>
        </div>
      ) : (
        <span className="text-zinc-400 italic">No contact</span>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return email ? (
        <a href={`mailto:${email}`} className="text-indigo-600 font-bold hover:underline truncate max-w-[200px] inline-block">
          {email}
        </a>
      ) : (
        <span className="text-zinc-400">-</span>
      );
    },
  },
  {
    accessorKey: "linkedInUrl",
    header: "LinkedIn URL",
    cell: ({ row }) => {
      const url = row.getValue("linkedInUrl") as string;
      return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline truncate max-w-[200px] inline-block">
          {url}
        </a>
      ) : (
        <span className="text-zinc-400">-</span>
      );
    },
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Company Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium text-zinc-700 dark:text-zinc-300">{row.getValue("companyName")}</div>
    ),
  },
  {
    accessorKey: "website",
    header: "Website URL",
    cell: ({ row }) => {
      const url = row.getValue("website") as string;
      return url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline truncate max-w-[200px] inline-block">
          {url}
        </a>
      ) : (
        <span className="text-zinc-400">-</span>
      );
    },
  },
  {
    accessorKey: "currentStage",
    header: "Stage",
    cell: ({ row }) => {
      return <StageSelectCell deal={row.original} />;
    },
  },
  {
    accessorKey: "lastActivityDate",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-0 hover:bg-transparent">
          Last Activity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateStr = row.getValue("lastActivityDate") as string;
      return (
        <span className="text-zinc-500 text-sm">
          {new Date(dateStr).toLocaleDateString()}
        </span>
      );
    },
  },
];
