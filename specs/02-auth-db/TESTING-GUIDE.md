# Authentication System Testing Guide

**Purpose**: Complete manual verification of the authentication system (Tasks T086-T116)

**Prerequisites**:
- Frontend server running on http://localhost:3000
- Backend server running on http://localhost:8000
- Database tables created (user, session, account, verification, jwks)

---

## Phase 6: Database Connectivity Verification

### ✅ T086: Verify Better Auth created all required tables
**Status**: COMPLETE
- All 5 tables verified: user, session, account, verification, jwks

### T087: Sign up via frontend and verify user record exists

**Steps**:
1. Visit http://localhost:3000/sign-up
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!@#
3. Click "Create account"
4. Expected: Redirected to dashboard

**Verification**:
```sql
-- Run in Neon SQL Editor
SELECT id, email, name, "emailVerified", "createdAt"
FROM "user"
WHERE email = 'test@example.com';
```

**Expected Result**: One row with user data

---

### T088: Sign in via frontend and verify session record exists

**Steps**:
1. Sign out if already signed in
2. Visit http://localhost:3000/sign-in
3. Enter credentials:
   - Email: test@example.com
   - Password: Test123!@#
4. Click "Sign in"
5. Expected: Redirected to dashboard

**Verification**:
```sql
-- Run in Neon SQL Editor
SELECT id, "userId", "expiresAt", "ipAddress", "createdAt"
FROM "session"
WHERE "userId" = (SELECT id FROM "user" WHERE email = 'test@example.com')
ORDER BY "createdAt" DESC
LIMIT 1;
```

**Expected Result**: One active session record

---

### T089: Test account linking

**Steps**:
1. Sign up with email: user@example.com / Test123!@#
2. Sign out
3. Click "Sign in with Google"
4. Use Google account with email: user@example.com
5. Expected: Accounts linked, redirected to dashboard

**Verification**:
```sql
-- Run in Neon SQL Editor
SELECT u.id, u.email, a.provider, a."providerAccountId"
FROM "user" u
LEFT JOIN "account" a ON u.id = a."userId"
WHERE u.email = 'user@example.com';
```

**Expected Result**: One user with two accounts (email-password and google)

---

### T090: Call backend API with valid token and matching user_id

**Steps**:
1. Sign in to frontend
2. Open browser DevTools (F12) → Application → Cookies
3. Find cookie: `better-auth.session_token`
4. Copy the token value
5. Go to https://jwt.io and paste the token
6. Copy the `sub` claim value (this is your user_id)
7. Run the curl command:

```bash
# Replace YOUR_TOKEN and YOUR_USER_ID with actual values
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/users/YOUR_USER_ID/me
```

**Expected Response** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "test@example.com",
  "name": "Test User",
  "status": "authenticated",
  "message": "Token verified statelessly - no database lookup performed"
}
```

---

### T091: Test path-based security (mismatched user_id)

**Steps**:
1. Use the same token from T090
2. Use a DIFFERENT user_id in the path:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/users/00000000-0000-0000-0000-000000000000/me
```

**Expected Response** (403 Forbidden):
```json
{
  "detail": "User ID in path does not match token user ID"
}
```

---

### T092: Verify backend logs show NO database queries

**Steps**:
1. Watch the backend terminal while running T090
2. Look for database query logs

**Expected Result**:
- NO database queries logged
- Only token verification messages
- Confirms stateless verification

---

### T093: Test database connection failure handling

**Steps**:
1. Stop frontend server (Ctrl+C)
2. Edit `frontend/.env.local`:
   ```bash
   DATABASE_URL="postgresql://invalid:invalid@invalid/invalid"
   ```
3. Start frontend server: `npm run dev`
4. Try to sign up
5. Expected: Clear error message displayed

**Cleanup**:
1. Stop server
2. Restore correct DATABASE_URL in `.env.local`
3. Restart server

---

### T094: Verify backend works without database

**Steps**:
1. With invalid DATABASE_URL in frontend (from T093)
2. Backend should still verify tokens (stateless)
3. Run T090 again with valid token

**Expected Result**:
- Backend API still returns 200 OK
- Token verification works without database

---

### T095: Verify clear error messages

**Steps**:
1. Test various error scenarios:
   - Invalid email format
   - Weak password
   - Duplicate email
   - Wrong password on sign-in
   - Missing required fields

**Expected Result**: Clear, user-friendly error messages for each scenario

---

## Phase 7: End-to-End Validation

### T107: Run through quickstart.md verification checklist

**Steps**:
1. Open `specs/02-auth-db/quickstart.md`
2. Follow all verification steps
3. Check off each item in the checklist

---

### T108: Test complete user journey

