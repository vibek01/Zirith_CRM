import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { DailyTask } from '@/models/DailyTask';
import { Deal } from '@/models/Deal';
import { auth } from '@/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const task = await DailyTask.findOne({ _id: id, userId });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const deal = await Deal.findById(task.dealId);
    if (!deal) {
      return NextResponse.json({ error: 'Associated deal not found' }, { status: 404 });
    }

    // Increment the retry count
    deal.connectionRetryCount = (deal.connectionRetryCount || 0) + 1;

    let actionResponse = '';

    if (deal.connectionRetryCount >= 3) {
      // 3 Strikes - Move to Unqualified
      deal.currentStage = 'unqualified';
      task.isCompleted = true;
      actionResponse = 'unqualified';
    } else {
      // Snooze - Move back to Connection Sent and reset last activity date
      deal.currentStage = 'connection sent';
      deal.lastActivityDate = new Date(); // Reset to today so cron job waits 2 days
      task.isCompleted = true;
      actionResponse = 'snoozed';
    }

    await deal.save();
    await task.save();

    return NextResponse.json({ 
      success: true, 
      action: actionResponse,
      dealStage: deal.currentStage,
      retryCount: deal.connectionRetryCount
    }, { status: 200 });

  } catch (error) {
    console.error('Error in not-accepted handler:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
