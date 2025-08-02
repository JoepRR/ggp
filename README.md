# Good Girl Points 💖

A private, fun relationship rewards tracker built with React, Express, and SQLite/PostgreSQL.

## Features

### 🔐 Authentication & Roles
- **Admin**: anthony (your BF) - Full access to manage points and rewards
- **User**: joep (you) - Can view dashboard, redeem rewards, and check history
- Session-based authentication with secure password hashing

### 🏠 Dashboard
- **For Joep**: Shows current points balance, recent activity, and cute welcome message
- **For Anthony**: Shows Joep's status, recent redemptions, and notifications

### 🎁 Rewards Shop
- Browse available rewards with point costs
- Redeem rewards if you have enough points
- Real-time balance updates and notifications

### 📜 History & Notifications
- Complete activity log with timestamps
- Recent notifications for both users
- Beautiful timeline view of all point transactions

### ⚙️ Admin Panel (Anthony only)
- **Points Management**: Add/remove points with reasons
- **Rewards Management**: Create, edit, and delete rewards
- **Redemption Tracker**: View all reward redemptions

## Tech Stack

- **Frontend**: React + TailwindCSS + React Router
- **Backend**: Node.js + Express + SQLite (dev) / PostgreSQL (prod)
- **Authentication**: bcrypt + express-session
- **Deployment**: Vercel (frontend) + Render/Railway (backend)

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```env
SESSION_SECRET=your-super-secret-session-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start Development Servers

From the root directory:

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
# Backend: npm run dev:backend
# Frontend: npm run dev:frontend
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 5. Default Login Credentials

- **Admin**: anthony / admin123
- **User**: joep / user123

## Deployment Instructions

### Frontend Deployment (Vercel)

1. **Push to GitHub**: Upload your code to a GitHub repository

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Set build command: `cd frontend && npm install && npm run build`
   - Set output directory: `frontend/build`
   - Deploy!

3. **Environment Variables** (in Vercel):
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   ```

### Backend Deployment (Render/Railway)

#### Option 1: Render (Recommended)

1. **Create Render Account**: Sign up at [render.com](https://render.com)

2. **Create New Web Service**:
   - Connect your GitHub repository
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && npm start`
   - Set environment variables:
     ```
     SESSION_SECRET=your-production-secret
     FRONTEND_URL=https://your-frontend-url.vercel.app
     NODE_ENV=production
     ```

#### Option 2: Railway

1. **Create Railway Account**: Sign up at [railway.app](https://railway.app)

2. **Deploy Backend**:
   - Connect your GitHub repository
   - Set environment variables as above
   - Deploy!

### Database Setup

#### For Production (PostgreSQL)

1. **Create Database**:
   - Use [Supabase](https://supabase.com) (free tier)
   - Or [Neon](https://neon.tech) (free tier)

2. **Update Backend**:
   - Install PostgreSQL driver: `npm install pg`
   - Update database connection in `backend/index.js`
   - Set `DATABASE_URL` environment variable

#### For Development (SQLite)

- SQLite database file will be created automatically in `backend/database.sqlite`

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get current user

### Dashboard
- `GET /api/dashboard` - Get dashboard data (role-based)

### Rewards
- `GET /api/rewards` - List all rewards
- `POST /api/rewards` - Create new reward (admin)
- `PUT /api/rewards/:id` - Update reward (admin)
- `DELETE /api/rewards/:id` - Delete reward (admin)

### Redemptions
- `POST /api/redeem` - Redeem a reward

### Points Management
- `POST /api/points` - Add/remove points (admin)

### History & Notifications
- `GET /api/history` - Get user activity history
- `GET /api/notifications` - Get user notifications

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/redemptions` - List all redemptions

## Project Structure

```
good-girl-points/
├── backend/
│   ├── index.js          # Express server
│   ├── package.json      # Backend dependencies
│   └── database.sqlite   # SQLite database (dev)
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   └── App.js        # Main app component
│   ├── public/           # Static files
│   └── package.json      # Frontend dependencies
├── package.json          # Root package.json
└── README.md            # This file
```

## Testing

Run tests for the backend:

```bash
cd backend
npm test
```

## Security Features

- ✅ Password hashing with bcrypt
- ✅ Session-based authentication
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection protection
- ✅ Role-based access control

## Customization

### Adding New Users

Edit the `defaultUsers` array in `backend/index.js`:

```javascript
const defaultUsers = [
  { id: uuidv4(), username: 'newuser', password: 'password123', role: 'user', pointBalance: 0 }
];
```

### Customizing Rewards

Add default rewards in `backend/index.js`:

```javascript
const defaultRewards = [
  { id: uuidv4(), name: 'Custom Reward', description: 'Your description', pointCost: 50 }
];
```

### Styling

The app uses TailwindCSS. Customize colors in `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color',
        // ... other shades
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in package.json or kill existing processes
2. **Database errors**: Delete `backend/database.sqlite` and restart
3. **CORS errors**: Check FRONTEND_URL in backend .env file
4. **Session issues**: Clear browser cookies and restart server

### Development Tips

- Use browser dev tools to debug API calls
- Check backend console for server logs
- Use React Developer Tools for component debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own relationship rewards tracker! 💖

---

**Built with love for Anthony & Joep** 💕 