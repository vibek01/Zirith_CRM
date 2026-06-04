import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Deal } from '@/models/Deal';
import { DailyTask } from '@/models/DailyTask';
import { User } from '@/models/User';
import { Resend } from 'resend';
import { DealStage } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY || 'mock_key');

export async function GET(req: Request) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // 1. Evaluate Deals and Generate Tasks
    const activeDeals = await Deal.find({
      currentStage: { $nin: ['closed won', 'closed lost', 'unqualified'] }
    });

    const tasksToInsert = [];
    const today = new Date();

    // Normalize today for calendar math
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);

    for (const deal of activeDeals) {
      if (!deal.assignedOwnerId) continue;

      // Check if this deal already has an uncompleted task. 
      // If it does, we don't need to generate a new one yet.
      const existingTask = await DailyTask.findOne({ dealId: deal._id, isCompleted: false });
      if (existingTask) continue;

      const activityDate = new Date(deal.lastActivityDate);
      activityDate.setHours(0, 0, 0, 0);

      const daysSinceLastActivity = Math.floor((todayDate.getTime() - activityDate.getTime()) / (1000 * 3600 * 24));

      let shouldFollowUp = false;
      let taskDesc = '';
      let nextStage: DealStage | null = null;
      let taskType = '';

      // For prospecting, trigger immediately on the first cron run (days >= 0)
      if (deal.currentStage === 'prospecting' && daysSinceLastActivity >= 0) {
        taskDesc = `Send LinkedIn Connection Request to ${deal.companyName}`;
        taskType = 'connection_request';
        nextStage = 'connection sent';
      } else if (deal.currentStage === 'connection sent' && daysSinceLastActivity >= 2) {
        taskDesc = `Send 'Value Delivered' to ${deal.companyName}`;
        taskType = 'deliver_value';
        nextStage = 'value delivered';
      } else if (deal.currentStage === 'value delivered' && daysSinceLastActivity >= 3) {
        taskDesc = `Drop the 90sec Pitch to ${deal.companyName}`;
        taskType = 'drop_pitch';
        nextStage = 'pitch dropped';
      } else if (deal.currentStage === 'pitch dropped' && daysSinceLastActivity >= 4) {
        taskDesc = `Send Follow-up to ${deal.companyName}`;
        taskType = 'follow_up';
        nextStage = 'follow-up';
      }

      if (taskType) {
        // Only generate the task if a task of this EXACT type has never been generated for this deal
        // This prevents duplicate tasks from being created if the user marks it as completed but 
        // doesn't manually move the deal out of the manual prospecting stage.
        const hasTaskOfThisType = await DailyTask.findOne({ dealId: deal._id, taskType: taskType });

        if (!hasTaskOfThisType) {
          shouldFollowUp = true;
        }
      }

      if (shouldFollowUp) {
        tasksToInsert.push({
          userId: deal.assignedOwnerId,
          dealId: deal._id,
          taskDescription: taskDesc,
          taskType: taskType,
          dueDate: today,
        });

        if (nextStage) {
          deal.currentStage = nextStage;
          deal.lastActivityDate = today;
          await deal.save();
        }
      }
    }

    // Clear old uncompleted daily tasks if needed or just insert new ones
    if (tasksToInsert.length > 0) {
      await DailyTask.insertMany(tasksToInsert);
    }

    // 2. Dispatch Notifications
    const users = await User.find({});

    for (const user of users) {
      const userTasks = await DailyTask.find({
        userId: user._id,
        isCompleted: false,
        dueDate: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999))
        }
      }).populate('dealId');

      if (userTasks.length > 0 && user.email) {
        // Send Email via Resend
        const emailContent = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px 20px; border-radius: 8px;">
            <div style="background-color: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">ZIRITH CRM</h1>
                <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Daily Action Plan • ${new Date().toDateString()}</p>
              </div>
              
              <div style="margin-bottom: 24px;">
                <h2 style="color: #374151; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Your Tasks Today</h2>
                
                <div style="display: block;">
                  ${userTasks.map(t => `
                    <div style="display: block; background-color: #f3f4f6; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 12px;">
                      <p style="margin: 0; color: #1f2937; font-size: 15px; font-weight: 500; line-height: 1.4;">${t.taskDescription}</p>
                      <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">${t.taskType.replace('_', ' ')}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <a href="https://zirithcrm.vercel.app/tasks" style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; display: inline-block;">Open Command Center</a>
              </div>
            </div>
          </div>
        `;

        try {
          await resend.emails.send({
            from: 'Zirith CRM <team@zirith.in>',
            to: user.email,
            subject: 'Your Daily CRM Tasks',
            html: emailContent,
          });
        } catch (e) {
          console.error(`Failed to send email to ${user.email}`, e);
        }

        // WhatsApp dispatch can be added here using Twilio/Meta API
        // sendWhatsAppMessage(user.whatsappNumber, text);
      }
    }

    return NextResponse.json({ success: true, generatedTasksCount: tasksToInsert.length });
  } catch (error) {
    console.error('Error in daily tasks cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
