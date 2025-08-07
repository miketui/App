# 🚀 Haus of Basquiat - Deployment Guide

This guide will help you deploy the complete Haus of Basquiat application to production.

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Railway account (or alternative hosting platform)
- Domain name (optional, for custom domain)

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Note down your project URL and anon key from Settings > API

### 2. Run Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database/schema.sql`
3. Click "Run" to execute the schema
4. Copy and paste the contents of `database/setup-storage.sql`
5. Click "Run" to set up storage buckets and policies

### 3. Configure Authentication

1. Go to Authentication > Settings
2. Enable email authentication
3. Configure email templates (optional)
4. Set up custom SMTP (recommended for production)

### 4. Set up Row Level Security

The schema file includes all necessary RLS policies, but verify they're enabled:

1. Go to Database > Tables
2. Check that RLS is enabled for all tables
3. Verify policies are in place

## 🔧 Environment Configuration

### Frontend Environment Variables

Create `.env` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
VITE_APP_NAME="Haus of Basquiat"
VITE_APP_URL=https://your-domain.com
```

### Backend Environment Variables

Create `.env` file in the `backend` directory:

```bash
# Database
VITE_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis Cache (Optional)
UPSTASH_REDIS_URL=your-redis-url
UPSTASH_REDIS_TOKEN=your-redis-token

# AI Services (Optional - for future features)
CLAUDE_API_KEY=your-claude-key
OPENAI_API_KEY=your-openai-key
COPYLEAKS_API_KEY=your-copyleaks-key

# Payments (Optional - for future features)
STRIPE_PUBLISHABLE_KEY=your-stripe-public-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# App Configuration
CLIENT_URL=https://your-frontend-domain.com
PORT=4000
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret
```

## 🚂 Railway Deployment

### 1. Prepare for Deployment

1. Ensure all code is committed to a Git repository (GitHub recommended)
2. Test the application locally with production environment variables

### 2. Deploy Backend

1. Go to [Railway](https://railway.app) and create a new project
2. Connect your GitHub repository
3. Select the backend directory as the root
4. Add all environment variables from the backend `.env` file
5. Deploy the service
6. Note the deployed URL (e.g., `https://your-backend.railway.app`)

### 3. Deploy Frontend

1. Create another service in the same Railway project
2. Connect the same repository but select the root directory
3. Add frontend environment variables
4. Update `CLIENT_URL` in backend environment to point to frontend URL
5. Deploy the frontend service

### 4. Configure Custom Domain (Optional)

1. In Railway, go to your frontend service settings
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `VITE_APP_URL` and backend `CLIENT_URL` to use custom domain

## 🔄 Alternative Deployment Options

### Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
1. Import project from GitHub
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables
5. Deploy

**Backend on Railway:**
Follow the backend deployment steps above.

### Docker Deployment

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
EXPOSE 4000
CMD ["npm", "start"]
```

## 🔒 Security Checklist

### Database Security
- ✅ Row Level Security enabled on all tables
- ✅ Proper authentication policies
- ✅ Service role key kept secure
- ✅ Regular backups enabled

### Application Security
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input validation on all endpoints
- ✅ File upload size limits
- ✅ JWT secrets are secure and unique

### Infrastructure Security
- ✅ HTTPS enabled (automatic with Railway/Vercel)
- ✅ Environment variables properly secured
- ✅ No secrets in code repository
- ✅ Database connection encrypted

## 📊 Monitoring & Analytics

### Set up Monitoring

1. **Supabase Dashboard**: Monitor database performance and usage
2. **Railway Metrics**: Track application performance and uptime
3. **Error Tracking**: Consider integrating Sentry for error monitoring

### Database Monitoring

Key metrics to monitor:
- Active connections
- Query performance
- Storage usage
- API requests per minute

### Application Monitoring

Key metrics to monitor:
- Response times
- Error rates
- Memory usage
- Active users

## 🔧 Maintenance

### Regular Tasks

1. **Database Maintenance**
   - Monitor storage usage
   - Review slow queries
   - Update statistics
   - Check backup status

2. **Application Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging first

3. **Performance Optimization**
   - Review query performance
   - Optimize images and assets
   - Monitor bundle sizes
   - Cache optimization

### Backup Strategy

1. **Database Backups**
   - Supabase provides automatic backups
   - Consider additional backup strategy for critical data
   - Test restore procedures regularly

2. **File Storage Backups**
   - Supabase Storage includes redundancy
   - Consider additional backup for critical files

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `CLIENT_URL` is correctly set in backend
   - Check CORS configuration in backend

2. **Authentication Issues**
   - Verify Supabase keys are correct
   - Check RLS policies
   - Ensure JWT secret is set

3. **File Upload Issues**
   - Verify storage buckets exist
   - Check storage policies
   - Confirm file size limits

4. **Real-time Features Not Working**
   - Verify Supabase Realtime is enabled
   - Check WebSocket connections
   - Review subscription code

### Performance Issues

1. **Slow Database Queries**
   - Check query execution plans
   - Add appropriate indexes
   - Optimize complex queries

2. **High Memory Usage**
   - Monitor for memory leaks
   - Optimize image processing
   - Review caching strategies

## 📈 Scaling Considerations

### Database Scaling
- Monitor connection limits
- Consider read replicas for high traffic
- Implement connection pooling

### Application Scaling
- Use Railway's auto-scaling features
- Implement Redis for session storage
- Consider CDN for static assets

### File Storage Scaling
- Monitor storage usage
- Implement file compression
- Consider CDN for media files

## 🎯 Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed successfully
- [ ] Storage buckets created and configured
- [ ] Authentication working correctly
- [ ] File uploads working
- [ ] Real-time features functional
- [ ] Email notifications working
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring set up
- [ ] Backup strategy implemented
- [ ] Error tracking configured

## 🆘 Support

If you encounter issues during deployment:

1. Check the application logs in Railway/Vercel
2. Review Supabase logs for database issues
3. Verify all environment variables are set correctly
4. Test API endpoints individually
5. Check browser console for frontend errors

For additional support, refer to the main README.md or create an issue in the repository.

---

**Congratulations! Your Haus of Basquiat application is now live! 🎉**