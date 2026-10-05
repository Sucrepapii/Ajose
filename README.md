# Àjọṣe

Àjọṣe is a modern, digital platform for managing Ajo & Esusu rotational contribution schemes in Nigeria.
The platform allows organisers to create circles, manage members, and automatically collect contributions and disburse payouts via the Mono Open Banking API.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database / Auth**: Supabase (Postgres)
- **Payments / KYC**: Mono (Direct Debit & Payouts)
- **Styling**: Tailwind CSS 4, Framer Motion
- **Mobile**: Capacitor 8 (Web wrapper)

## Environment Variables
Copy `.env.example` to `.env.local` and configure:
- \`NEXT_PUBLIC_SUPABASE_URL\`: Supabase project URL
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`: Supabase anonymous key
- \`SUPABASE_SERVICE_ROLE_KEY\`: Supabase service role key (Backend only)
- \`MONO_SECRET_KEY\`: Mono API secret key
- \`MONO_WEBHOOK_SECRET\`: Mono webhook verification secret
- \`CRON_SECRET\`: Secret required to trigger automated sweeps and reminders
- \`RESEND_API_KEY\`: Resend email API key

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Build for production:
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

## Deployment
Àjọṣe is deployed to a self-hosted Node server using PM2. The deployment pipeline is triggered via GitHub Actions on the \`master\` branch. Ensure that all staging checks (linting, typechecking, tests) pass before merging.
