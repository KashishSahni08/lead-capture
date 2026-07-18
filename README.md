# Lead Capture & Automation Pipeline

An end-to-end martech project that captures leads from a landing page, automates their onboarding, logs them for reporting, and visualizes performance on a live dashboard — built to demonstrate marketing automation, analytics, and full-stack development working together.

## Problem statement

Marketing teams need leads captured, welcomed, logged, and reported on automatically — without manual work for every signup. This project simulates that pipeline for a SaaS free-trial signup: a visitor fills a form, gets a welcome email, their data is logged and shared with the team, and results are visualized on a dashboard.

## How it works

```
React Landing Page (form)
        │
        ▼
   n8n Webhook
        │
        ▼
   Switch (routes by lead source)
        │
   ┌────┼────────────┐
   ▼    ▼            ▼
 Gmail  Google Sheets Discord
(email) (logging)     (team alert)


Google Sheets ──► React Dashboard (Recharts, live via Sheets API)
React Landing Page ──► GA4 (event tracking: form_start, form_submit)
```

## Features

- **Lead capture form** — React landing page with name, email, and source fields, styled and deployed
- **Marketing automation** — n8n workflow that branches by lead source and triggers three parallel actions: a welcome email, a spreadsheet log entry, and a real-time Discord alert
- **Event tracking** — GA4 custom events (`form_start`, `form_submit`) marked as a key event, used to calculate a real form-completion rate
- **Live analytics dashboard** — React + Recharts dashboard pulling directly from the Google Sheets API, showing signups over time, by source, and a source breakdown

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React (Vite), Recharts, GA4 |
| Automation | n8n (Webhook, Switch, Gmail, Google Sheets, HTTP Request) |
| Data store | Google Sheets (via Sheets API) |
| Notifications | Discord Webhook |
| Deployment | Vercel |

## Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Add your GA4 Measurement ID to `index.html`.
3. Add your n8n Production Webhook URL to `src/components/LeadForm.jsx`.
4. Add your Google Sheet ID and Sheets API key to `src/components/Dashboard.jsx`.
5. Run locally:
   ```bash
   npm run dev
   ```

## Screenshots


## What I'd add with more time

- Lead scoring based on source and engagement
- A real CRM integration (HubSpot) instead of a plain Google Sheet
- A/B testing on the landing page copy, tracked through GA4

## Author

Kashish Sahni 
