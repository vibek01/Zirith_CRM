# Zirith CRM

![Zirith CRM](public/images/zirithLogo.jpeg)

**A sleek, automated customer relationship management tool engineered specifically for the Zirith team.**

Zirith CRM centralizes lead management by seamlessly syncing with Clay webhook data. It features a beautifully designed, Hubspot-inspired Kanban pipeline, integrated Google authentication, and a powerful background engine that automatically assigns daily tasks and drives deals forward based on precise, time-bound SLAs. Say goodbye to manual follow-ups and lost leads.

### Tags
`nextjs`, `react`, `typescript`, `tailwindcss`, `mongodb`, `mongoose`, `shadcn-ui`, `crm`, `kanban`, `automation`, `cron`, `resend`, `nextauth`

## Features
- **Automated Pipeline**: Deals advance autonomously based on configurable 2-day, 3-day, and 4-day SLA timers.
- **Daily Tasks Engine**: A Vercel Cron Job checks deal ages daily and assigns follow-up tasks to the team.
- **Round-Robin Assignment**: Incoming leads from Clay are automatically assigned to team members equitably.
- **Real-Time Kanban**: Drag-and-drop pipeline interface built with `@dnd-kit`.
- **Integrated Comms**: 1-click email and LinkedIn access straight from the deal cards.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
