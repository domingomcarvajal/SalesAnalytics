# Sales meeting analysis

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/domingomcarvajal-3004s-projects/v0-sales-meeting-analysis)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/dWlkSEPFWQD)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/domingomcarvajal-3004s-projects/v0-sales-meeting-analysis](https://vercel.com/domingomcarvajal-3004s-projects/v0-sales-meeting-analysis)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/dWlkSEPFWQD](https://v0.app/chat/dWlkSEPFWQD)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- A Neon database (already connected to your v0 project)
- An OpenAI API key for transcript processing

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your actual values in `.env.local`:
   - `DATABASE_URL`: Get this from your [Neon dashboard](https://console.neon.tech)
   - `OPENAI_API_KEY`: Get this from [OpenAI Platform](https://platform.openai.com/api-keys)

### Database Setup

Run the SQL migration scripts in order:

1. `scripts/001-create-tables.sql` - Creates initial tables
2. `scripts/002-update-schema.sql` - Updates schema to match CSV format

You can run these directly from the v0 interface or using a Neon SQL client.

### CSV Format

The application expects CSV files with the following columns:

- `client_name` (string)
- `client_email` (string)
- `client_phone_number` (string)
- `meeting_date` (string, will be converted to date)
- `sales_person` (string)
- `closed` (0 or 1, will be converted to boolean)
- `transcript` (string)

### Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Application Flow

1. **Upload** (`/upload`) - Upload CSV files with meeting data
2. **Process** (`/process`) - Run AI analysis on transcripts to extract insights
3. **Dashboard** (`/`) - View analytics with filters and visualizations
