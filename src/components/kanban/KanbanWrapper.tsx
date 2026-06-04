"use client";

import { useEffect, useState } from "react";
import { KanbanBoard } from "./KanbanBoard";
import { useKanbanStore } from "@/store/kanbanStore";

export function KanbanWrapper({ initialDeals }: { initialDeals: any[] }) {
  const setDeals = useKanbanStore((state) => state.setDeals);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDeals(initialDeals);
    setMounted(true);
  }, [initialDeals, setDeals]);

  if (!mounted) return null; // Avoid hydration mismatch for dnd-kit

  return <KanbanBoard />;
}
