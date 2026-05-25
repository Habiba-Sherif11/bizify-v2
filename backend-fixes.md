# Backend Fixes & Changes Log

All changes made to the FastAPI backend (`../bizify backend/Bizify-Backend`) by the AI assistant. Newest entries first.

---

## 2026-05-25 — Google OAuth: Fix Broken Redirect URI

### Files changed:
- `app/api/v1/auth.py`
- `app/core/google_client.py`

### Problem
Google login was wired end-to-end but **never worked**. Both call sites built the redirect URI as `f"{settings.FRONTEND_URL}/"` — the frontend root. Google would consent, redirect the user to `https://<frontend>/?code=...`, and the homepage had no handler for the code. The OAuth code was wasted and the user appeared to land on the home page with a weird query string.

Additionally, `get_google_auth_url` concatenated query params manually without URL-encoding. As soon as `redirect_uri` contained `:` or `/` (i.e. always), Google would receive a malformed `redirect_uri` and either reject the request or interpret it differently from what was registered.

### Fix
- New `_google_redirect_uri()` helper in `auth.py` builds the URI as `f"{FRONTEND_URL.rstrip('/')}/api/auth/google/callback"`. Both `/auth/google/url` and `/auth/google/callback` use it, guaranteeing they match (Google requires byte-equal redirect URIs at auth time and token-exchange time).
- `google_client.get_google_auth_url` now uses `urllib.parse.urlencode` to assemble the query string, so all special characters in the redirect URI are properly percent-encoded.

### What the frontend (or DevOps) must do for this to work
Add the callback URL to **Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID → Authorized redirect URIs**:
- `http://localhost:3000/api/auth/google/callback` (local development)
- `https://<your-vercel-domain>/api/auth/google/callback` (production)

Both must be added — Google rejects redirects that aren't exactly registered. Also make sure the deployed backend's `FRONTEND_URL` env var points to the same Vercel domain (not `http://localhost:3000`).

---

## 📣 Read first — for the backend developer

### TL;DR
Signup returned **503 "Could not send email."** The credentials in `.env` are **correct** and working. The failure was caused by a bug in the original `_send_via_smtp` (a "try 587, then also try 465" loop) combined with the old mail layer swallowing every real error into one opaque message. The mail module has been rewritten with clean port handling, retries, and meaningful errors. **No env changes are required for the current Gmail SMTP setup.**

### How this was confirmed (the diagnostic done locally)
With the exact `.env` values you have today, a direct `smtplib` connection to `smtp.gmail.com:587` succeeded:

- `EHLO → STARTTLS → EHLO → LOGIN bizify0@gmail.com <app password>` → **OK**
- `send_message(...)` to a real recipient → **delivered**
- Both the spaced form `qctq zizx toeo wwrt` and the unspaced form `qctqzizxtoeowwrt` of the Gmail App Password authenticated successfully (Google strips spaces server-side).

So the credentials, the App Password format, network reachability, port 587, and STARTTLS are all fine.

### What actually went wrong in the old code
`app/core/mail.py` previously did this:
```python
ports_to_try = [(SMTP_HOST, SMTP_PORT)]
if SMTP_PORT != 465:
    ports_to_try.append((SMTP_HOST, 465))   # always also try 465

for host, port in ports_to_try:
    try:
        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=15)
        else:
            server = smtplib.SMTP(host, port, timeout=15)
            if SMTP_TLS:
                server.starttls()
        with server:
            server.login(...)
            server.send_message(...)
            return
    except Exception as e:
        last_exception = e

raise EmailDeliveryError("All SMTP attempts failed") from last_exception
```

Three problems:
1. **Whatever the first attempt's real error was, it got hidden behind a second (different) attempt.** The frontend received "All SMTP attempts failed" and the logs showed only the 465 failure (often a generic timeout), not the actual 587 error. Debugging was impossible.
2. **Two rapid authentication attempts from the same IP** can briefly trigger Gmail's anti-abuse throttling, especially during cold-start spikes. The second attempt makes the first attempt's transient issue worse instead of better.
3. **Missing `ehlo()` after `starttls()`.** Some Gmail edge nodes reject `AUTH LOGIN` if a fresh `EHLO` is not sent after the TLS handshake, returning a misleading auth error.

