import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { LeadBank } from '@/models/LeadBank';
import { auth } from '@/auth';

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.email !== 'binforpc@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const result = await LeadBank.deleteMany({ status: 'dispatched' });

    return NextResponse.json({ success: true, deletedCount: result.deletedCount }, { status: 200 });
  } catch (error) {
    console.error('Error deleting dispatched leads:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
