"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Link as LinkIcon, Globe, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useKanbanStore } from '@/store/kanbanStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

interface KanbanCardProps {
  deal: any; // Type it better in production
}

export function KanbanCard({ deal }: KanbanCardProps) {
  const { selectedDealIds, toggleDealSelection, updateDealNotes, removeDealNote } = useKanbanStore();
  const isSelected = selectedDealIds.includes(deal._id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal._id });

  const [note, setNote] = useState('');
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    setIsSavingNote(true);
    try {
      const res = await fetch(`/api/deals/${deal._id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: note }),
      });
      if (!res.ok) throw new Error('Failed to save note');
      
      const data = await res.json();
      const addedNote = data.deal.notes[data.deal.notes.length - 1];
      
      updateDealNotes(deal._id, addedNote);
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
      const res = await fetch(`/api/deals/${deal._id}/notes/${noteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete note');
      removeDealNote(deal._id, noteId);
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`group relative overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 shadow-md hover:shadow-lg transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-xl scale-105 border-indigo-500/50' : ''}`}
      {...attributes}
      {...listeners}
    >
      {/* Selection border and background */}
      {isSelected && <div className="absolute inset-0 bg-indigo-50/50 border-2 border-indigo-500 rounded-lg pointer-events-none z-10" />}
      
      {/* Drag handle area indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <CardHeader className="p-3 pb-2 flex flex-row items-start space-y-0 gap-3">
        <div className="pt-0.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700 font-bold">
              {(deal.contactName || deal.companyName).split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="space-y-1 overflow-hidden flex-1">
          <CardTitle className="text-lg font-bold truncate text-zinc-900 dark:text-zinc-50 leading-tight">
            {deal.companyName}
          </CardTitle>
          {deal.contactName && (
            <p className="text-[15px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
              {deal.contactName}
            </p>
          )}
        </div>
        <div onPointerDown={(e) => e.stopPropagation()} className="pt-0.5">
          <Checkbox 
            checked={isSelected}
            onCheckedChange={() => toggleDealSelection(deal._id)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-3 pt-0">
        <div className="flex items-center gap-2 mt-3">
          {deal.email && (
            <a href={`mailto:${deal.email}`} onPointerDown={(e) => e.stopPropagation()} className="cursor-pointer">
              <Badge variant="secondary" className="px-2 py-1 h-7 rounded-md bg-blue-50 text-blue-800 border border-blue-200 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 font-bold">
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Email</span>
              </Badge>
            </a>
          )}
          {deal.linkedInUrl && (
            <a href={deal.linkedInUrl} target="_blank" rel="noopener noreferrer" onPointerDown={(e) => e.stopPropagation()} className="cursor-pointer">
              <Badge variant="secondary" className="px-2 py-1 h-7 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 dark:border-indigo-800/50 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-100 font-bold">
                <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">LinkedIn</span>
              </Badge>
            </a>
          )}
          {deal.website && (
            <a href={deal.website.startsWith('http') ? deal.website : `https://${deal.website}`} target="_blank" rel="noopener noreferrer" onPointerDown={(e) => e.stopPropagation()} className="cursor-pointer">
              <Badge variant="secondary" className="px-2 py-1 h-7 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 font-bold">
                <Globe className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs">Website</span>
              </Badge>
            </a>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-300 dark:border-zinc-700">
          <div className="flex flex-col">
            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Created: {new Date(deal.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mt-1">
              Updated: {new Date(deal.lastActivityDate || deal.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
              <DialogTrigger render={
                <Button variant="ghost" size="icon" onPointerDown={(e) => e.stopPropagation()} className="h-6 w-6 rounded-full text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 relative" />
              }>
                <FileText className="h-3.5 w-3.5" />
                {deal.notes && deal.notes.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[14px] h-[14px] flex items-center justify-center">
                    {deal.notes.length}
                  </span>
                )}
              </DialogTrigger>
              <DialogContent onPointerDown={(e) => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>Notes for {deal.companyName}</DialogTitle>
                  <DialogDescription>View past notes or add a new one.</DialogDescription>
                </DialogHeader>
                
                {deal.notes && deal.notes.length > 0 && (
                  <div className="max-h-[200px] overflow-y-auto space-y-2 mb-2 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-md">
                    {deal.notes.map((n: any, i: number) => (
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
