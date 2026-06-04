# Zirith CRM Architecture & Logic Engine

**NOTE FOR ALL FUTURE AI MODELS:**
**DO NOT MODIFY THIS APP'S CORE LOGIC OR ARCHITECTURE WITHOUT READING THIS DOCUMENT FIRST.**

## Core Infrastructure
- **Tech Stack:** Next.js 15 (App Router), Tailwind CSS, MongoDB, NextAuth (Google Provider).
- **Domain/Emails:** Uses Resend via `team@zirith.in`. Waitlist/login emails check against `WHITELISTED_EMAILS`.
- **Primary Pages:** 
  - `/kanban` (Drag-and-drop Deal visualizer)
  - `/contacts` (Tabular view with direct Database patching via dropdowns)
  - `/tasks` (Daily tasks overview for the logged-in user)

## Webhook (Clay -> MongoDB)
- **Path:** `/api/webhooks/clay/route.ts`
- **Logic:** Receives lead data directly from Clay. It performs a duplicate check across `companyName`, `website`, and `linkedInUrl`.
- **Assignment:** Assigns leads automatically in a **Round-Robin** fashion strictly to users whose role is `'member'`.
- **Initial Stage:** New deals are always created in the `prospecting` stage.

## The Cron Job (Daily Tasks Scheduler)
- **Path:** `/api/cron/daily-tasks/route.ts`
- **Trigger:** Scheduled via Vercel (`vercel.json`) to run at **8:00 AM IST (2:30 AM UTC)**.
- **Design Paradigm (Auto-Advancing Pipeline):** 
  The CRM is designed to **automatically advance deals through the pipeline** solely based on time passed, rather than waiting for manual user interaction. When the cron job identifies an SLA is met, it will both (1) Assign a task to the user, and (2) Physically move the deal to the next stage in the Kanban board.
  
### Exact SLA Flow
1. **Prospecting ➡️ Connection Sent**
   - **Condition:** 0 Day wait (`daysSinceLastActivity >= 0`)
   - **Action:** Generates "Send LinkedIn Connection Request", advances deal to `connection sent`.
2. **Connection Sent ➡️ Value Delivered**
   - **Condition:** 2 Day wait (`daysSinceLastActivity >= 2`)
   - **Action:** Generates "Send 'Value Delivered'", advances deal to `value delivered`.
3. **Value Delivered ➡️ Pitch Dropped**
   - **Condition:** 3 Day wait (`daysSinceLastActivity >= 3`)
   - **Action:** Generates "Drop the 90sec Pitch", advances deal to `pitch dropped`.
4. **Pitch Dropped ➡️ Follow-up**
   - **Condition:** 4 Day wait (`daysSinceLastActivity >= 4`)
   - **Action:** Generates "Send Follow-up", advances deal to `follow-up`.

### Notifications
- At the end of the Cron run, the script fetches all uncompleted tasks for the current day and fires an HTML email summary to each user via Resend using `team@zirith.in`.