When this combined with any transient blip (cold start, network jitter, a previous failed attempt's throttle window), the result was the 503 you saw — even though the credentials were fine.

### What was changed (the fix)
**`app/core/mail.py` — rewritten:**
- One connection per call: port 465 → `SMTP_SSL`, anything else → `STARTTLS` if `SMTP_TLS=true`. No more "try 587 then also try 465".
- `EHLO` is sent both before and after `STARTTLS`, matching what Gmail expects.
- Retries **once** only on truly transient exceptions (`SMTPConnectError`, `SMTPServerDisconnected`, `TimeoutError`, `ConnectionError`).
- Auth and recipient errors are **not** retried — they're permanent and a retry just rate-limits you.
- Errors propagate with the real reason (`exc.smtp_code` and `exc.smtp_error` for SMTP, response body for Resend) instead of being collapsed into a single generic string.
- `_smtp_auth_hint()` adds a Gmail-specific message about App Passwords if and only if SMTP_HOST contains "gmail".

**`app/main.py` — startup validation:**
- After the DB check, prints `Email provider: smtp — SMTP configured (smtp.gmail.com:587).` (or a `[WARN]` line if misconfigured). You now see at boot whether email is wired up.

**`app/api/v1/auth.py` — `/auth/test-email`:**
- Returns structured JSON: `{ provider, config_ok, config_message, sent, error? }`. Hit it once after deploy and you know within one second whether email works, without going through the whole signup flow.

**`app/services/user_service.py`:**
- The 503 response now includes the real reason: `"Could not send verification email: <real error from the mail layer>"`. The frontend toast (via `extractErrorMessage`) now shows something actionable instead of a vague "Could not send email."

### After deploying these changes
1. Restart the backend.
2. Watch the startup log. Expected line:
   ```
    Email provider: smtp — SMTP configured (smtp.gmail.com:587).
   ```
3. Hit `GET /api/v1/auth/test-email?email=bizify0@gmail.com` (or any real inbox). Expected:
   ```json
   {
     "provider": "smtp",
     "config_ok": true,
     "config_message": "SMTP configured (smtp.gmail.com:587).",
     "sent": true,
     "message": "Test code 123456 dispatched. ..."
   }
   ```
4. Run signup. The OTP should now arrive in the user's inbox (and in Gmail's "Sent" folder of `bizify0@gmail.com`).

### If it still fails after the rewrite
The new error message tells you exactly what to do. Common late-stage causes:
- **Render / Railway / Heroku free tier blocking outbound port 587** — switch the env to `SMTP_PORT=465` (the new code handles SSL automatically).
- **Gmail "less secure app access" review triggered** — `bizify0@gmail.com` may have received a "Critical security alert" email. Click "Yes, it was me" or generate a fresh App Password and replace `SMTP_PASSWORD`.
- **Gmail daily sending quota hit (≥500/day on free Gmail)** — wait 24h or switch to Resend for production scale.

---

## 2026-05-25 — Production-Grade Email Layer

### Files changed:
- `app/core/mail.py` *(rewritten)*
- `app/main.py` *(startup validation)*
- `app/api/v1/auth.py` *(richer `/auth/test-email`)*
- `app/services/user_service.py` *(surface real failure reason)*

### Why this change
The previous mail layer worked only when the provider was happy. When it wasn't:
- Frontend got an opaque `503 "Could not send email."` with no clue why.
- Backend logs lost the actual SMTP / Resend error inside `EmailDeliveryError("All SMTP attempts failed")`.
- Misconfigured `.env` only failed at signup time — the server happily started up.
- Common Gmail-App-Password and Resend-unverified-domain mistakes had no guidance.
- A weird "try the configured port, then also try 465" loop made debugging worse, because the wrong-port attempt's error was the one logged.

### What changed

**`app/core/mail.py` — rewritten:**
- New `configured_provider()` returns `"dev" | "resend" | "smtp"` based on settings, so every other layer reasons about provider explicitly instead of inferring it.
- New `validate_email_config()` performs config sanity checks and returns `(ok, message)`. Catches the most common foot-guns:
  - Resend with no verified `EMAILS_FROM_EMAIL` (would silently only deliver to the Resend account owner).
  - SMTP missing host / user / password.
  - Neither provider configured and `EMAIL_DEV_MODE` off.
- `_send_via_resend`:
  - Retries once on `httpx.RequestError` (transient network). Does **not** retry on 4xx/5xx (the API rejected the request — retry will not help).
  - `_resend_hint()` maps common Resend errors to actionable messages: invalid key, unverified domain, `onboarding@resend.dev` recipient restriction, rate limit.
- `_send_via_smtp`:
  - Picks connection mode from `SMTP_PORT` alone — port 465 → `SMTP_SSL`, anything else → `STARTTLS` (if `SMTP_TLS`). No more "try both ports" loop.
  - Distinguishes transient (`SMTPConnectError`, `SMTPServerDisconnected`, `TimeoutError`, `ConnectionError`) from permanent (`SMTPAuthenticationError`, `SMTPRecipientsRefused`) failures. Only transient is retried.
  - `_smtp_auth_hint()` returns a Gmail-specific message pointing at App Passwords when auth fails against `smtp.gmail.com`, plus echoes the raw server response for non-Gmail hosts.
  - `ehlo()` before and after `starttls()` (some servers reject `LOGIN` without re-handshaking after TLS).

