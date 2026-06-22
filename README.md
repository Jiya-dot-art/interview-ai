# InterviewX AI - Production-Ready SaaS Application

A complete AI-powered interview coaching platform with authentication, payments, analytics, and admin panel.

## 🚀 Features

### Core Features
- **Secure Authentication** - JWT with refresh tokens, bcrypt password hashing
- **AI Interview Engine** - Multiple modes (Technical, DSA, System Design, HR, Frontend, Backend, Full Stack)
- **Dynamic Difficulty** - Beginner, Intermediate, Advanced levels
- **Real-time Evaluation** - AI scores and feedback on every answer
- **Comprehensive Reports** - Technical, Communication, Problem Solving scores
- **User Dashboard** - Analytics, streaks, weak/strong areas, progress charts
- **Freemium Model** - 3 free interviews/month, Pro at ₹199/month
- **Razorpay Integration** - Complete payment flow with signature verification
- **Admin Panel** - User management, revenue tracking, interview monitoring
- **PDF Reports** - Downloadable reports for Pro users

### Technical Features
- Refresh token rotation
- Rate limiting
- Input validation
- Error handling middleware
- Subscription expiry checks
- Responsive dark theme UI
- Glassmorphism design
- Mobile-friendly

## 📁 Project Structure

```
interviewx-ai/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── api/           # Axios configuration with interceptors
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Auth utilities
│   │   ├── App.jsx        # Main app with routes
│   │   └── index.css      # Global styles
│   └── package.json
│
├── server/                # Node.js + Express Backend
│   ├── config/           # Groq AI, Razorpay, DB config
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Auth, rate limiting, validation
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── index.js          # Server entry point
│   └── package.json
│
├── render.yaml           # Render deployment config
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 18 + Vite
- React Router v6
- Axios with interceptors
- Modern CSS (Dark theme, Glassmorphism)

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcryptjs for password hashing
- express-rate-limit
- Razorpay SDK
- Groq AI API

## 📦 Installation

### Prerequisites
- Node.js 18+
- MongoDB
- Groq API key (https://console.groq.com)
- Razorpay account (https://razorpay.com)

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# - MONGO_URI: MongoDB connection string
# - JWT_SECRET: Random secret key
# - JWT_REFRESH_SECRET: Random refresh secret
# - GROQ_API_KEY: Your Groq API key
# - RAZORPAY_KEY_ID: Your Razorpay key ID
# - RAZORPAY_KEY_SECRET: Your Razorpay secret
# - CLIENT_URL: Frontend URL (http://localhost:5173 for dev)

# Start server
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# - VITE_API_URL: Backend URL (http://localhost:5000/api)
# - VITE_RAZORPAY_KEY_ID: Your Razorpay key ID

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## 🔑 Environment Variables

### Server (.env)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/interviewx-ai
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
GROQ_API_KEY=your-groq-api-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
PRO_PLAN_PRICE_INR=199
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## 🚀 Deployment

### Deploy Backend to Render

1. Push code to GitHub
2. Go to [Render](https://render.com)
3. Create new Web Service
4. Connect your GitHub repo
5. Select `render.yaml` for configuration
6. Add environment variables in Render dashboard
7. Deploy!

### Deploy Frontend to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Set root directory to `client`
5. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL
   - `VITE_RAZORPAY_KEY_ID`: Your Razorpay key
6. Deploy!

## 📊 Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  isPremium: Boolean,
  subscriptionPlan: String (free/pro),
  subscriptionStart: Date,
  subscriptionEnd: Date,
  paymentId: String,
  interviewsUsed: Number,
  maxInterviews: Number,
  interviewCount: Number,
  isBlocked: Boolean,
  refreshToken: String,
  role: String (user/admin)
}
```

### Interview
```javascript
{
  userId: ObjectId (ref: User),
  role: String,
  roundType: String,
  difficulty: String,
  resumeText: String,
  qa: [{
    question: String,
    answer: String,
    feedback: String,
    score: Number
  }],
  finalScore: Number,
  technicalScore: Number,
  communicationScore: Number,
  problemSolvingScore: Number,
  strengths: [String],
  weaknesses: [String],
  improvementTopics: [String],
  studyPlan: String
}
```

### Payment
```javascript
{
  userId: ObjectId (ref: User),
  orderId: String (unique),
  paymentId: String,
  amount: Number,
  currency: String,
  status: String (created/paid/failed),
  planType: String
}
```

## 🔐 Security Features

- JWT access tokens (7 days) + refresh tokens (30 days)
- bcrypt password hashing (12 rounds)
- Rate limiting on auth routes (10 requests/15min)
- API rate limiting (100 requests/15min)
- Input validation
- CORS configuration
- Signature verification for Razorpay payments
- Protected routes with role-based access
- Token refresh on expiry

## 💰 Monetization

### Free Plan
- 3 interviews per month
- Basic reports
- Limited analytics

### Pro Plan (₹199/month)
- Unlimited interviews
- All interview modes
- Advanced AI feedback
- Detailed reports with Q&A review
- PDF report downloads
- Progress tracking
- Weak/strong area analysis
- Personalized study plans

## 🎨 UI/UX Features

- Dark futuristic theme
- Glassmorphism effects
- Smooth animations
- Responsive design (mobile, tablet, desktop)
- Progress indicators
- Score visualizations
- Chat interface for interviews
- Premium badges and upgrade prompts

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/analytics` - Get detailed analytics
- `GET /api/user/interviews` - Get interview history
- `GET /api/user/interviews/:id` - Get interview details

### Interview
- `POST /api/interview/start` - Start new interview
- `POST /api/interview/next` - Submit answer & get next question
- `GET /api/interview/history` - Get all interviews
- `GET /api/interview/:id` - Get interview details
- `DELETE /api/interview/:id` - Delete interview

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/history` - Get payment history

### Report
- `GET /api/report/:interviewId` - Get interview report

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/block` - Block/unblock user
- `GET /api/admin/interviews` - Get all interviews
- `GET /api/admin/payments` - Get all payments

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📄 License

ISC

## 👨‍💻 Author

InterviewX AI - Built with ❤️ for serious candidates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📞 Support

For support, email support@interviewx.ai or join our Discord server.

---

**Ready to deploy?** Follow the deployment section above to go live in minutes!