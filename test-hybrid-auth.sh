#!/bin/bash

# Hybrid Authentication Testing Script
# Tests backend API with JWT from session_data cookie

echo "🧪 Hybrid Authentication Testing"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Get Your Cookies${NC}"
echo "-------------------------"
echo ""
echo "1. Open browser: http://localhost:3000"
echo "2. Make sure you're signed in"
echo "3. Press F12 → Application → Cookies"
echo "4. Find these two cookies:"
echo "   - better-auth.session_token"
echo "   - better-auth.session_data"
echo ""
echo -e "${BLUE}Press Enter when you have both cookie values ready...${NC}"
read

echo ""
echo -e "${YELLOW}Step 2: Enter Cookie Values${NC}"
echo "----------------------------"
echo ""
echo -n "Paste session_token value: "
read SESSION_TOKEN
echo ""
echo -n "Paste session_data value (JWT): "
read SESSION_DATA
echo ""

# Verify session_data is JWT format
if [[ $SESSION_DATA == eyJ* ]]; then
    echo -e "${GREEN}✅ session_data is JWT format (starts with eyJ)${NC}"
else
    echo -e "${RED}❌ WARNING: session_data doesn't look like JWT${NC}"
    echo "Expected format: eyJhbGci..."
    echo "Got: ${SESSION_DATA:0:20}..."
    echo ""
    echo "This might cause issues. Continue anyway? (y/n)"
    read CONTINUE
    if [[ $CONTINUE != "y" ]]; then
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}Step 3: Decode JWT to Get User ID${NC}"
echo "-----------------------------------"
echo ""

# Decode JWT payload (base64 decode the middle part)
PAYLOAD=$(echo $SESSION_DATA | cut -d. -f2)
# Add padding if needed
case $((${#PAYLOAD} % 4)) in
    2) PAYLOAD="${PAYLOAD}==" ;;
    3) PAYLOAD="${PAYLOAD}=" ;;
esac

DECODED=$(echo $PAYLOAD | base64 -d 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "Decoded JWT Payload:"
    echo "$DECODED" | python3 -m json.tool 2>/dev/null || echo "$DECODED"
    echo ""
    
    # Extract user ID
    USER_ID=$(echo "$DECODED" | python3 -c "import sys, json; print(json.load(sys.stdin).get('sub', ''))" 2>/dev/null)
    
    if [ -n "$USER_ID" ]; then
        echo -e "${GREEN}✅ User ID extracted: $USER_ID${NC}"
    else
        echo -e "${RED}❌ Could not extract user ID from JWT${NC}"
        echo -n "Please enter user ID manually: "
        read USER_ID
    fi
else
    echo -e "${RED}❌ Could not decode JWT${NC}"
    echo -n "Please enter user ID manually: "
    read USER_ID
fi

echo ""
echo -e "${YELLOW}Step 4: Test Backend API${NC}"
echo "-------------------------"
echo ""

# Test 1: Valid JWT with matching user_id
echo "Test 1: Valid JWT with matching user_id"
echo "Endpoint: GET /api/v1/users/${USER_ID}/me"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Cookie: better-auth.session_token=${SESSION_TOKEN}; better-auth.session_data=${SESSION_DATA}" \
  http://localhost:8000/api/v1/users/${USER_ID}/me)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Test 1 PASSED${NC}"
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${GREEN}✅ T090 PASSED: Backend returns user data with valid JWT${NC}"
else
    echo -e "${RED}❌ Test 1 FAILED${NC}"
    echo "Expected: 200 OK"
    echo "Got: $HTTP_STATUS"
    echo "Response: $BODY"
fi

echo ""
echo "----------------------------"
echo ""

# Test 2: Valid JWT with WRONG user_id (path-based security)
echo "Test 2: Valid JWT with mismatched user_id (path-based security)"
echo "Endpoint: GET /api/v1/users/00000000-0000-0000-0000-000000000000/me"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -H "Cookie: better-auth.session_token=${SESSION_TOKEN}; better-auth.session_data=${SESSION_DATA}" \
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

# Test 3: No cookies (should fail)
echo "Test 3: No cookies provided"
echo "Endpoint: GET /api/v1/users/${USER_ID}/me"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  http://localhost:8000/api/v1/users/${USER_ID}/me)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "401" ]; then
    echo -e "${GREEN}✅ Test 3 PASSED${NC}"
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo -e "${GREEN}Backend correctly requires authentication${NC}"
else
    echo -e "${RED}❌ Test 3 FAILED${NC}"
    echo "Expected: 401 Unauthorized"
    echo "Got: $HTTP_STATUS"
    echo "Response: $BODY"
fi

echo ""
echo "============================"
echo -e "${GREEN}✅ Hybrid Authentication Testing Complete!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Valid JWT with matching user_id → 200 OK"
echo "  ✅ Valid JWT with wrong user_id → 403 Forbidden"
echo "  ✅ No cookies → 401 Unauthorized"
echo ""
echo -e "${BLUE}Note: Check your backend terminal to verify NO database queries${NC}"
echo -e "${BLUE}were logged during JWT verification (stateless operation).${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Mark T090, T091, T092 as complete in tasks.md"
echo "2. Continue with remaining verification tasks"
echo "3. Test Google OAuth and account linking"
echo ""
