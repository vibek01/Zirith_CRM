import { ContactsTable } from "@/components/contacts/ContactsTable";
import { columns } from "@/components/contacts/columns";
import connectToDatabase from "@/lib/mongoose";
import { Deal } from "@/models/Deal";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const isAdmin = session?.user?.email === 'binforpc@gmail.com';

  const isMockEnv = process.env.MOCK_ENV === "true";
  let serializedDeals: any[] = [];

  if (isMockEnv) {
    serializedDeals = [
      { id: "1", _id: "1", companyName: "Acme Corp", contactName: "John Doe", email: "john@acme.com", linkedInUrl: "https://linkedin.com/in/johndoe", website: "https://acme.com", currentStage: "prospecting", lastActivityDate: new Date().toISOString() },
      { id: "2", _id: "2", companyName: "Globex", contactName: "Jane Smith", email: "jane@globex.com", linkedInUrl: "https://linkedin.com/in/janesmith", website: "https://globex.com", currentStage: "connected", lastActivityDate: new Date().toISOString() },
      { id: "3", _id: "3", companyName: "Initech", contactName: "Peter Gibbons", email: "peter@initech.com", linkedInUrl: "https://linkedin.com/in/petergibbons", website: "https://initech.com", currentStage: "follow up 1", lastActivityDate: new Date().toISOString() },
      { id: "4", _id: "4", companyName: "Umbrella Corp", contactName: "Albert Wesker", email: "albert@umbrella.com", linkedInUrl: "https://linkedin.com/in/albertwesker", website: "https://umbrellacorp.com", currentStage: "meeting booked", lastActivityDate: new Date().toISOString() },
      { id: "5", _id: "5", companyName: "Stark Industries", contactName: "Tony Stark", email: "tony@stark.com", linkedInUrl: "https://linkedin.com/in/tonystark", website: "https://starkindustries.com", currentStage: "closed won", lastActivityDate: new Date().toISOString() },
      { id: "6", _id: "6", companyName: "Wayne Enterprises", contactName: "Bruce Wayne", email: "bruce@wayne.com", linkedInUrl: "https://linkedin.com/in/brucewayne", website: "https://wayneenterprises.com", currentStage: "prospecting", lastActivityDate: new Date().toISOString() }
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
    
    // Fetch deals from MongoDB filtered by assignedOwnerId
    const query = targetUserId ? { assignedOwnerId: targetUserId } : {};
    const deals = await Deal.find(query).sort({ createdAt: -1 }).lean();
    
    serializedDeals = deals.map(deal => ({
      id: deal._id.toString(),
      companyName: deal.companyName,
      contactName: deal.contactName,
      email: deal.email,
      linkedInUrl: deal.linkedInUrl,
      website: deal.website,
      currentStage: deal.currentStage,
      lastActivityDate: deal.lastActivityDate.toISOString(),
      createdAt: deal.createdAt ? deal.createdAt.toISOString() : deal.lastActivityDate.toISOString(),
    }));
  }

  return (
    <div className="flex flex-col h-full bg-transparent p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-zinc-500">Manage and view all your deals in a tabular format.</p>
        </div>
      </div>
      <ContactsTable columns={columns} data={serializedDeals} />
    </div>
  );
}
