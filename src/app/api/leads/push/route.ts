import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { LeadBank } from '@/models/LeadBank';
import { Deal } from '@/models/Deal';
import { User } from '@/models/User';
import { LeadAssignmentState } from '@/models/LeadAssignmentState';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.email !== 'binforpc@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { count = 50 } = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(1, count), 100);

    await connectToDatabase();

    // Get pending leads
    const pendingLeads = await LeadBank.find({ status: 'pending' }).limit(limit).sort({ createdAt: 1 });
    
    if (pendingLeads.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending leads found.', pushed: 0 }, { status: 200 });
    }

    const users = await User.find({ role: 'member' }).sort({ createdAt: 1 });
    let pushedCount = 0;

    for (const lead of pendingLeads) {
      // 1. Prevent Duplicates in Pipeline
      const queryConditions: any[] = [
        { companyName: { $regex: new RegExp(`^${lead.companyName}$`, 'i') } }
      ];
      if (lead.website) queryConditions.push({ website: lead.website });
      if (lead.linkedInUrl) queryConditions.push({ linkedInUrl: lead.linkedInUrl });

      const existingDeal = await Deal.findOne({ $or: queryConditions });
      
      if (!existingDeal) {
        // Assign using round robin
        let assignedOwnerId: string | undefined = undefined;

        if (users.length > 0) {
          const state = await LeadAssignmentState.findOneAndUpdate(
            { type: 'roundRobin' },
            { $inc: { currentIndex: 1 } },
            { upsert: true, new: true }
          );
          const nextUserIndex = (state.currentIndex - 1) % users.length;
          assignedOwnerId = users[nextUserIndex]._id.toString();
        }

        await Deal.create({
          companyName: lead.companyName,
          website: lead.website,
          instagramLink: lead.instagramLink,
          linkedInUrl: lead.linkedInUrl,
          email: lead.email,
          contactName: lead.contactName,
          currentStage: 'prospecting',
          assignedOwnerId,
        });
        
        pushedCount++;
      }

      // Mark lead as dispatched regardless if it was skipped or added
      lead.status = 'dispatched';
      await lead.save();
    }

    return NextResponse.json({ success: true, pushed: pushedCount, processed: pendingLeads.length }, { status: 200 });
  } catch (error) {
    console.error('Error pushing leads:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
