# 🚀 Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI**: Install with `npm install -g @railway/cli`
3. **MongoDB Atlas**: Set up a production MongoDB database
4. **Environment Variables**: Prepare your production secrets

## 🗄️ MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (M0 Free tier works for testing)
3. Create a database user with read/write permissions
4. Get your connection string
5. Add your IP to the IP Access List (or use 0.0.0.0/0 for Railway)

## 🔐 Environment Variables

You need to set these in Railway:

```bash
NODE_ENV=production
JWT_SECRET=your_very_secure_jwt_secret_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/localease?retryWrites=true&w=majority
```

## 🚀 Quick Deployment

### Option 1: Use the deployment script
```bash
cd backend
./deploy-railway.sh
```

### Option 2: Manual deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_secure_jwt_secret_here
railway variables set MONGODB_URI=your_mongodb_connection_string

# Deploy
railway up
```

## 🔍 Verify Deployment

1. **Health Check**: Visit `/health` endpoint
2. **CORS Test**: Test the `/api/cors-test` endpoint
3. **Frontend Connection**: Your frontend should now work

## 📊 Monitoring

- **Logs**: `railway logs`
- **Status**: `railway status`
- **Health**: Check `/health` endpoint
- **Metrics**: View in Railway dashboard

## 🛠️ Troubleshooting

### CORS Issues
- Check that `https://clear.high-score.dev` is in allowed origins
- Verify environment variables are set correctly

### MongoDB Connection
- Check connection string format
- Verify IP whitelist includes Railway IPs
- Check database user permissions

### Port Issues
- Railway automatically assigns ports
- Use `process.env.PORT` (already configured)

## 🔄 Updating Production

```bash
# Make changes to your code
git add .
git commit -m "Update for production"

# Deploy to Railway
railway up
```

## 🏥 Health Check Endpoint

Your production backend will have:
- **Health**: `https://your-railway-url.railway.app/health`
- **API**: `https://your-railway-url.railway.app/api/*`
- **WebSocket**: `wss://your-railway-url.railway.app`

## 🔒 Security Notes

- Use strong JWT secrets
- Keep MongoDB connection strings private
- Monitor Railway logs for suspicious activity
- Consider adding rate limiting in production
