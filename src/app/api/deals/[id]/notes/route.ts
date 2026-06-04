import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Deal } from '@/models/Deal';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    const updatedDeal = await Deal.findByIdAndUpdate(
      id,
      { 
        $push: { notes: { text, createdAt: new Date() } },
        lastActivityDate: new Date() 
      },
      { new: true } // Returns the updated document
    );

    if (!updatedDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deal: updatedDeal });
  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
