# Haus of Basquiat Portal - Claude Code Configuration

## Project Overview
Members-only social platform for the ballroom and voguing community featuring role-based access control, real-time messaging, media galleries, event management, and subscription payments.

**Tech Stack**: Next.js 14+ • tRPC • Prisma • PostgreSQL • Supabase • Stripe • Socket.IO • PWA • AI APIs

---

## Getting Started
```bash
npm install -g @anthropic-ai/claude-code
cd haus-of-basquiat-portal
claude
```

## Essential Commands
- `/terminal-setup` - Enable shift+enter for multi-line inputs
- `/init` - Create project claude.md file 
- `/theme` - Toggle dark/light mode
- `/install-github-app` - Setup GitHub actions
- `Shift+Tab` - Auto-accept suggestions ("yolo mode")
- `Shift+Tab+Tab` - Plan mode for complex tasks
- `Esc` - Interrupt Claude
- `Esc+Esc` - Navigate command history
- `!` - Bash mode for terminal commands
- `@` - Mention files/folders for context
- `Ctrl+R` - Show full output/context
- `Ctrl+V` - Paste images (for UI mockups)
- `/claude-c` or `--resume` - Continue previous session

---

## Project-Specific Commands

### Database & Schema
```bash
# Setup & migrations
/db:setup - Initialize Prisma, run migrations, seed data
/db:migrate - Create and apply new migration
/db:seed - Populate database with ballroom community test data
/db:reset - Reset database and reseed (development only)

# Schema operations
/schema:analyze - Review database relationships and optimize
/schema:validate - Check for missing indexes and constraints
```

### Authentication & Security
```bash
# Auth system
/auth:test-flow - Test passwordless login code generation
/auth:validate-roles - Check RBAC implementation (ADMIN/LEADER/MEMBER/APPLICANT)
/auth:security-audit - Review JWT, sessions, and permission checks

# Security
/security:scan - Check for vulnerabilities and best practices
/security:rate-limits - Verify rate limiting implementation
/security:content-validation - Test file upload security
```

### Social Features
```bash
# Feed & Posts
/social:test-feed - Generate test posts and validate feed algorithm
/social:moderation - Test content moderation with AI integration
/social:real-time - Verify Socket.IO real-time updates

# Messaging
/messaging:test-threads - Create test conversations and validate
/messaging:file-sharing - Test file upload in messages
/messaging:notifications - Verify push notification system
```

### Ballroom Community Features
```bash
# Houses & Committees
/houses:setup - Create test houses with member hierarchies
/houses:events - Test event creation and RSVP system
/houses:battles - Setup voguing battle event templates

# Gallery & Media
/gallery:categories - Setup media categories (Performance/Fashion/Runway)
/gallery:upload-flow - Test multi-file upload with optimization
/gallery:lightbox - Verify gallery viewer functionality

# Applications
/applications:workflow - Test membership application approval flow
/applications:admin-review - Setup admin review dashboard
```

### Payments & Subscriptions
```bash
# Stripe Integration
/payments:setup-webhook - Configure Stripe webhook handling
/payments:test-checkout - Test subscription checkout flow
/payments:billing-portal - Verify customer billing management
/payments:analytics - Setup revenue tracking and reporting
```

### Admin & Analytics
```bash
# Admin Panel
/admin:dashboard - Setup admin metrics and KPIs
/admin:moderation-queue - Configure content review system
/admin:user-management - Test role assignments and account management
/admin:transparency - Setup community reporting features

# Analytics
/analytics:community-health - Track engagement and retention metrics
/analytics:content-performance - Monitor post and media analytics
/analytics:growth-forecasting - Setup predictive analytics
```

### PWA & Mobile
```bash
# Progressive Web App
/pwa:service-worker - Configure offline caching strategies
/pwa:manifest - Setup app installation prompts
/pwa:push-notifications - Test mobile push notifications
/pwa:offline-sync - Verify offline message queuing

# Mobile Optimization
/mobile:responsive - Test mobile-first responsive design
/mobile:touch-gestures - Verify gallery swipe and touch interactions
/mobile:performance - Optimize for mobile performance
```

---

## Development Workflows

### Feature Development
```bash
# Start new feature
/feature:start <feature-name> - Create branch, setup tRPC routes
/feature:ui-components - Generate UI components for feature
/feature:api-tests - Create API endpoint tests
/feature:integration - Test feature end-to-end

# Code quality
/code:lint-fix - Run ESLint and fix issues
/code:type-check - TypeScript strict mode validation
/code:test-coverage - Check test coverage for feature
```

### Testing Strategy
```bash
# Unit Tests
/test:components - Test React components with Vitest
/test:trpc-routes - Test API endpoints with mock data
/test:auth-flows - Test authentication edge cases

# Integration Tests
/test:user-journeys - Test complete user workflows
/test:real-time - Test Socket.IO message delivery
/test:payment-flow - Test Stripe integration end-to-end

# E2E Tests
/test:member-onboarding - Test application to approval workflow
/test:social-interactions - Test posting, commenting, messaging
/test:admin-workflows - Test content moderation and user management
```

