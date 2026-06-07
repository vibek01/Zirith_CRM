"use client";

import { useState } from "react";
import { CheckSquare, Calendar, Building2, User as UserIcon, Mail, Link as LinkIcon, Globe, FileText, Trash2, AlertCircle, Flame, UserX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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
    _id: string;
    companyName: string;
    contactName: string;
    email?: string;
    linkedInUrl?: string;
    website?: string;
    notes?: { _id?: string; text: string; createdAt: string }[];
  };
}

function TaskListItem({ 
  task, 
  isCompletedGroup, 
  toggleTaskCompletion,
  isOverdue = false,
  daysOverdue = 0,
  handleNotAccepted
}: { 
  task: Task; 
  isCompletedGroup: boolean;
  toggleTaskCompletion: (id: string, status: boolean) => void;
  isOverdue?: boolean;
  daysOverdue?: number;
  handleNotAccepted: (id: string) => Promise<void>;
}) {
  const [note, setNote] = useState('');
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSnoozing, setIsSnoozing] = useState(false);
  const [localNotes, setLocalNotes] = useState(task.dealId?.notes || []);

  const handleSaveNote = async () => {
    if (!note.trim() || !task.dealId) return;
    setIsSavingNote(true);
    try {
      const res = await fetch(`/api/deals/${task.dealId._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: note }),
      });
      if (!res.ok) throw new Error('Failed to save note');
      
      const data = await res.json();
      const addedNote = data.deal.notes[data.deal.notes.length - 1];
      
      setLocalNotes([...localNotes, addedNote]);
      toast.success('Note saved successfully!');
      setNote('');
      setIsNoteOpen(false);
    } catch (error) {
      toast.error('Failed to save note');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      const res = await fetch(`/api/deals/${task.dealId?._id}/notes/${noteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note');
      setLocalNotes(localNotes.filter((n: any) => n._id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  return (
    <li className={`p-5 transition-colors relative ${
      isOverdue 
        ? 'bg-red-50/40 hover:bg-red-50/80 border-l-4 border-l-red-500 dark:bg-red-950/20 dark:hover:bg-red-950/40' 
        : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="pt-1">
            <Checkbox 
              id={`task-${task._id}`} 
              checked={task.isCompleted} 
              onCheckedChange={(checked) => toggleTaskCompletion(task._id, !!checked)} 
              className={`h-5 w-5 ${isCompletedGroup ? 'data-[state=checked]:bg-zinc-400 data-[state=checked]:border-zinc-400' : 'border-zinc-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600'}`}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor={`task-${task._id}`} className="cursor-pointer select-none block">
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
            
            {/* Contact Badges */}
            {task.dealId && !isCompletedGroup && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {task.dealId.email && (
                  <a href={`mailto:${task.dealId.email}`} onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                    <Badge variant="secondary" className="px-2 py-1 h-7 rounded-md bg-blue-50 text-blue-800 border border-blue-200 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 font-bold">
                      <Mail className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs">Email</span>
                    </Badge>
                  </a>
                )}
                {task.dealId.linkedInUrl && (
                  <a href={task.dealId.linkedInUrl.startsWith('http') ? task.dealId.linkedInUrl : `https://${task.dealId.linkedInUrl}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                    <Badge variant="secondary" className="px-2 py-1 h-7 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 dark:border-indigo-800/50 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 font-bold">
                      <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs">LinkedIn</span>
                    </Badge>
                  </a>
                )}
                {task.dealId.website && (
                  <a href={task.dealId.website.startsWith('http') ? task.dealId.website : `https://${task.dealId.website}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                    <Badge variant="secondary" className="px-2 py-1 h-7 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 font-bold">
                      <Globe className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs">Website</span>
                    </Badge>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 shrink-0">
          {isOverdue ? (
            <span className="text-xs font-bold text-red-700 flex items-center gap-1 bg-red-100 px-2 py-1 rounded-md border border-red-200 shadow-sm dark:bg-red-900/50 dark:text-red-200 dark:border-red-800">
              <AlertCircle className="w-3.5 h-3.5" />
              Overdue ({daysOverdue} {daysOverdue === 1 ? 'day' : 'days'})
            </span>
          ) : (
            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          
          {/* Notes Dialog */}
          {task.dealId && !isCompletedGroup && (
            <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
              <DialogTrigger render={
                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className="h-8 w-8 rounded-full text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 relative mt-1" />
              }>
                <FileText className="h-4 w-4" />
                {localNotes.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                    {localNotes.length}
                  </span>
                )}
              </DialogTrigger>
              <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>Notes for {task.dealId.companyName}</DialogTitle>
                  <DialogDescription>View past notes or add a new one.</DialogDescription>
                </DialogHeader>
                
                {localNotes.length > 0 && (
                  <div className="max-h-[200px] overflow-y-auto space-y-2 mb-2 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-md">
                    {localNotes.map((n: any, i: number) => (
                      <div key={i} className="text-sm pb-2 border-b border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0 relative group">
                        <div className="flex justify-between items-start">
                          <p className="text-xs text-zinc-500 mb-1">{new Date(n.createdAt).toLocaleString()}</p>
                          {n._id && (
                            <button onClick={() => handleDeleteNote(n._id)} className="text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap pr-4">{n.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <Textarea 
                  placeholder="Type your new note here..." 
                  className="min-h-[100px]" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === ' ') e.stopPropagation();
                  }}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNoteOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveNote} disabled={isSavingNote || !note.trim()}>
                    {isSavingNote ? 'Saving...' : 'Save Note'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Not Accepted Button */}
          {task.dealId && !isCompletedGroup && task.taskType !== 'connection_request' && (
            <Button
              variant="outline"
              size="sm"
              disabled={isSnoozing}
              onClick={async (e) => {
                e.stopPropagation();
                setIsSnoozing(true);
                await handleNotAccepted(task._id);
                setIsSnoozing(false);
              }}
              className="mt-1 text-[10px] sm:text-xs h-7 px-2 text-red-600 border-red-200 bg-red-50/50 hover:bg-red-100 hover:text-red-800 font-bold dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              {isSnoozing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <UserX className="h-3 w-3 mr-1" />}
              Not Accepted Yet
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

export function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTaskCompletion = async (taskId: string, newStatus: boolean) => {
    setTasks(tasks.map(t => t._id === taskId ? { ...t, isCompleted: newStatus } : t));
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update task");
      toast.success(`Task marked as ${newStatus ? 'completed' : 'pending'}!`);
    } catch (error) {
      toast.error("Failed to update task status");
      setTasks(tasks.map(t => t._id === taskId ? { ...t, isCompleted: !newStatus } : t));
    }
  };

  const handleNotAccepted = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/not-accepted`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to process action");
      
      const data = await res.json();
      
      if (data.action === 'unqualified') {
        toast.success("Connection never accepted. Deal moved to Unqualified.");
      } else {
        toast.success(`Deal snoozed! Will try again in 2 days. (Strike ${data.retryCount}/3)`);
      }
      
      // Mark task as completed locally to remove it from pending list
      setTasks(tasks.map(t => t._id === taskId ? { ...t, isCompleted: true } : t));
    } catch (error) {
      toast.error("An error occurred while snoozing.");
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

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const overdueTasks = pendingTasks.filter(t => {
    const taskDate = new Date(t.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() < todayDate.getTime();
  });

  const regularPendingTasks = pendingTasks.filter(t => {
    const taskDate = new Date(t.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() >= todayDate.getTime();
  });

  const groupTasksByType = (taskList: Task[]) => {
    return taskList.reduce((acc, task) => {
      let type = task.taskType || 'follow_up';
      if (type === 'follow_up' && task.taskDescription.includes('Connection Request')) type = 'connection_request';
      if (!acc[type]) acc[type] = [];
      acc[type].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  };

  const groupedPending = groupTasksByType(regularPendingTasks);
  const groupedCompleted = groupTasksByType(completedTasks);

  const renderTaskGroup = (type: string, groupTasks: Task[], isCompletedGroup: boolean = false, isOverdueGroup: boolean = false) => {
    const headerTitle = isOverdueGroup ? "🔥 Priority / Overdue" : (TASK_TYPE_LABELS[type] || type.replace('_', ' ').toUpperCase());
    const headerBg = isOverdueGroup ? 'bg-red-50 border-b border-red-100 dark:bg-red-950/50 dark:border-red-900' : (isCompletedGroup ? 'bg-zinc-100/50 dark:bg-zinc-800/30' : 'bg-indigo-50/80 dark:bg-indigo-950/50');
    const titleColor = isOverdueGroup ? 'text-red-700 dark:text-red-400' : (isCompletedGroup ? 'text-zinc-600 dark:text-zinc-400' : 'text-indigo-900 dark:text-indigo-300');
    const badgeStyle = isOverdueGroup ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800' : (isCompletedGroup ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' : 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800');
    const cardBorder = isOverdueGroup ? 'border-red-200 shadow-md ring-1 ring-red-500/20 dark:border-red-900/50' : (isCompletedGroup ? 'dark:border-zinc-800' : 'border-zinc-200 shadow-sm dark:border-zinc-800');
    
    return (
      <Card key={type} className={`overflow-hidden ${isCompletedGroup ? 'opacity-60 bg-zinc-50/50 dark:bg-zinc-900/20' : `bg-white dark:bg-zinc-900 ${cardBorder}`}`}>
        <div className={`px-5 py-4 flex items-center justify-between ${headerBg}`}>
          <h3 className={`text-lg md:text-xl font-bold ${titleColor}`}>
            {headerTitle}
          </h3>
          <Badge variant="outline" className={`font-bold px-3 py-1 text-sm ${badgeStyle}`}>
            {groupTasks.length}
          </Badge>
        </div>
        <CardContent className="p-0">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {groupTasks.map(task => {
              const taskDate = new Date(task.dueDate);
              taskDate.setHours(0, 0, 0, 0);
              const isOverdue = !isCompletedGroup && taskDate.getTime() < todayDate.getTime();
              const daysOverdue = Math.floor((todayDate.getTime() - taskDate.getTime()) / (1000 * 3600 * 24));
              
              return (
                <TaskListItem 
                  key={task._id} 
                  task={task} 
                  isCompletedGroup={isCompletedGroup} 
                  toggleTaskCompletion={toggleTaskCompletion}
                  isOverdue={isOverdue}
                  daysOverdue={daysOverdue}
                  handleNotAccepted={handleNotAccepted}
                />
              );
            })}
          </ul>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-10 w-full max-w-full">
      <div className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Pending Today
        </h2>
        {pendingTasks.length === 0 ? (
          <p className="text-base text-zinc-500 italic">No pending tasks for today!</p>
        ) : (
          <div className="grid gap-6">
            {overdueTasks.length > 0 && renderTaskGroup('overdue', overdueTasks, false, true)}
            {Object.entries(groupedPending).map(([type, tasks]) => renderTaskGroup(type, tasks, false, false))}
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-zinc-200 dark:border-zinc-800 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Completed
          </h2>
          <div className="grid gap-6">
            {Object.entries(groupedCompleted).map(([type, tasks]) => renderTaskGroup(type, tasks, true, false))}
          </div>
        </div>
      )}
    </div>
  );
}
