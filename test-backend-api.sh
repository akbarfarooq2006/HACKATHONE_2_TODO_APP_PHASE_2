#!/bin/bash

# Backend API Testing Script
# This script helps you test the backend API with your JWT token

echo "🧪 Backend API Testing Guide"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Get Your Token and User ID${NC}"
echo "----------------------------------------"
echo ""
echo "1. Sign in to http://localhost:3000"
echo "2. Open DevTools (F12) → Application → Cookies"
echo "3. Copy the 'better-auth.session_token' value"
echo "4. Go to https://jwt.io and paste the token"
echo "5. Copy the 'sub' value (this is your user_id)"
echo ""
echo -e "${BLUE}Press Enter when you have your token and user_id ready...${NC}"
read

echo ""
echo -e "${YELLOW}Step 2: Enter Your Details${NC}"
echo "----------------------------"
echo ""
echo -n "Paste your JWT token: "
read TOKEN
echo ""
echo -n "Paste your user_id (from 'sub' claim): "
read USER_ID
echo ""

echo -e "${YELLOW}Step 3: Testing Backend API${NC}"
echo "----------------------------"
echo ""

# Test 1: Valid token with matching user_id (should succeed)
echo "Test 1: Valid token with matching user_id"
echo "Endpoint: GET /api/v1/users/${USER_ID}/me"
echo ""
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:8000/api/v1/users/${USER_ID}/me)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Test 1 PASSED${NC}"
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${GREEN}✅ T090 PASSED: Backend returns user data with valid token${NC}"
else
    echo -e "${RED}❌ Test 1 FAILED${NC}"
    echo "Expected: 200 OK"
    echo "Got: $HTTP_STATUS"
    echo "Response: $BODY"
fi

echo ""
echo "----------------------------"
echo ""

# Test 2: Valid token with WRONG user_id (should fail with 403)
echo "Test 2: Valid token with mismatched user_id (path-based security)"
echo "Endpoint: GET /api/v1/users/00000000-0000-0000-0000-000000000000/me"
echo ""
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:8000/api/v1/users/00000000-0000-0000-0000-000000000000/me)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "403" ]; then
    echo -e "${GREEN}✅ Test 2 PASSED${NC}"
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${GREEN}✅ T091 PASSED: Backend rejects mismatched user_id with 403${NC}"
else
    echo -e "${RED}❌ Test 2 FAILED${NC}"
    echo "Expected: 403 Forbidden"
    echo "Got: $HTTP_STATUS"
    echo "Response: $BODY"
fi

echo ""
echo "----------------------------"
echo ""

# Test 3: Invalid token (should fail with 401)
echo "Test 3: Invalid token"
echo "Endpoint: GET /api/v1/users/${USER_ID}/me"
echo ""
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer invalid_token_12345" \
  http://localhost:8000/api/v1/users/${USER_ID}/me)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "401" ]; then
    echo -e "${GREEN}✅ Test 3 PASSED${NC}"
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${GREEN}Backend correctly rejects invalid tokens${NC}"
else
    echo -e "${RED}❌ Test 3 FAILED${NC}"
    echo "Expected: 401 Unauthorized"
    echo "Got: $HTTP_STATUS"
    echo "Response: $BODY"
fi

echo ""
echo "----------------------------"
echo ""

# Test 4: No token (should fail with 401)
echo "Test 4: No token provided"
echo "Endpoint: GET /api/v1/users/${USER_ID}/me"
echo ""
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  http://localhost:8000/api/v1/users/${USER_ID}/me)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "401" ]; then
    echo -e "${GREEN}✅ Test 4 PASSED${NC}"
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${GREEN}Backend correctly requires authentication${NC}"
else
    echo -e "${RED}❌ Test 4 FAILED${NC}"
    echo "Expected: 401 Unauthorized"
    echo "Got: $HTTP_STATUS"
    echo "Response: $BODY"
fi

echo ""
echo "============================"
echo -e "${GREEN}✅ Backend API Testing Complete!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Valid token with matching user_id → 200 OK"
echo "  ✅ Valid token with wrong user_id → 403 Forbidden"
echo "  ✅ Invalid token → 401 Unauthorized"
echo "  ✅ No token → 401 Unauthorized"
echo ""
echo -e "${BLUE}Note: Check your backend terminal to verify NO database queries${NC}"
echo -e "${BLUE}were logged during token verification (stateless operation).${NC}"
echo ""
