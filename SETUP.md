# 🚀 Q-Draw OS Setup Guide

This guide will help you set up and run Q-Draw OS locally with Supabase backend.

## 📋 Prerequisites

Before starting, make sure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/downloads)
- **Supabase Account** (Free) - [Sign up here](https://supabase.com)

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Sign in with your GitHub account or email
4. Click **"New Project"** button
5. Fill in the project details:
   - **Name**: `qdraw-os` (or any name you prefer)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose a region closest to you
6. Click **"Create new project"**
7. Wait for the project to be provisioned (2-3 minutes)

### 1.2 Run the Database Schema

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase/schema.sql` file
4. Paste it into the SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)
6. You should see "Success" message

### 1.3 Get Your Supabase Credentials

1. In Supabase dashboard, click **"Settings"** (gear icon) → **"API"**
2. Copy the following values:

| Setting | Where to find it | Use for |
|---------|-----------------|---------|
| **Project URL** | Under "Config" → "Project URL" | `SUPABASE_URL` |
| **anon/public** | Under "Project API keys" → "anon public" | `SUPABASE_ANON_KEY` |
| **service_role** | Under "Project API keys" → "service_role" | `SUPABASE_SERVICE_ROLE_KEY` |

⚠️ **Important**: Never share your `service_role` key publicly!

### 1.4 Generate a JWT Secret

Run this command in your terminal to generate a secure JWT secret:

```bash
openssl rand -base64 32
```

Copy the output - you'll use it as `JWT_SECRET`

## 🔧 Step 2: Configure Backend Environment

1. Open `backend/.env` file
2. Replace the placeholder values with your actual credentials:

```env
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# JWT
JWT_SECRET=your_generated_jwt_secret_here
```

3. Save the file

## 🎨 Step 3: Configure Frontend Environment

The frontend `.env` file should already be configured for local development:

```env
VITE_API_URL=http://localhost:3000/api
```

For production deployment, you'll change this to your deployed backend URL.

## 🚀 Step 4: Start the Application

### Option A: Using the Start Script (Recommended)

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

This will:
- Start the backend server on http://localhost:3000
- Start the frontend dev server on http://localhost:5173
- Open both in separate terminal windows

### Option B: Manual Start

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📱 Step 5: Use the Application

1. Open your browser and go to: **http://localhost:5173**
2. You should see the Q-Draw OS login screen
3. Click **"Sign Up"** and create a new account
4. After signing up, you'll be taken to the main desktop

## 🎯 Test the Features

- **Notes App**: Create, edit, and delete notes
- **Calendar App**: Add todos for specific dates
- **Food Tracker**: Log meals with photos (camera upload)
- **YouTube App**: Paste any YouTube URL to watch videos
- **Icons App**: View the icon gallery

## 🐛 Troubleshooting

### Backend won't start

**Error**: `Error: connect ECONNREFUSED`

**Solution**:
- Check that Supabase credentials in `.env` are correct
- Verify your Supabase project is active
- Check that the database schema was executed successfully

**Error**: `JWT_SECRET is not defined`

**Solution**:
- Make sure you generated a JWT secret and added it to `.env`
- Run: `openssl rand -base64 32`

### Frontend can't connect to backend

**Error**: `Network Error` or `ERR_CONNECTION_REFUSED`

**Solution**:
- Make sure backend is running on port 3000
- Check that `VITE_API_URL` in frontend `.env` is: `http://localhost:3000/api`
- Try accessing http://localhost:3000/api/health in browser - should return: `{"status":"ok","message":"Q-Draw OS API is running"}`

### Auth errors

**Error**: `Invalid token` or `Authentication failed`

**Solution**:
- Clear localStorage in browser (DevTools → Application → Local Storage)
- Sign out and sign in again
- Check that JWT_SECRET matches between backend `.env` and any deployed versions

### Database errors

**Error**: `Permission denied` or `RLS policy violation`

**Solution**:
- Make sure you ran the schema.sql in Supabase SQL Editor
- Check that RLS policies are created: In Supabase dashboard → Authentication → Policies
- Verify your user ID matches the `user_id` in the database

## 📊 Monitor Your Database

### View Data in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. You can view and edit:
   - `notes` - All user notes
   - `calendar_todos` - Todo items
   - `food_logs` - Food tracking logs
   - `daily_food_summary` - Daily calorie summaries

### Check Auth Users

1. Go to **Authentication** → **Users**
2. View all registered users
3. Manually add/delete users if needed

## 🌐 Next Steps

After local testing is working, you can deploy to production:

1. **Deploy Backend** → Follow `DEPLOYMENT.md` for Render deployment
2. **Deploy Frontend** → Follow `DEPLOYMENT.md` for Vercel deployment
3. **Update Environment Variables** → Change `VITE_API_URL` to your deployed backend URL

## 📚 Useful Commands

```bash
# Backend
cd backend
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server

# Frontend
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🆘 Need Help?

- Check the logs in terminal windows
- Check browser console (F12 → Console)
- Check Supabase logs (Dashboard → Logs)
- Review `DEPLOYMENT.md` for deployment issues

---

**Enjoy using Q-Draw OS! 🎨✨**
