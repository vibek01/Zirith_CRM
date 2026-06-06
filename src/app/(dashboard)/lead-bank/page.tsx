import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongoose";
import { LeadBank } from "@/models/LeadBank";
import { LeadBankClient } from "@/components/leads/LeadBankClient";
import { Database } from "lucide-react";

export const metadata = {
  title: "Lead Bank | ZIRITH CRM",
};

export default async function LeadBankPage() {
  const session = await auth();
  
  if (session?.user?.email !== 'binforpc@gmail.com') {
    redirect('/');
  }

  await connectToDatabase();

  const leads = await LeadBank.find({}).sort({ createdAt: -1 }).lean();

  const serializedLeads = leads.map((l: any) => ({
    _id: l._id.toString(),
    companyName: l.companyName,
    contactName: l.contactName,
    email: l.email,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950/50">
      <div className="border-b bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Lead Bank</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Safely store raw leads from Clay and dispatch them to the pipeline in batches.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 w-full mx-auto">
        <LeadBankClient initialLeads={serializedLeads} />
      </div>
    </div>
  );
}