**Steps**:
1. **Sign up**: Create new account → Verify redirected to dashboard
2. **Sign in**: Sign out → Sign in again → Verify redirected to dashboard
3. **Access dashboard**: Verify user info displayed correctly
4. **Call API**: Get token → Call `/api/v1/users/{user_id}/me` → Verify 200 OK
5. **Sign out**: Click sign out → Verify redirected to sign-in page

**Expected Result**: All steps complete successfully

---

### T109: Test Google OAuth flow

**Steps**:
1. Visit http://localhost:3000/sign-in
2. Click "Sign in with Google"
3. Select Google account
4. Grant permissions
5. Expected: Redirected to dashboard

**Verification**:
```sql
SELECT u.email, a.provider
FROM "user" u
JOIN "account" a ON u.id = a."userId"
WHERE a.provider = 'google';
```

---

### T110: Test account linking

**Steps**:
1. Sign up with email: link@example.com / Test123!@#
2. Sign out
3. Sign in with Google using link@example.com
4. Expected: Accounts linked, single user in database

**Verification**:
```sql
SELECT u.id, u.email, COUNT(a.id) as account_count
FROM "user" u
LEFT JOIN "account" a ON u.id = a."userId"
WHERE u.email = 'link@example.com'
GROUP BY u.id, u.email;
```

**Expected Result**: account_count = 2

---

### T111: Test password validation

**Steps**:
Try signing up with these passwords (should all fail):
1. `test` - Too short
2. `12345678` - No letters
3. `password` - No numbers or special chars
4. `Password` - No numbers or special chars
5. `Password123` - No special chars

**Expected Result**: Clear error message for each, explaining requirements

---

### T112: Test concurrent sessions

**Steps**:
1. Sign in on Chrome
2. Sign in on Firefox (same user)
3. Access dashboard on both browsers
4. Expected: Both sessions work simultaneously

---

### T113: Test token expiration

**Steps**:
1. Sign in
2. Wait 7 days (or modify expiration to 1 minute for testing)
3. Try to access dashboard
4. Expected: Redirect to sign-in page

**Quick Test** (modify expiration):
1. Edit `frontend/lib/auth.ts`:
   ```typescript
   session: {
     expiresIn: 60, // 1 minute instead of 7 days
   }
   ```
2. Restart server
3. Sign in
4. Wait 1 minute
5. Refresh dashboard
6. Expected: Redirect to sign-in

---

### T114: Test protected routes

**Steps**:
1. Open incognito/private window
2. Visit http://localhost:3000/dashboard
3. Expected: Redirect to sign-in page

---

### T115: Test path-based security

**Status**: Same as T091 (already tested)

---

### T116: Test stateless verification

**Status**: Same as T092 (already tested)

---

## Quick Verification Checklist

Use this checklist to quickly verify all functionality:

### Frontend
- [ ] Sign-up page loads
- [ ] Sign-in page loads
- [ ] Dashboard page loads (when authenticated)
- [ ] User can sign up with email/password
- [ ] User can sign in with email/password
- [ ] User can sign in with Google OAuth
- [ ] User menu displays correctly
- [ ] Sign-out works
- [ ] Session persists across page refreshes
- [ ] Protected routes redirect to sign-in when not authenticated

### Backend
- [ ] Health endpoint returns 200 OK: `curl http://localhost:8000/health`
- [ ] `/api/v1/users/{user_id}/me` returns user data with valid token
- [ ] `/api/v1/users/{user_id}/me` returns 401 with invalid token
- [ ] `/api/v1/users/{user_id}/me` returns 403 with mismatched user_id
- [ ] Token verification is stateless (no database queries)

### Database
- [ ] All 5 tables exist: user, session, account, verification, jwks
- [ ] User records created on sign-up
- [ ] Session records created on sign-in
- [ ] Account records created on OAuth sign-in
- [ ] Account linking works (same email, different providers)

### Integration
- [ ] Frontend issues JWT tokens on sign-in
- [ ] Backend verifies JWT tokens statelessly
- [ ] Path-based security enforced
- [ ] End-to-end flow works: Sign up → Sign in → API call → Success

---

## Troubleshooting

### Issue: "relation 'jwks' does not exist"
**Solution**: Already fixed! The `jwks` table has been created.

### Issue: "Could not validate credentials"
**Possible causes**:
1. Token expired (7 days)
2. Wrong BETTER_AUTH_SECRET in backend
3. Invalid token format

**Solution**:
1. Sign in again to get fresh token
2. Verify BETTER_AUTH_SECRET matches in frontend and backend
3. Check token format (should be JWT)

### Issue: "User ID in path does not match token user ID"
**Cause**: Path-based security working correctly
**Solution**: Use the correct user_id from token's `sub` claim

---

## Completion

After completing all verification tasks:
1. Mark tasks as complete in `specs/02-auth-db/tasks.md`
2. Document any issues found
3. Celebrate! 🎉 Your authentication system is fully verified and production-ready.
