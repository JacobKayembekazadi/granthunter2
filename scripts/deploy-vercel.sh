#!/bin/bash

# Vercel Deployment Script
# Usage: ./scripts/deploy-vercel.sh [preview|production]

ENV=${1:-preview}

echo "🚀 Deploying to Vercel ($ENV)..."

if [ "$ENV" = "production" ]; then
  echo "📦 Deploying to PRODUCTION..."
  vercel --prod
else
  echo "🔍 Deploying to PREVIEW..."
  vercel
fi

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Check Vercel dashboard for deployment status"
echo "2. Verify environment variables are set"
echo "3. Test the deployed application"
echo ""
echo "🔗 View deployment: https://vercel.com/dashboard"




