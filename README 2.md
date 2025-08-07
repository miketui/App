# Frontend

This directory contains the React frontend for Haus of Basquiat.  It is configured as a PWA using Vite and TailwindCSS and includes basic components for authentication, document browsing, messaging, and the social feed.

## Running Locally

Ensure you have Node.js installed.  Then, from within the `frontend` directory:

```bash
npm install
npm run dev
```

This will start the Vite development server.  Environment variables are pulled from `.env` in the root when available; during development you can configure them in `.env` or use `import.meta.env` variables.

## Architecture

The frontend uses:

- **React** for the component architecture and routing
- **TailwindCSS** for utility‑first styling
- **Supabase** via `@supabase/supabase-js` for authentication and real‑time features
- **Axios** for REST API requests to the backend
- A **service worker** (configured by Vite) to enable offline access and install prompts

Components are organized in `src/components`, pages are in `src/pages`, and global context/providers live in `src/context`.

### Authentication

The `AuthProvider` component wraps the application and handles magic link login via Supabase.  The login page includes a simple form for an email address and calls Supabase's `signInWithOtp` to send a magic link.  Upon successful authentication, users are redirected based on their role.

### Document Library

Use `DocumentList` to fetch and display documents by category.  Admins can upload PDFs and images using the `UploadForm`.  Files are stored in Supabase Storage and metadata lives in a `documents` table.  Downloads increment a `download_count` column.

### Messaging

Real‑time messaging uses Supabase Realtime subscriptions.  The `ChatProvider` manages threads and messages.  Redis caching is accessed via backend endpoints.

### Feed

The `FeedList` component shows posts with lazy loading and optimistic updates for likes and comments.  `PostForm` allows members to create posts; AI caption suggestions appear after the user types some text.

### Payments

Stripe subscription and checkout flows are integrated into `SubscribeButton` and `BillingHistory` components.  These call secure backend endpoints to create sessions and handle webhooks.

### PWA features

Vite automatically registers a service worker.  The `usePWA` hook handles install prompts and optionally FaceID/TouchID authentication.

