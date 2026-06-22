# MongoDB Atlas Setup Guide

Follow these steps to set up your MongoDB Atlas database for the AI Interview Coach application.

## Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas/database](https://www.mongodb.com/atlas/database)
2. Click **"Start Free"** or **"Try Free"**
3. Sign up with your email or Google account
4. Verify your email if required

## Step 2: Create a New Cluster
1. After logging in, click **"Build a Database"**
2. Choose **"M0 Sandbox"** (Free tier - perfect for development)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region closest to you for better performance
5. Name your cluster (e.g., "Cluster0" or "interviewx-cluster")
6. Click **"Create Cluster"**
   - ⏱️ This takes 3-5 minutes to provision

## Step 3: Create Database User
1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Create a username (e.g., `admin` or your preferred name)
5. Create a strong password (⚠️ **SAVE THIS PASSWORD!**)
6. Grant user permissions: Select **"Read and write to any database"**
7. Click **"Add User"**

## Step 4: Configure Network Access
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, you have two options:
   - **Option A (Easier):** Click **"Allow Access from Anywhere"** (0.0.0.0/0)
     - ⚠️ Less secure but works for development
   - **Option B (More Secure):** Add your current IP address
     - Click "Add Current IP Address"
4. Click **"Confirm"**

## Step 5: Get Your Connection String
1. Go back to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Drivers"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string (it will look like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

Open `server/.env` and replace the MONGO_URI line with your actual connection string.

**Current (incorrect):**
```env
MONGO_URI=mongodb+srv://<Admin>:<admin>@cluster0.ctfuqxv.mongodb.net/?
```

**Example of correct format:**
```env
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.ctfuqxv.mongodb.net/interviewx?retryWrites=true&w=majority
```

**Important notes:**
- Replace `<username>` with your actual database username
- Replace `<password>` with your actual database password
- Add your database name after the `/` (e.g., `/interviewx`)
- Keep the `?retryWrites=true&w=majority` part at the end

## Step 7: Test the Connection

After updating the `.env` file, restart your server:

```bash
cd server
npm run dev
```

You should see:
```
🍃 MongoDB Connected: <your-cluster-url>
```

## Troubleshooting

### Error: "bad auth : Authentication failed"
- ✅ Check that username and password are correct
- ✅ Make sure there are no extra spaces in the connection string
- ✅ Verify the database user has correct permissions
- ✅ Ensure the user is added to the cluster

### Error: "IP not allowed"
- ✅ Go to Network Access and add your IP or allow all (0.0.0.0/0)

### Error: "Database not found"
- ✅ The database will be created automatically when you first save data
- ✅ Make sure you have a database name in the connection string (after the `/`)

## Quick Reference

Your final `server/.env` should look like:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.ctfuqxv.mongodb.net/interviewx?retryWrites=true&w=majority
JWT_SECRET=interviewx-ai-super-secret-jwt-key-2024
JWT_REFRESH_SECRET=interviewx-ai-refresh-token-secret-2024
GROQ_API_KEY=your_key_here
RAZORPAY_KEY_ID=your_id
RAZORPAY_KEY_SECRET=your_id
PRO_PLAN_PRICE_INR=199
ADMIN_EMAIL=admin@interviewx.ai
```

---

**Need Help?** Once you have your connection string ready, share it and I'll update your `.env` file for you!