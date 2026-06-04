import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongoose";
import { DailyTask } from "@/models/DailyTask";
import { TaskList } from "@/components/tasks/TaskList";
import { CheckSquare } from "lucide-react";

export const metadata = {
  title: "Daily Tasks | ZIRITH CRM",
};

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  await connectToDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch all tasks for the current user (you can also filter by today if needed)
  // For now, let's fetch all tasks that are due today or are overdue and pending
  const tasks = await DailyTask.find({
    userId,
    $or: [
      { isCompleted: false },
      { dueDate: { $gte: today } } // Also get completed tasks for today
    ]
  })
    .populate('dealId', 'companyName contactName')
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();

  // Convert ObjectIds and Dates to strings for the Client Component
  const serializedTasks = tasks.map((t: any) => ({
    _id: t._id.toString(),
    taskDescription: t.taskDescription,
    taskType: t.taskType,
    isCompleted: t.isCompleted,
    dueDate: t.dueDate.toISOString(),
    dealId: t.dealId ? {
      companyName: t.dealId.companyName,
      contactName: t.dealId.contactName,
    } : undefined,
  }));

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950/50">
      <div className="border-b bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Daily Tasks</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your pending follow-ups and connection requests.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 max-w-4xl w-full mx-auto">
        <TaskList initialTasks={serializedTasks} />
      </div>
    </div>
  );
}