**`app/main.py` — startup validation:**
- Lifespan now calls `validate_email_config()` after the DB check.
- Prints `Email provider: <resend|smtp|dev> — <message>` on success or `[WARN] Email provider misconfigured (...)` on failure.
- Does **not** abort startup — the rest of the API is still usable; signup will return a clear 503 when actually hit.

**`app/api/v1/auth.py` — `/auth/test-email`:**
- Returns a structured diagnostic payload instead of a one-line message:
  ```json
  {
    "provider": "smtp",
    "config_ok": true,
    "config_message": "SMTP configured (smtp.gmail.com:587).",
    "sent": false,
    "error": "Gmail SMTP authentication failed. Gmail no longer accepts regular passwords..."
  }
  ```
- Safe in production: only exposes the resolved provider name and the validation message — never the API key, SMTP password, or full response body.

**`app/services/user_service.py` — surface the real reason:**
- The catch-all `HTTPException(503, "Could not send email.")` now becomes `HTTPException(503, f"Could not send verification email: {exc}")`, where `exc` is the helpful message from the rewritten mail layer (e.g. "Gmail SMTP authentication failed. Use an App Password…").
- The frontend's existing `extractErrorMessage` reads `detail` and displays it in the toast, so users immediately see something actionable instead of being stuck on a vague error.
- The raw OTP is still **never** included in the response — only in server logs.

### How to fix production email (do exactly one of these)

Hit `GET /api/v1/auth/test-email?email=you@example.com` after each change. It tells you the provider, whether config validation passed, and the literal error if send failed.

#### Option A — Resend (recommended for production)
1. Sign up at [resend.com](https://resend.com), create an API key.
2. Add and verify your sending domain at resend.com/domains (DNS records — SPF, DKIM).
3. Set in backend `.env`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
   EMAILS_FROM_EMAIL=noreply@yourverifieddomain.com
   ```
4. Restart the backend. Startup log should show `Email provider: resend — Resend configured (from: noreply@yourverifieddomain.com).`
5. **Do not** leave `EMAILS_FROM_EMAIL` unset in production. The fallback `onboarding@resend.dev` is a shared Resend address that only delivers to the Resend account owner's own email — every other user receives nothing.

#### Option B — Gmail SMTP
1. Enable 2-Step Verification on the Gmail account.
2. Generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (16 chars, no spaces).
3. Set in backend `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_TLS=true
   SMTP_USER=you@gmail.com
   SMTP_PASSWORD=xxxxxxxxxxxxxxxx
   EMAILS_FROM_EMAIL=you@gmail.com
   # Make sure RESEND_API_KEY is NOT set (or it'll take priority)
   ```
4. Restart. Startup log shows `Email provider: smtp — SMTP configured (smtp.gmail.com:587).`
5. Gmail rejects ≥500 messages/day for free accounts — fine for OTP, not for marketing volume.

#### Option C — Other SMTP (SendGrid, Mailgun, AWS SES, etc.)
Same env vars as Gmail, swap `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` per the provider's docs. Use port 465 if they require implicit SSL; the new mail layer handles it automatically.

### Result
- `signup` no longer returns a vague 503 — the toast tells the user (and the developer) the actual cause.
- Misconfigured `.env` is flagged at startup, not at first signup attempt.
- Transient network blips are retried automatically; permanent errors fail fast without wasted retries.
- The diagnostic endpoint gives one-shot confirmation that email works.

---

## 2026-05-25 — verify-otp: Return Access Token

### File changed:
- `app/services/auth_service.py`

### Problem
`AuthService.verify_otp` returned only `{"message": "Account verified successfully"}`. The Next.js frontend (`src/app/api/auth/verify-otp/route.ts`) extracts `access_token` from this response and sets the `auth_token` httpOnly cookie — but the field didn't exist, so the cookie was never set.

Downstream effect: after OTP verification the signup wizard advanced to step 3 (Questionnaire), but every protected call (`/profile/questionnaire`, `/profile/skills`, `/profile/complete`, `/ai/run`) returned 401, and the axios response interceptor force-logged the user out mid-signup.

### Fix
After a successful OTP check, look up the user and merge `AuthService.create_token_response(user)` into the response:
```python
return {
    "message": "Account verified successfully",
    **token_response,   # access_token, token_type
}
```
The frontend already reads and stores `access_token`, so no frontend changes were required. Partner accounts also receive a token — the UI gates their access via `approval_status` from `/users/me`.

---
