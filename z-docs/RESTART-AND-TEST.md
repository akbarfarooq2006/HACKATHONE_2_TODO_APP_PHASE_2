# Restart and Test JWT Authentication

## What Was Fixed

**Problem**: Better Auth was generating session tokens instead of JWT tokens.

**Solution**: Added `strategy: "jwt"` to the session configuration in `frontend/lib/auth.ts:50`

**Impact**: After restart, sign-in will generate JWT tokens that look like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2lkIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTczNzAyNDAwMCwiZXhwIjoxNzM3NjI4ODAwfQ.signature
```

Instead of session tokens like:
```
KlxQzZD56uEOKqqSC62L6r1yStck1Nuq.t5a6/Mj6qUKm3wqZHepYAdm8Y4yoY8+e7Jlghxi9jiM=
```

---

## Step 1: Restart Frontend Server

1. Go to Terminal 1 (where frontend is running)
2. Press `Ctrl+C` to stop the server
3. Restart with:
   ```bash
   cd "/mnt/e/IT learning file/Spect Driven Development/HACKATHONE/Hackathone_2/phase_2/frontend"
   npm run dev
   ```
4. Wait for: `✓ Ready in X.Xs`

---

## Step 2: Test JWT Token Generation

### 2A: Sign In
1. Open browser: http://localhost:3000/sign-in
2. Sign in with: `a@gmail.com` / your password
3. You should be redirected to dashboard

### 2B: Check Cookie Format
1. Press F12 → Application tab → Cookies → http://localhost:3000
2. Find cookie: `better-auth.session_token`
3. **Verify the value starts with `eyJ`** (this confirms it's a JWT token)

**Expected JWT Token Format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkUW1xTDIwY01nb25ramc...
```

**Old Session Token Format (should NOT see this):**
```
KlxQzZD56uEOKqqSC62L6r1yStck1Nuq.t5a6/Mj6qUKm3wqZHepYAdm8Y4yoY8+e7Jlghxi9jiM=
```

---

## Step 3: Decode JWT Token

1. Copy the entire `better-auth.session_token` value
2. Go to: https://jwt.io
3. Paste the token in the "Encoded" box
4. Verify the decoded payload contains:
   - `sub`: Your user ID
   - `email`: Your email address
   - `name`: Your name
   - `iat`: Issued at timestamp
   - `exp`: Expiration timestamp

**Example Decoded Payload:**
```json
{
  "sub": "dQmqL20cMgonkjg2OAf1yq6Ri4Bc1mBl",
  "email": "a@gmail.com",
  "name": "AA",
  "iat": 1737024000,
  "exp": 1737628800
}
```

---

## Step 4: Test Backend API with JWT Token

Now that you have a real JWT token, test the backend API:

```bash
cd "/mnt/e/IT learning file/Spect Driven Development/HACKATHONE/Hackathone_2/phase_2"
bash test-backend-api.sh
```

When prompted:
1. Paste your JWT token (from browser cookies)
2. Paste your user_id (the `sub` value from jwt.io)

**Expected Results:**
- ✅ Test 1: Valid token with matching user_id → 200 OK
- ✅ Test 2: Valid token with wrong user_id → 403 Forbidden
- ✅ Test 3: Invalid token → 401 Unauthorized
- ✅ Test 4: No token → 401 Unauthorized

---

## Step 5: Verify Stateless Operation

Watch your backend terminal (Terminal 2) during the API tests.

**You should see:**
- ✅ Token verification messages
- ✅ NO database queries logged

This confirms the backend is verifying tokens **statelessly** without database lookups.

---

## Troubleshooting

### Issue: Token still looks like session token (doesn't start with eyJ)
**Solution:**
1. Clear browser cookies (F12 → Application → Clear site data)
2. Sign out completely
3. Sign in again
4. Check cookie format again

### Issue: Backend returns 401 Unauthorized
**Possible Causes:**
1. BETTER_AUTH_SECRET mismatch between frontend and backend
2. Token expired
3. Token format incorrect

**Solution:**
1. Verify BETTER_AUTH_SECRET matches in both `.env` files
2. Sign in again to get fresh token
3. Check token starts with `eyJ`

---

## Success Criteria

✅ Cookie `better-auth.session_token` starts with `eyJ`
✅ Token decodes correctly on jwt.io
✅ Backend API returns 200 OK with valid token
✅ Backend API returns 403 Forbidden with mismatched user_id
✅ No database queries during token verification

---

**Next Steps After Success:**
Continue with the full testing guide in `COMPLETE-TESTING-GUIDE.md`
