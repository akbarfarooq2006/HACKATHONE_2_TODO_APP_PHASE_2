---
id: 005
title: Update plan for stateless JWT
stage: plan
date: 2026-01-14
surface: agent
model: claude-sonnet-4-5
feature: 02-auth-db
branch: 02_auth_db
user: system
command: /sp.plan
labels: ["stateless-jwt", "path-based-security", "plan-update"]
links:
  spec: specs/02-auth-db/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/02-auth-db/plan.md
  - specs/02-auth-db/data-model.md
  - specs/02-auth-db/contracts/auth-api.yaml
  - specs/02-auth-db/research.md
  - specs/02-auth-db/quickstart.md
tests:
  - Manual verification of stateless JWT token verification
  - Path-based security testing (403 Forbidden for mismatched user_id)
---

## Prompt

The spec has been updated to require stateless JWT and path-based security. Please update the plan files to match these new requirements. Remove any database verification steps and ensure the backend plan checks that the URL ID matches the Token ID.

## Response snapshot

Updated all planning artifacts to align with stateless JWT and path-based security requirements:

1. **plan.md**:
   - Changed backend token verification to stateless (NO database lookups)
   - Added path-based security requirement (user_id in path must match token sub claim)
   - Updated endpoint from `/api/v1/me` to `/api/v1/users/{user_id}/me`
   - Added 403 Forbidden response for path mismatches
   - Removed all database verification tasks from Layer 3

2. **data-model.md**:
   - Changed backend access from "read-only via SQLModel" to "NO database access for token verification"
   - Removed User model requirement for stateless verification
   - Emphasized token verification is purely cryptographic

3. **contracts/auth-api.yaml**:
   - Updated endpoint to include path parameter: `/api/v1/users/{user_id}/me`
   - Added 403 Forbidden response for path-based security violations
   - Updated descriptions to emphasize stateless verification
   - Added message field confirming stateless verification

4. **research.md**:
   - Completely rewrote R2 section for stateless JWT verification
   - Added path-based security dependency pattern (verify_path_user_id)
   - Removed all database lookup code from examples
   - Updated decision summary to emphasize NO database lookups

5. **quickstart.md**:
   - Added instructions to decode JWT and extract user_id from sub claim
   - Updated all curl examples to use new endpoint with user_id path parameter
   - Added test case for path-based security (403 Forbidden)
   - Updated verification checklist for stateless verification
   - Added troubleshooting section for 403 Forbidden errors

## Outcome

- ✅ Impact: All planning artifacts now align with stateless JWT and path-based security requirements
- 🧪 Tests: Added path-based security test cases (403 Forbidden for mismatched user_id)
- 📁 Files: Updated 5 planning documents (plan.md, data-model.md, contracts/auth-api.yaml, research.md, quickstart.md)
- 🔁 Next prompts: Run /sp.tasks to regenerate implementation tasks based on updated plan
- 🧠 Reflection: Stateless JWT verification eliminates database dependency for token validation, improving performance and scalability. Path-based security ensures users can only access their own resources.

## Evaluation notes (flywheel)

- Failure modes observed: None - all updates completed successfully
- Graders run and results (PASS/FAIL): Manual review PASS - all artifacts consistent
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Implement stateless JWT verification in backend code
