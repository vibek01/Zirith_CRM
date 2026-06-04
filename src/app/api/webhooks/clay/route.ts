import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Deal } from '@/models/Deal';
import { User } from '@/models/User';

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
    // 1. Get all eligible users
    const users = await User.find({ role: 'member' }).sort({ createdAt: 1 });
    let assignedOwnerId: string | undefined = undefined;

    if (users.length > 0) {
      // 2. Find the last created deal that has an assigned owner
      const lastDeal = await Deal.findOne({ assignedOwnerId: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
      
      if (!lastDeal) {
        // No deals yet, assign to the first user
        assignedOwnerId = users[0]._id.toString();
      } else {
        // 3. Find whose turn it was last time
        const lastUserIndex = users.findIndex(u => u._id.toString() === lastDeal.assignedOwnerId?.toString());
        
        // 4. Assign to the next user in the list, wrapping back to 0 if at the end
        const nextUserIndex = lastUserIndex === -1 ? 0 : (lastUserIndex + 1) % users.length;
        assignedOwnerId = users[nextUserIndex]._id.toString();
      }
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
