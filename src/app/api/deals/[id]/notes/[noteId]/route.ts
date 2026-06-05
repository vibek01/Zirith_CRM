import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Deal } from '@/models/Deal';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; noteId: string }> }) {
  try {
    const { id, noteId } = await params;

    await connectToDatabase();
    
    const updatedDeal = await Deal.findByIdAndUpdate(
      id,
      { $pull: { notes: { _id: noteId } } },
      { new: true }
    );

    if (!updatedDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
