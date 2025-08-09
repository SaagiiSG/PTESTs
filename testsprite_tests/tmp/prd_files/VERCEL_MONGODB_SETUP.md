# Vercel + MongoDB Atlas Setup Guide

## Quick Setup for Vercel IP Whitelisting

### 🚀 Quick Start (Recommended for Development)

For development purposes, you can quickly allow all IPs:

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Select your cluster
3. Click "Network Access" in the left sidebar
4. Click "Add IP Address"
5. Choose "Allow Access from Anywhere" (0.0.0.0/0)
6. Click "Confirm"

**⚠️ Note**: This is less secure but easier for development.

### 🔒 Production Setup (More Secure)

For production, add specific Vercel IP ranges:

1. Run the script: `node scripts/addVercelIPsToMongoDB.js`
2. Follow the step-by-step instructions provided
3. Add all 222 IP addresses listed

### 📋 Required Environment Variables in Vercel

Make sure these are set in your Vercel project settings:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EMBED_CODE_SECRET=your-encryption-secret
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=your-verified-email
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone
```

### 🧪 Testing Connection

After adding IPs:

1. Deploy your app to Vercel
2. Visit your app URL
3. Check Vercel function logs for any MongoDB connection errors
4. Test user registration/login functionality

### 🔍 Troubleshooting

**Common Issues:**

1. **Connection Timeout**: IP not whitelisted
2. **Authentication Failed**: Wrong MONGODB_URI
3. **Permission Denied**: Database user lacks permissions

**Debug Steps:**

1. Check Vercel function logs
2. Verify MONGODB_URI format
3. Test connection from local environment
4. Ensure MongoDB Atlas cluster is running

### 📚 Resources

- [Vercel IP Documentation](https://vercel.com/docs/concepts/edge-network/regions#ip-addresses)
- [MongoDB Atlas Network Access](https://docs.atlas.mongodb.com/security/ip-access-list/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

### 🎯 Quick Commands

```bash
# Generate IP list and instructions
node scripts/addVercelIPsToMongoDB.js

# Test local build
npm run build

# Deploy to Vercel
vercel --prod
```

### 📄 Generated Files

The script creates:
- `vercel-ips-for-mongodb.csv` - CSV file with all IPs for bulk import
- Console output with step-by-step instructions

---

**Need Help?** Check the Vercel function logs for specific error messages and ensure all environment variables are properly configured. 