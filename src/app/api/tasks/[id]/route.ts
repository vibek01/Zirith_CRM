import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { DailyTask } from '@/models/DailyTask';
import { auth } from '@/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isCompleted } = body;

    await connectToDatabase();

    const updatedTask = await DailyTask.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isCompleted } },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
