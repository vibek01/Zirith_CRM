import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Deal } from '@/models/Deal';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { currentStage } = body;

    if (!currentStage) {
      return NextResponse.json({ error: 'currentStage is required' }, { status: 400 });
    }

    const isMockEnv = process.env.MOCK_ENV === "true";
    if (isMockEnv) {
      return NextResponse.json({ success: true, deal: { id, currentStage } });
    }

    await connectToDatabase();
    const updatedDeal = await Deal.findByIdAndUpdate(
      id,
      { currentStage, lastActivityDate: new Date() },
      { new: true }
    );

    if (!updatedDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deal: updatedDeal });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
