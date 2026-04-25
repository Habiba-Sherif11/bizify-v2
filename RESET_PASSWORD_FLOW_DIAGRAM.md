# 🚀 Reset Password Flow - Visual Before/After

## ❌ BEFORE (What Was Broken)

```
┌─────────────────────────────────────────────────────────────────┐
│ USER FILLS PASSWORD RESET FORM                                  │
│ Email: test@gmail.com                                           │
│ OTP: 123456                                                     │
│ New Password: secure123                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND SENDS REQUEST (❌ WRONG FORMAT)                         │
│                                                                 │
│ POST /api/auth/reset-password                                   │
│                                                                 │
│ Request Body (❌ WRONG):                                         │
│ {                                                               │
│   "email": "test@gmail.com",                                    │
│   "otp_code": "123456",                                         │
│   "new_password": "secure123"                                   │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ NEXT.JS PROXY RECEIVES REQUEST                                  │
│ Converts to:                                                    │
│                                                                 │
│ POST /api/v1/auth/reset-password                                │
│ Body: { email, otp_code, new_password }   (❌ STILL WRONG)     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASTAPI BACKEND RECEIVES REQUEST                                │
│ Expected format:                                                │
│ Query params: ?email=...&otp_code=...&new_password=...         │
│                                                                 │
│ ❌ Got: JSON body instead                                       │
│ FastAPI checks: "Where are the query parameters?"              │
│ Response: 422 Validation Error - "Field required"              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND ERROR                                                  │
│ ❌ Password reset failed                                        │
│ ❌ Toast: "Password reset failed"                               │
│ ❌ User sees error, doesn't know why                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ AFTER (What We Fixed)

```
┌─────────────────────────────────────────────────────────────────┐
│ USER FILLS PASSWORD RESET FORM                                  │
│ Email: test@gmail.com                                           │
│ OTP: 123456                                                     │
│ New Password: secure123                                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND SENDS REQUEST (✅ CORRECT FORMAT)                       │
│                                                                 │
│ api.post("/auth/reset-password", null, {                        │
│   params: {                                                     │
│     email: "test@gmail.com",                                    │
│     otp_code: "123456",                                         │
│     new_password: "secure123"                                   │
│   }                                                             │
│ })                                                              │
│                                                                 │
│ Axios converts to:                                              │
│ GET /api/auth/reset-password?email=...&otp_code=...&new... ✅  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ NEXT.JS PROXY RECEIVES REQUEST                                  │
│ Extracts query params from body                                 │
│ Converts to:                                                    │
│                                                                 │
│ POST /api/v1/auth/reset-password?email=...&otp_code=...  ✅    │
│ (URLSearchParams format)                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FASTAPI BACKEND RECEIVES REQUEST                                │
│ Expected format:                                                │
│ Query params: ?email=...&otp_code=...&new_password=...         │
│                                                                 │
│ ✅ Got: Query parameters!                                       │
│ FastAPI checks: Query("email"), Query("otp_code"), ...         │
│ All parameters found ✅                                         │
│ Validates and resets password ✅                                │
│ Response: 200 OK { "success": true }                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND SUCCESS                                                │
│ ✅ Password reset successful                                    │
│ ✅ Toast: "Password reset successfully"                         │
│ ✅ Redirect to /login after 2 seconds                           │
│ ✅ User can login with new password                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔀 The Axios `params` Option - How It Works

```typescript
// Example 1: Using params option
api.post("/endpoint", null, {
  params: {
    email: "test@gmail.com",
    code: "123456"
  }
});

// Axios automatically converts to:
// POST /endpoint?email=test@gmail.com&code=123456
// (No JSON body sent)


// Example 2: What we were doing (WRONG)
api.post("/endpoint", {
  email: "test@gmail.com",
  code: "123456"
});

// Axios sends:
// POST /endpoint
// Body: { "email": "test@gmail.com", "code": "123456" }
// (Query string ignored, backend gets JSON)
```

---

## 📊 Comparison Table

| Aspect | ❌ Before | ✅ After |
|--------|----------|---------|
| **Frontend Pattern** | `api.post(url, data)` | `api.post(url, null, { params: data })` |
| **Actual Request** | POST body with JSON | GET query parameters |
| **Backend Receives** | Empty query params, has body | Full query params |
| **Backend Validation** | 422 - Field required | 200 - OK |
| **User Experience** | Error on submit | Successful redirect |

---

## 🎯 Key Takeaway

**Query Parameters ≠ Request Body**

When backend expects query parameters:
```typescript
// ❌ DON'T DO THIS:
api.post("/reset-password", { email, otp, password })

// ✅ DO THIS:
api.post("/reset-password", null, {
  params: { email, otp, password }
})
```

This converts the request to:
```
POST /reset-password?email=...&otp=...&password=...
```

Which is exactly what FastAPI expects! 🎉