### Deployment
```bash
# Production prep
/deploy:env-check - Validate environment variables
/deploy:security-scan - Run security audit before deploy
/deploy:performance - Check bundle size and optimize
/deploy:database-migrate - Run production migrations safely

# Railway deployment
/deploy:staging - Deploy to staging environment
/deploy:production - Deploy to production with health checks
/deploy:rollback - Rollback to previous version if needed
```

---

## Custom Project Commands

### Ballroom Community Specific
```bash
# Community management
/community:houses-setup - Initialize major ballroom houses
/community:categories-setup - Setup performance categories and tags
/community:guidelines - Review and update community guidelines
/community:safety-tools - Configure harassment reporting and blocking

# Event management
/events:battle-template - Create voguing battle event template
/events:workshop-template - Create workshop/class event template
/events:streaming-setup - Configure Livepeer integration for events
/events:calendar-sync - Test calendar integration and .ics export
```

### Content & Media
```bash
# Media processing
/media:optimization - Setup image/video compression pipeline
/media:categories - Configure gallery categories and filters
/media:moderation - Setup AI content moderation with Claude/OpenAI
/media:storage - Optimize Supabase storage and CDN delivery
```

---

## Helpful Prompts

### Planning & Architecture
- "Analyze the ballroom community social dynamics for UX design"
- "Review tRPC router structure for optimal organization"
- "Think deeply about LGBTQ+ safety and community moderation needs"
- "Design committee hierarchy and permission system"

### Development
- "Implement responsive gallery grid with ballroom aesthetic"
- "Create passwordless auth flow with excellent UX"
- "Add real-time features with graceful degradation"
- "Optimize for mobile-first ballroom community usage"

### Testing & QA
- "Test membership application approval workflow end-to-end"
- "Verify content moderation catches inappropriate content"
- "Test payment subscription upgrade/downgrade flows"
- "Validate PWA installation on iOS and Android"

### Deployment & Production
- "Review security measures for community platform"
- "Optimize database queries for social feed performance"
- "Setup monitoring for community engagement metrics"
- "Prepare launch checklist for ballroom community rollout"

---

## MCP Integrations

### Development Tools
```bash
# Database management
claude mcp add supabase -s local -e SUPABASE_ACCESS_TOKEN=your_token -- npx -y @supabase/mcp-server-supabase@latest

# Browser automation for testing
claude mcp add playwright npx @playwright/mcp@latest
claude mcp add puppeteer -s user -- npx -y @modelcontextprotocol/server-puppeteer

# Documentation
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

### Project Management
```bash
# Issue tracking
claude mcp add linear -s user -- npx -y mcp-remote https://mcp.linear.app/sse
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AI APIs
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
COPYLEAKS_API_KEY="your-copyleaks-key"

# Email
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@hausofbasquiat.com"

# Analytics
GOOGLE_ANALYTICS_ID="G-..."

# Socket.IO
SOCKET_IO_SECRET="your-socket-secret"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Livepeer (streaming)
LIVEPEER_API_KEY="your-livepeer-key"

# Brave Search
BRAVE_SEARCH_API_KEY="your-brave-key"
```

---

## Git Workflow

### Branch Strategy
```bash
# Feature branches
git checkout -b feature/user-profiles
git checkout -b feature/real-time-messaging
git checkout -b feature/payment-integration

# Bug fixes
git checkout -b fix/auth-token-expiry
git checkout -b hotfix/content-moderation

# Parallel development with worktrees
git worktree add ../ballroom-events -b feature/events
cd ../ballroom-events && claude
```

### Commit Convention
```bash
# Use /commit command for conventional commits with emojis
/commit "feat(auth): ✨ implement passwordless login with email codes"
/commit "fix(gallery): 🐛 resolve image upload validation issue"
/commit "docs(api): 📝 add tRPC endpoint documentation"
```

---

## Additional Resources

- **Anthropic Documentation**: [docs.anthropic.com](https://docs.anthropic.com)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **tRPC Documentation**: [trpc.io](https://trpc.io)
- **Prisma Documentation**: [prisma.io/docs](https://prisma.io/docs)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)

### Ballroom Community Resources
- **LGBTQ+ Safety Guidelines**: Research ballroom community best practices
- **Accessibility Standards**: WCAG 2.1 AA compliance for inclusive design
- **Content Moderation**: Community-specific moderation guidelines

---

## Project Structure Quick Reference

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication flows
│   ├── dashboard/         # Member dashboard
│   ├── feed/             # Social feed
│   ├── gallery/          # Media gallery
│   ├── messages/         # Real-time messaging
│   ├── committees/       # House/committee management
│   ├── events/           # Event calendar & streaming
│   ├── admin/            # Admin panel
│   └── api/              # API routes & webhooks
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── feed/             # Social feed components
│   └── gallery/          # Media gallery components
├── server/               # Server-side utilities
│   ├── trpc/             # tRPC routers
│   ├── integrations/     # External API integrations
│   └── auth.ts           # Authentication logic
└── lib/                  # Shared utilities
```

---

*Built with ❤️ for the ballroom and voguing community*
