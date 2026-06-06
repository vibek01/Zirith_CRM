import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { LeadBank } from '@/models/LeadBank';
import { Deal } from '@/models/Deal';
import { User } from '@/models/User';
import { LeadAssignmentState } from '@/models/LeadAssignmentState';

export async function GET(req: Request) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Pull 50 pending leads
    const pendingLeads = await LeadBank.find({ status: 'pending' }).limit(50).sort({ createdAt: 1 });
    
    if (pendingLeads.length === 0) {
      return NextResponse.json({ success: true, message: 'No pending leads found to auto-push.', pushed: 0 }, { status: 200 });
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
          currentStage: 'prospecting', // Explicitly place into Prospecting column
          assignedOwnerId,
        });
        
        pushedCount++;
      }

      // Mark lead as dispatched
      lead.status = 'dispatched';
      await lead.save();
    }

    return NextResponse.json({ success: true, pushed: pushedCount, processed: pendingLeads.length }, { status: 200 });
  } catch (error) {
    console.error('Error in auto-push-leads cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
