#!/bin/bash

# Quick Test Script for Authentication System
# This script helps verify the authentication system is working

echo "🧪 Authentication System Quick Test"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Frontend Health Check
echo "1️⃣  Testing Frontend (http://localhost:3000)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
    echo "   Start with: cd frontend && npm run dev"
fi
echo ""

# Test 2: Backend Health Check
echo "2️⃣  Testing Backend (http://localhost:8000)..."
BACKEND_RESPONSE=$(curl -s http://localhost:8000/health)
if echo "$BACKEND_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✓ Backend is running${NC}"
    echo "   Response: $BACKEND_RESPONSE"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    echo "   Start with: cd backend && uv run uvicorn app.main:app --reload --port 8000"
fi
echo ""

# Test 3: Database Tables Check
echo "3️⃣  Checking Database Tables..."
echo -e "${YELLOW}   Manual check required:${NC}"
echo "   1. Go to https://console.neon.tech"
echo "   2. Select your project"
echo "   3. Go to Tables tab"
echo "   4. Verify these tables exist:"
echo "      - user"
echo "      - session"
echo "      - account"
echo "      - verification"
echo "      - jwks ✨ (newly created)"
echo ""

# Test 4: Sign-Up Test
echo "4️⃣  Testing Sign-Up Flow..."
echo -e "${YELLOW}   Manual test required:${NC}"
echo "   1. Visit: http://localhost:3000/sign-up"
echo "   2. Fill in the form:"
echo "      Name: Test User"
echo "      Email: test@example.com"
echo "      Password: Test123!@#"
echo "   3. Click 'Create account'"
echo "   4. Expected: Redirected to dashboard"
echo ""

# Test 5: Sign-In Test
echo "5️⃣  Testing Sign-In Flow..."
echo -e "${YELLOW}   Manual test required:${NC}"
echo "   1. Visit: http://localhost:3000/sign-in"
echo "   2. Enter credentials:"
echo "      Email: test@example.com"
echo "      Password: Test123!@#"
echo "   3. Click 'Sign in'"
echo "   4. Expected: Redirected to dashboard"
echo ""

# Test 6: Backend API Test
echo "6️⃣  Testing Backend API..."
echo -e "${YELLOW}   Manual test required:${NC}"
echo "   1. Sign in to frontend"
echo "   2. Open DevTools (F12) → Application → Cookies"
echo "   3. Copy 'better-auth.session_token' value"
echo "   4. Decode at https://jwt.io to get user_id (sub claim)"
echo "   5. Run:"
echo "      curl -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "        http://localhost:8000/api/v1/users/YOUR_USER_ID/me"
echo "   6. Expected: 200 OK with user data"
echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo ""
echo "Automated Tests:"
echo "  - Frontend health check"
echo "  - Backend health check"
echo ""
echo "Manual Tests (see TESTING-GUIDE.md):"
echo "  - Database tables verification"
echo "  - Sign-up flow"
echo "  - Sign-in flow"
echo "  - Backend API authentication"
echo "  - Path-based security"
echo "  - Google OAuth"
echo "  - Account linking"
echo ""
echo "📖 Full testing guide: specs/02-auth-db/TESTING-GUIDE.md"
echo ""
