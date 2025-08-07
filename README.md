# Backend

This directory hosts the Express API and service stubs for Haus of Basquiat.  It acts as the bridge between the frontend and Supabase, Upstash Redis, Stripe, Copyleaks, and AI services.  You can also implement Supabase Functions here if you prefer running serverless code directly on Supabase.

## Running Locally

```bash
npm install
npm start
```

The server will start on port 4000 by default (configurable via `PORT` environment variable).  API endpoints reside under `/api` and include routes for authentication, document upload/download, messaging, feed posts, payments, and AI moderation.  Many endpoints are stubs and should be expanded with full logic and validation.

## API Structure

- **Auth** (`POST /api/auth/login`) – Accepts an email and triggers a Supabase magic link.  Users are redirected after clicking the link in their email.
- **Documents** (`POST /api/docs/upload`, `GET /api/docs`) – Admins can upload documents; members can list and download based on role.
- **Messaging** (`POST /api/chat/thread`, `GET /api/chat/:threadId/messages`) – Creates chat threads and returns messages.  Utilizes Supabase Realtime and Redis caching for performance.
- **Feed** (`POST /api/posts`, `GET /api/posts`) – Handles post creation with Copyleaks moderation and AI caption suggestions.
- **Payments** (`POST /api/subscribe`, `GET /api/payments/history`) – Integrates Stripe for subscriptions and one‑time payments.  Webhooks update user roles and subscription status.
- **AI** (`POST /api/ai/summarize`, etc.) – Provides summarization and caption generation using OpenAI/Claude.

All requests should include a valid Supabase JWT in the `Authorization` header.  The server will verify the token and check the user's role before allowing access to restricted endpoints.
