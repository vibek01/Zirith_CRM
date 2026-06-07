"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from 'lucide-react';

export function AdminUserSelect({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Read current cookie if any, otherwise default to current user
    const match = document.cookie.match(new RegExp('(^| )adminViewUserId=([^;]+)'));
    if (match) {
      setSelectedUser(match[2]);
    } else {
      setSelectedUser(currentUserId);
    }

    // Fetch users
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentUserId]);

  const handleUserChange = (userId: string | null) => {
    if (!userId) return;
    setSelectedUser(userId);
    // Set cookie that expires in 1 day
    document.cookie = `adminViewUserId=${userId}; path=/; max-age=86400`;
    // Refresh the router to trigger server components refetch
    router.refresh();
  };

  const getSelectedDisplayName = () => {
    if (!selectedUser) return "Select user view...";
    if (selectedUser === currentUserId) return "My View";
    if (selectedUser === "all") return "All Users";
    const foundUser = users.find(u => u._id.toString() === selectedUser);
    return foundUser ? foundUser.name : selectedUser;
  };

  // Prevent hydration mismatch by returning null until mounted, or just return default
  if (!selectedUser || isLoading) return null;

  return (
    <div className="px-4 mt-6">
      <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5" />
        Admin View
      </div>
      <Select value={selectedUser} onValueChange={handleUserChange}>
        <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-300 focus:ring-indigo-500 h-9 text-sm">
          <div className="flex items-center gap-2 truncate">
            <SelectValue placeholder="Select user view...">
              {getSelectedDisplayName()}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-zinc-900">
          <SelectItem value={currentUserId}>My View</SelectItem>
          <SelectItem value="all">All Users</SelectItem>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
          {users.map(u => (
            u._id.toString() !== currentUserId && (
              <SelectItem key={u._id} value={u._id.toString()}>
                {u.name}
              </SelectItem>
            )
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
