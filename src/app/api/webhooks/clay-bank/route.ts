import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { LeadBank } from '@/models/LeadBank';

const CLAY_WEBHOOK_SECRET = process.env.CLAY_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    // Optional: Secure the endpoint with a secret
    if (CLAY_WEBHOOK_SECRET && authHeader !== `Bearer ${CLAY_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

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

    // Prevent duplicates in the bank
    const queryConditions: any[] = [
      { companyName: { $regex: new RegExp(`^${companyName}$`, 'i') } }
    ];
    if (finalWebsite) queryConditions.push({ website: finalWebsite });
    if (linkedInUrl) queryConditions.push({ linkedInUrl: linkedInUrl });

    const existingLead = await LeadBank.findOne({ $or: queryConditions });
    if (existingLead) {
      return NextResponse.json(
        { success: true, message: 'Lead already exists in bank. Skipped.', leadId: existingLead._id }, 
        { status: 200 }
      );
    }

    const newLead = await LeadBank.create({
      companyName,
      website: finalWebsite,
      instagramLink,
      linkedInUrl,
      email,
      contactName: finalContactName,
      status: 'pending',
      rawData: body,
    });

    return NextResponse.json({ success: true, leadId: newLead._id }, { status: 201 });
  } catch (error) {
    console.error('Error processing Clay Bank webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
