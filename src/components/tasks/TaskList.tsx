"use client";

import { useState } from "react";
import { CheckSquare, Calendar, Building2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Checkbox } from "@/components/ui/checkbox";

const TASK_TYPE_LABELS: Record<string, string> = {
  connection_request: "Sent Connection Request",
  deliver_value: "Deliver Value",
  drop_pitch: "Drop Pitch",
  follow_up: "Follow Up",
};

interface Task {
  _id: string;
  taskDescription: string;
  taskType: string;
  isCompleted: boolean;
  dueDate: string;
  dealId?: {
    companyName: string;
    contactName: string;
  };
}

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTaskCompletion = async (taskId: string, newStatus: boolean) => {
    // Optimistic update
    setTasks(tasks.map(t => t._id === taskId ? { ...t, isCompleted: newStatus } : t));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newStatus })
      });

      if (!res.ok) {
        throw new Error("Failed to update task");
      }
      
      toast.success(`Task marked as ${newStatus ? 'completed' : 'pending'}!`);
    } catch (error) {
      toast.error("Failed to update task status");
      // Revert optimistic update
      setTasks(tasks.map(t => t._id === taskId ? { ...t, isCompleted: !newStatus } : t));
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
          <CheckSquare className="h-10 w-10 text-indigo-500" />
        </div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">You're all caught up!</h3>
        <p className="text-zinc-500 mt-1 max-w-sm">No daily tasks are currently assigned to you. The system will automatically generate them based on your deal activity.</p>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const groupTasksByType = (taskList: Task[]) => {
    return taskList.reduce((acc, task) => {
      // Backwards compatibility for old tasks
      let type = task.taskType || 'follow_up';
      if (type === 'follow_up' && task.taskDescription.includes('Connection Request')) {
        type = 'connection_request';
      }
      
      if (!acc[type]) acc[type] = [];
      acc[type].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  };

  const groupedPending = groupTasksByType(pendingTasks);
  const groupedCompleted = groupTasksByType(completedTasks);

  const renderTaskGroup = (type: string, groupTasks: Task[], isCompletedGroup: boolean = false) => (
    <Card key={type} className={`overflow-hidden ${isCompletedGroup ? 'opacity-60 bg-zinc-50/50' : 'bg-white shadow-sm border-zinc-200'}`}>
      <div className={`px-5 py-4 border-b ${isCompletedGroup ? 'bg-zinc-100/50' : 'bg-indigo-50/80'} flex items-center justify-between`}>
        <h3 className={`text-lg md:text-xl font-bold ${isCompletedGroup ? 'text-zinc-600' : 'text-indigo-900'}`}>
          {TASK_TYPE_LABELS[type] || type.replace('_', ' ').toUpperCase()}
        </h3>
        <Badge variant="outline" className={isCompletedGroup ? 'bg-zinc-200 text-zinc-600' : 'bg-indigo-100 text-indigo-700 border-indigo-200 font-bold px-3 py-1 text-sm'}>
          {groupTasks.length}
        </Badge>
      </div>
      <CardContent className="p-0">
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {groupTasks.map(task => (
            <li key={task._id} className="p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 flex items-center justify-between gap-4 transition-colors">
              <div className="flex items-center gap-4">
                <Checkbox 
                  id={`task-${task._id}`} 
                  checked={task.isCompleted} 
                  onCheckedChange={(checked) => toggleTaskCompletion(task._id, !!checked)} 
                  className={`h-5 w-5 ${isCompletedGroup ? 'data-[state=checked]:bg-zinc-400 data-[state=checked]:border-zinc-400' : 'border-zinc-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600'}`}
                />
                <label htmlFor={`task-${task._id}`} className="cursor-pointer select-none">
                  <div className={`text-base md:text-lg font-bold tracking-tight ${isCompletedGroup ? 'text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {task.dealId?.companyName || "Unknown Company"}
                  </div>
                  {task.dealId?.contactName && (
                     <div className="text-sm font-semibold text-zinc-600 flex items-center gap-1 mt-1">
                       <UserIcon className="w-4 h-4 text-zinc-400" />
                       {task.dealId.contactName}
                     </div>
                  )}
                </label>
              </div>
              <span className="text-xs font-medium text-zinc-500 flex items-center gap-1 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-10 w-full max-w-full">
      {/* Pending Tasks */}
      <div className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Pending Today
        </h2>
        
        {pendingTasks.length === 0 ? (
          <p className="text-base text-zinc-500 italic">No pending tasks for today!</p>
        ) : (
          <div className="grid gap-6">
            {Object.entries(groupedPending).map(([type, tasks]) => renderTaskGroup(type, tasks, false))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-zinc-200 dark:border-zinc-800 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Completed
          </h2>
          
          <div className="grid gap-6">
            {Object.entries(groupedCompleted).map(([type, tasks]) => renderTaskGroup(type, tasks, true))}
          </div>
        </div>
      )}
    </div>
  );
}
