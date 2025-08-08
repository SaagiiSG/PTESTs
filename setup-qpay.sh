#!/bin/bash

echo "🚀 QPay Production Setup Script"
echo "================================"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local with QPay production credentials
cat > .env.local << EOF
# QPay Production Configuration
# Based on credentials received from QPay on July 30, 2025

# QPay API Credentials (Production)
QPAY_CLIENT_ID=JAVZAN_B
QPAY_CLIENT_SECRET=fGJp4FEz
QPAY_BASE_URL=https://merchant.qpay.mn/v2
QPAY_INVOICE_CODE=JAVZAN_B_INVOICE

# Callback URL (Update this to your actual domain)
QPAY_CALLBACK_URL=https://testcenter.mn/api/qpay-callback

# Optional QPay Settings (if needed)
QPAY_BRANCH_CODE=
QPAY_STAFF_CODE=
QPAY_TERMINAL_CODE=

# Public Merchant ID (for admin dashboard)
NEXT_PUBLIC_MERCHANT_ID=JAVZAN_B

# Other existing environment variables
# Add your other environment variables here
EOF

echo "✅ .env.local created with QPay production credentials"
echo ""
echo "📝 Important Notes:"
echo "   - This is connected to QPay PRODUCTION environment"
echo "   - All payments will be real transactions"
echo "   - Update QPAY_CALLBACK_URL to your actual domain for production"
echo "   - Make sure .env.local is in your .gitignore file"
echo ""
echo "🔧 Next Steps:"
echo "   1. Restart your development server: npm run dev"
echo "   2. Test the payment system at: http://localhost:3001/qpay-demo"
echo "   3. Update callback URL for production deployment"
echo ""
echo "🎯 Ready to test QPay payments!" 