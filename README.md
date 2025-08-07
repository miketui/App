# 🏠 Haus of Basquiat - Ballroom Community Platform

A comprehensive social platform for the ballroom/voguing community with role-based access, real-time messaging, document management, and AI-powered features.

## 🌟 Features

### 🔐 Authentication & User Management
- **Magic Link Authentication** - Secure passwordless login
- **Role-Based Access Control** - Applicant, Member, Leader, Admin roles
- **Application Workflow** - Multi-step onboarding for new members
- **Profile Management** - Complete user profiles with ballroom categories

### 📚 Document Management
- **Secure File Upload** - Admin-only document uploads with Supabase Storage
- **Role-Based Access** - Documents visible based on user permissions
- **Search & Filter** - Advanced document discovery
- **Download Tracking** - Analytics on document usage

### 💬 Real-Time Messaging
- **1-on-1 & Group Chats** - Direct and group messaging
- **Real-Time Updates** - Socket.IO powered live messaging
- **File Sharing** - Share images and documents in chats
- **Typing Indicators** - Real-time typing status

### 📱 Social Feed
- **Post Creation** - Rich media posts with AI caption suggestions
- **Content Moderation** - AI-powered content filtering
- **Like & Comment** - Social interactions
- **House-Based Feeds** - Community-specific content

### 🤖 AI Integration
- **Smart Captions** - AI-generated post captions
- **Content Moderation** - Automated content filtering
- **Community Insights** - AI-powered analytics

### 💳 Payment Integration
- **Stripe Integration** - Secure payment processing
- **Subscription Management** - Role-based subscriptions
- **Event Ticketing** - Ball and event ticket sales

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/haus-of-basquiat.git
cd haus-of-basquiat
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
```

### 4. Database Setup
1. Create a Supabase project
2. Run the SQL schema from `database/schema.sql`
3. Set up Supabase Storage bucket named 'documents'

### 5. Start Development Servers
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run backend
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Architecture

### Frontend (React + Vite)
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **React Query** - Server state management

### Backend (Node.js + Express)
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **Socket.IO** - Real-time communication
- **Redis** - Caching and session storage
- **Stripe** - Payment processing
- **OpenAI/Claude** - AI services

### Database (PostgreSQL)
- **Supabase** - Managed PostgreSQL
- **Row Level Security** - Data protection
- **Real-time subscriptions** - Live updates

## 📁 Project Structure

```
haus-of-basquiat/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API service functions
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── backend/
│   ├── routes/             # API route handlers
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic
│   └── config/             # Configuration files
├── database/
│   └── schema.sql          # Database schema
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run backend      # Start backend server
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Code Style
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety (optional)

### Testing
```bash
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🚀 Deployment

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 🔒 Security

### Authentication
- **Supabase Auth** - Secure authentication
- **JWT Tokens** - Stateless authentication
- **Role-Based Access** - Granular permissions

### Data Protection
- **Row Level Security** - Database-level security
- **Input Validation** - Server-side validation
- **Rate Limiting** - API protection
- **CORS Configuration** - Cross-origin security

## 📊 Monitoring

### Error Tracking
- **Sentry** - Error monitoring and reporting
- **Console Logging** - Development debugging

### Analytics
- **Google Analytics** - User behavior tracking
- **Custom Events** - Platform-specific metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation
- Ensure accessibility compliance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ballroom Community** - For inspiration and cultural context
- **Supabase** - For the excellent backend-as-a-service
- **OpenAI** - For AI capabilities
- **Stripe** - For payment processing

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/haus-of-basquiat/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/haus-of-basquiat/discussions)

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] Authentication system
- [x] User management
- [x] Document management
- [x] Basic chat functionality

### Phase 2: Advanced Features 🚧
- [ ] AI-powered content generation
- [ ] Advanced moderation
- [ ] Payment integration
- [ ] Mobile app

### Phase 3: Community Features 📋
- [ ] Event management
- [ ] House management
- [ ] Competition system
- [ ] Performance tracking

---

**Built with ❤️ for the Ballroom Community**
