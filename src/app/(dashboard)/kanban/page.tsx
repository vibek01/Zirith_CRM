import { KanbanWrapper } from "@/components/kanban/KanbanWrapper";
import { KanbanHeaderActions } from "@/components/kanban/KanbanHeaderActions";
import connectToDatabase from "@/lib/mongoose";
import { Deal } from "@/models/Deal";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const isAdmin = session?.user?.email === 'binforpc@gmail.com';

  const isMockEnv = process.env.MOCK_ENV === "true";
  let serializedDeals: any[] = [];

  if (isMockEnv) {
    serializedDeals = [
      { id: "1", _id: "1", companyName: "Acme Corp", contactName: "John Doe", email: "john@acme.com", currentStage: "prospecting", lastActivityDate: new Date().toISOString(), createdAt: new Date().toISOString() },
      { id: "2", _id: "2", companyName: "Globex", contactName: "Jane Smith", email: "jane@globex.com", currentStage: "connected", lastActivityDate: new Date().toISOString(), createdAt: new Date().toISOString() },
      { id: "3", _id: "3", companyName: "Initech", contactName: "Peter Gibbons", email: "peter@initech.com", currentStage: "follow up 1", lastActivityDate: new Date().toISOString(), createdAt: new Date().toISOString() },
      { id: "4", _id: "4", companyName: "Umbrella Corp", contactName: "Albert Wesker", email: "albert@umbrella.com", currentStage: "meeting booked", lastActivityDate: new Date().toISOString(), createdAt: new Date().toISOString() },
      { id: "5", _id: "5", companyName: "Stark Industries", contactName: "Tony Stark", email: "tony@stark.com", currentStage: "closed won", lastActivityDate: new Date().toISOString(), createdAt: new Date().toISOString() },
      { id: "6", _id: "6", companyName: "Wayne Enterprises", contactName: "Bruce Wayne", email: "bruce@wayne.com", currentStage: "prospecting", lastActivityDate: new Date().toISOString(), createdAt: new Date().toISOString() }
    ];
  } else if (userId) {
    await connectToDatabase();
    
    let targetUserId = userId;
    if (isAdmin) {
      const cookieStore = await cookies();
      const adminViewUserId = cookieStore.get('adminViewUserId')?.value;
      if (adminViewUserId === 'all') {
        targetUserId = null;
      } else if (adminViewUserId) {
        targetUserId = adminViewUserId;
      }
    }
    
    // Fetch deals from MongoDB filtered by the target user's ID
    const query = targetUserId ? { assignedOwnerId: targetUserId } : {};
    const deals = await Deal.find(query).lean();
    
    // Convert _id to string for client component serialization
    serializedDeals = deals.map(deal => ({
      ...deal,
      _id: deal._id.toString(),
      id: deal._id.toString(), // needed for dnd-kit
      assignedOwnerId: deal.assignedOwnerId?.toString(),
      lastActivityDate: deal.lastActivityDate.toISOString(),
      createdAt: deal.createdAt.toISOString(),
      notes: deal.notes ? deal.notes.map((n: any) => ({
        ...n,
        _id: n._id.toString(),
        createdAt: n.createdAt.toISOString(),
      })) : [],
    }));
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Pipeline</h1>
          <p className="text-sm text-zinc-500 mt-1">Drag and drop deals across stages.</p>
        </div>
        <KanbanHeaderActions />
      </div>
      <div className="flex-1 overflow-hidden">
        {/* We need to pass initial data to Zustand store in a client wrapper */}
        <KanbanWrapper initialDeals={serializedDeals} />
      </div>
    </div>
  );
}
