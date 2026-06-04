import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Deal } from '@/models/Deal';
import { User } from '@/models/User';
import { LeadAssignmentState } from '@/models/LeadAssignmentState';

// Define a secret to secure the webhook endpoint
const CLAY_WEBHOOK_SECRET = process.env.CLAY_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    // Optional: Secure the endpoint with a secret
    if (CLAY_WEBHOOK_SECRET && authHeader !== `Bearer ${CLAY_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Expected Payload structure
    const {
      companyName,
      website,
      companyDomain, // Alias for website from Clay
      instagramLink,
      linkedInUrl,
      email,
      contactName,
      fullName, // Alias for contactName from Clay
      ...otherData
    } = body;

    const finalWebsite = website || companyDomain;
    const finalContactName = contactName || fullName;

    if (!companyName) {
      return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Prevent Duplicates
    const queryConditions: any[] = [
      { companyName: { $regex: new RegExp(`^${companyName}$`, 'i') } }
    ];
    if (finalWebsite) queryConditions.push({ website: finalWebsite });
    if (linkedInUrl) queryConditions.push({ linkedInUrl: linkedInUrl });

    const existingDeal = await Deal.findOne({ $or: queryConditions });
    if (existingDeal) {
      return NextResponse.json(
        { success: true, message: 'Deal already exists. Skipped.', dealId: existingDeal._id }, 
        { status: 200 }
      );
    }

    // Round-Robin Lead Assignment Logic
    const users = await User.find({ role: 'member' }).sort({ createdAt: 1 });
    let assignedOwnerId: string | undefined = undefined;

    if (users.length > 0) {
      // 1. Get atomic lock/increment for the round-robin counter
      const state = await LeadAssignmentState.findOneAndUpdate(
        { type: 'roundRobin' },
        { $inc: { currentIndex: 1 } },
        { upsert: true, new: true }
      );
      
      // 2. Use modulo to perfectly wrap around the array mathematically
      const nextUserIndex = (state.currentIndex - 1) % users.length;
      assignedOwnerId = users[nextUserIndex]._id.toString();
    }

    const newDeal = await Deal.create({
      companyName,
      website: finalWebsite,
      instagramLink,
      linkedInUrl,
      email,
      contactName: finalContactName,
      currentStage: 'prospecting',
      assignedOwnerId,
    });

    return NextResponse.json({ success: true, dealId: newDeal._id }, { status: 201 });
  } catch (error) {
    console.error('Error processing Clay webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
