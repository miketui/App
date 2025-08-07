# Haus of Basquiat 🎭

A members-only ballroom/voguing community platform with role-based access, document management, real-time messaging, and AI-powered features.

## ✨ Features

### Phase 1 - Core Functionality (Completed)
- ✅ **Authentication & User Management**
  - Magic link authentication with Supabase
  - Role-based access control (Applicant, Member, Leader, Admin)
  - User profiles with house assignments
  - Application workflow with admin approval
  
- ✅ **Document Management System**
  - PDF/image upload with drag-and-drop
  - Role-based document access
  - Search and filtering capabilities
  - Download tracking and analytics
  - Category organization

### Phase 2 - Advanced Features (Coming Soon)
- 🔄 **Real-Time Messaging System**
  - 1-on-1 and group messaging
  - File sharing in messages
  - Typing indicators and read receipts
  - Redis caching for performance

- 🔄 **Social Feed & Community Features**
  - Post creation with media upload
  - AI-generated captions
  - Like, comment, and share functionality
  - House-specific and global feeds

### Phase 3 - AI Integration (Planned)
- 🔄 **AI-Powered Content & Moderation**
  - Claude API for content generation
  - Copyleaks API for content moderation
  - Smart content recommendations
  - Community insights and analytics

### Phase 4 - Payments & Advanced Features (Planned)
- 🔄 **Stripe Integration**
  - Membership subscriptions
  - Event ticket sales
  - Creator tipping system

## 🏗 Architecture

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive design
- **React Router** for client-side routing
- **Lucide React** for consistent iconography
- **React Hot Toast** for user notifications

### Backend
- **Node.js** with Express.js
- **Supabase** for database and authentication
- **Redis** for caching and session management
- **Stripe** for payment processing
- **Multer** for file upload handling

### Database
- **PostgreSQL** via Supabase with Row Level Security
- Comprehensive schema with proper relationships
- Automatic triggers for data consistency
- Optimized indexes for performance

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Redis instance (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd haus-of-basquiat
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Redis (optional)
   UPSTASH_REDIS_URL=your_redis_url
   
   # App Configuration
   CLIENT_URL=http://localhost:5173
   PORT=4000
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql`
   - Configure Row Level Security policies
   - Create a storage bucket named "documents"

5. **Start the application**
   ```bash
   # Terminal 1: Start backend
   cd backend && npm run dev
   
   # Terminal 2: Start frontend
   npm run dev
   ```

## 📊 Database Schema

### Core Tables
- `user_profiles` - Extended user information with roles and house assignments
- `houses` - Ballroom houses and committees
- `user_applications` - Membership applications with approval workflow
- `documents` - File library with role-based access
- `chat_threads` & `messages` - Real-time messaging system
- `posts`, `comments`, `likes` - Social feed functionality

### Key Features
- **Row Level Security** for data protection
- **Automatic triggers** for maintaining data consistency
- **Optimized indexes** for query performance
- **JSONB fields** for flexible metadata storage

## 🔐 Security

- JWT-based authentication with Supabase
- Row Level Security policies for data access
- Rate limiting on API endpoints
- File upload validation and size limits
- CORS configuration for cross-origin requests
- Helmet.js for security headers

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (purple-600 to blue-600)
- **Success**: Green (green-600)
- **Warning**: Yellow (yellow-600)
- **Error**: Red (red-600)
- **Neutral**: Gray scale (gray-50 to gray-900)

### Typography
- **Headings**: Font weights 700-900
- **Body**: Font weight 400-500
- **Small text**: Font weight 400

### Components
- Consistent button styles with hover states
- Form inputs with focus states
- Card layouts with subtle shadows
- Responsive navigation with mobile menu

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface elements
- Optimized for iOS and Android browsers

## 🧪 Testing

```bash
# Run frontend tests
npm run test

# Run backend tests
cd backend && npm test

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Backend (Railway/Heroku)
```bash
cd backend
npm start
```

### Environment Variables for Production
Ensure all environment variables are properly configured in your deployment platform.

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Send magic link
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/apply` - Submit membership application

### Document Management
- `GET /api/documents` - List documents with filtering
- `POST /api/documents/upload` - Upload document (Admin only)
- `GET /api/documents/:id/download` - Download document with tracking
- `GET /api/documents/categories` - Get document categories

### Admin Endpoints
- `GET /api/admin/applications` - List membership applications
- `PUT /api/admin/applications/:id` - Review application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with love for the ballroom and voguing community
- Inspired by the artistic legacy of Jean-Michel Basquiat
- Special thanks to all community members and contributors

## 📞 Support

For support, email support@hausofbasquiat.com or create an issue in the repository.

---

**Haus of Basquiat** - Where art, culture, and community converge. 🎭✨
