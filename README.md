# Bizify v2 - AI-Powered Business Ecosystem Platform

## Executive Summary

Bizify v2 is a comprehensive, role-based business platform that leverages artificial intelligence to connect entrepreneurs, manufacturers, mentors, suppliers, and administrators within a unified ecosystem. The platform facilitates business matchmaking, provides AI-driven mentorship for startups, and streamlines the process of building sustainable business relationships.

The application serves as a **multi-tenant marketplace** that enables users from different business verticals to discover opportunities, access mentorship, and establish partnerships through an intuitive web interface powered by modern full-stack technologies.

---

## Table of Contents

1. [Core Features](#core-features)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Authentication System](#authentication-system)
6. [Role-Based Access Control](#role-based-access-control)
7. [API Architecture](#api-architecture)
8. [Setup Instructions](#setup-instructions)
9. [Development Workflow](#development-workflow)
10. [Deployment](#deployment)

---

## Core Features

### 1. **Multi-Role Authentication System**
- Secure user registration and login with email-based authentication
- Role assignment during signup (Entrepreneur, Manufacturer, Mentor, Supplier, Admin)
- Two-factor authentication via OTP (One-Time Password)
- Password recovery workflow with secure reset mechanism
- Session management with JWT-based bearer tokens stored in HTTP-only cookies

### 2. **Role-Based Dashboards**
- **Entrepreneur Dashboard** (`/entrepreneur`): Access to mentorship resources, manufacturer connections, and business tools
- **Manufacturer Dashboard** (`/manufacturer`): Production insights, supplier management, and opportunity tracking
- **Mentor Dashboard** (`/mentor`): Startup tracking, mentee management, and guidance delivery
- **Supplier Dashboard** (`/supplier`): Product catalog management, order fulfillment, and business analytics
- **Admin Dashboard** (`/admin`): Platform governance, user management, and system monitoring

### 3. **AI-Powered Startup Mentorship**
- Intelligent mentor matching based on business profile and needs
- AI-driven guidance and business consultation features
- Interactive questionnaire for profile enrichment
- Skills assessment and categorization

### 4. **Business Discovery & Networking**
- Landing page showcasing platform value proposition
- Problems and solutions visualization for target audiences
- Pricing tiers for different user segments
- Integration opportunities for partners

### 5. **User Onboarding Flow**
- Multi-step signup process with skill selection
- Questionnaire-based profile building
- OTP verification at critical stages
- Role-specific onboarding pathways

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  (Next.js 16 with React 19 - App Router Pattern)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Landing Pages   │  │  Auth Pages     │  │  Role Dashboards│ │
│  │  - Hero Section  │  │  - Login        │  │  - /entrepreneur│ │
│  │  - Pricing       │  │  - Signup       │  │  - /manufacturer│ │
│  │  - How It Works  │  │  - Forgot Pass  │  │  - /mentor      │ │
│  │  - AI Mentor CTA │  │  - Reset Pass   │  │  - /supplier    │ │
│  │                  │  │  - OTP Verify   │  │  - /admin       │ │
│  └──────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │            State Management & Data Fetching Layer            │ │
│  │  ┌─────────────────────────┐  ┌─────────────────────────┐  │ │
│  │  │  React Context (Auth)   │  │  TanStack React Query  │  │ │
│  │  │  - useAuth Hook         │  │  - Server State Sync   │  │ │
│  │  │  - AuthContext Provider │  │  - Caching Strategy   │  │ │
│  │  └─────────────────────────┘  └─────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              API Client Layer (Axios)                         │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │ Request Interceptor: Attach Bearer Token from Cookies  │ │ │
│  │  │ Response Interceptor: Error Handling & Retry Logic     │ │ │
│  │  │ Base URL: /api (proxies to Next.js API Routes)         │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │            UI Component Layer (shadcn/ui)                    │ │
│  │  - Button, Card, Alert, Badge Components                    │ │
│  │  - Radix UI Primitives                                       │ │
│  │  - TailwindCSS Styling & Animations                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                              │
│  Next.js Middleware (middleware.ts)                              │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ • Authentication Check: Verify auth_token Cookie            │ │
│  │ • Protected Route Enforcement:                               │ │
│  │   - Routes: /entrepreneur, /manufacturer, /mentor,          │ │
│  │            /supplier, /admin                                 │ │
│  │ • Public Route Guarding: Redirect logged-in users away      │ │
│  │   from login/signup pages                                    │ │
│  │ • Callback URL Preservation: Maintain redirect after login  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                  NEXT.JS API ROUTES LAYER                        │
│  RESTful API Endpoints (Query Parameters Based)                  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Authentication Endpoints (/api/auth/*)                   │   │
│  │  • POST /signup?{email, full_name, password}             │   │
│  │  • POST /login?{email, password}                         │   │
│  │  • POST /verify-otp?{email, otp_code}                    │   │
│  │  • POST /forgot-password?{email}                         │   │
│  │  • POST /reset-password?{email, otp_code, new_password}  │   │
│  │  • GET  /me (Bearer Token Required)                      │   │
│  │  • POST /profile/skills?{skills[]}                       │   │
│  │  • POST /questionnaire?{answers[]}                       │   │
│  │  • POST /register-partner?{partner_data}                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Health Check Endpoint                                    │   │
│  │  • GET /health (No Auth Required)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/REST
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND SERVICE LAYER                          │
│  (External Authentication & Business Logic Service)              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • User Management Service                                │   │
│  │   - Registration & Credential Validation                 │   │
│  │   - Email Verification & OTP Generation                  │   │
│  │   - Password Hashing & Reset Workflows                   │   │
│  │ • JWT Token Issuance & Validation                        │   │
│  │ • Role & Permission Assignment                           │   │
│  │ • Profile & Skills Management                            │   │
│  │ • Business Logic Processing (Questionnaire, Matching)    │   │
│  │ • Data Persistence & Transactions                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                               │
│  (SQL/NoSQL Backend - Connection via Backend Service)            │
│                                                                   │
│  • User Records & Authentication Credentials                     │
│  • OTP Tokens & Verification States                              │
│  • Role-Based User Profiles                                      │
│  • Skills & Questionnaire Responses                              │
│  • Session & Token Management Data                               │
│  • Platform Analytics & Audit Logs                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow Sequence

```
USER                          FRONTEND                       API ROUTES                    BACKEND SERVICE
 │                               │                               │                              │
 │─── 1. Submit Signup Form ────>│                               │                              │
 │                               │─── 2. POST /signup ────────────────────────────────>│
 │                               │      (Query params: email, password, name)           │
 │                               │                               │                      │
 │                               │                               │ 3. Validate Input   │
 │                               │                               │    Hash Password    │
 │                               │                               │    Create User     │
 │                               │                               │                      │
 │                               │<────── 4. Return Token ─────────────────────────────│
 │                               │      Set auth_token Cookie (HTTP-only)               │
 │<────── 5. Show OTP Page ──────│                               │                      │
 │                               │                               │                      │
 │─── 6. Submit OTP Code ───────>│                               │                      │
 │                               │─── 7. POST /verify-otp ───────────────────────────>│
 │                               │      (Query params: email, otp_code)                │
 │                               │                               │ 8. Verify OTP     │
 │                               │<────── 9. Verification Confirmed ──────────────────│
 │<────── 10. Login Success ─────│                               │                      │
 │        Redirect to Dashboard   │                               │                      │
 │                               │                               │                      │
```

### Protected Route Access Flow

```
USER REQUEST TO /entrepreneur
        ↓
    MIDDLEWARE (middleware.ts)
        ↓
    Check auth_token Cookie exists?
    ├─ YES → Check Token Valid?
    │         ├─ YES → Allow Access
    │         │         ↓
    │         │    Load Dashboard Component
    │         │         ↓
    │         │    useAuth() Hook Attaches Bearer Token
    │         │         ↓
    │         │    Axios Interceptor Adds: Authorization: Bearer {token}
    │         │         ↓
    │         │    API Requests Proceed with Authentication
    │         │
    │         └─ NO → Redirect to /login
    │
    └─ NO → Redirect to /login?callbackUrl=/entrepreneur
            (callbackUrl preserved for post-login redirect)
```

---

## Technology Stack

### Frontend Framework & Runtime
- **Next.js 16.2.4**: Modern React framework with Server Components, App Router, and built-in API route support
- **React 19.2.4**: Latest React version with concurrent features and automatic batching
- **React DOM 19.2.4**: DOM rendering library

### State Management & Data Fetching
- **TanStack React Query 5.100.1**: Server state management, caching, synchronization, and background refetching
  - Handles API response caching with configurable stale time
  - Automatic retry logic on failed requests
  - Background refetching and garbage collection
- **React Context API**: Client-side state management for authentication and global app state (AuthContext)

### Form Handling & Validation
- **React Hook Form 7.73.1**: Performance-optimized form state management with minimal re-renders
- **@hookform/resolvers 5.2.2**: Schema validation integration library
- **Zod 4.3.6**: TypeScript-first schema validation with comprehensive type inference
  - Email validation
  - Password strength validation
  - OTP format validation
  - Profile questionnaire validation

### HTTP Client & API Communication
- **Axios 1.15.2**: Promise-based HTTP client with interceptor middleware
  - Request interceptor: Automatically attaches Bearer tokens from cookies
  - Response interceptor: Global error handling and logging
  - Automatic JSON serialization/deserialization
  - Request timeout configuration

### UI Component Library & Styling
- **shadcn/ui**: Unstyled, accessible component library built on Radix UI primitives
- **Radix UI 1.4.3**: Low-level primitives for building accessible design systems
- **TailwindCSS 4**: Utility-first CSS framework for responsive design
- **tailwind-merge 3.5.0**: Utility for merging TailwindCSS classes intelligently
- **tw-animate-css 1.4.0**: Animation utilities for smooth transitions and micro-interactions
- **lucide-react 1.9.0**: Comprehensive icon library (SVG-based)
- **clsx 2.1.1**: Utility for conditional CSS class composition

### UI Utilities
- **class-variance-authority 0.7.1**: Type-safe CSS-in-JS component variants and styling patterns

### Notifications & User Feedback
- **react-toastify 11.1.0**: Toast notifications for user feedback (success, error, info, warning)

### TypeScript & Development Tools
- **TypeScript 5**: Full-featured type checking and modern JavaScript syntax
- **ESLint 9**: Code linting and quality enforcement
- **@types/react & @types/react-dom**: Type definitions for React libraries
- **@types/node**: Type definitions for Node.js APIs

### Build & Runtime Configuration
- **TailwindCSS PostCSS 4**: PostCSS integration for Tailwind CSS compilation
- **postcss.config.mjs**: PostCSS configuration for CSS transformation pipeline

---

## Project Structure

```
bizify-v2/
├── src/
│   ├── app/                                 # Next.js App Router (Pages & API Routes)
│   │   ├── (auth)/                          # Route group for authentication pages
│   │   │   ├── login/page.tsx               # Login page (/login)
│   │   │   ├── signup/page.tsx              # Signup page (/signup)
│   │   │   ├── forgot-password/page.tsx     # Forgot password page (/forgot-password)
│   │   │   └── reset-password/page.tsx      # Reset password page (/reset-password)
│   │   │
│   │   ├── api/                             # RESTful API routes (Query Parameter Based)
│   │   │   ├── auth/
│   │   │   │   ├── signup/route.ts          # POST /api/auth/signup
│   │   │   │   ├── login/route.ts           # POST /api/auth/login
│   │   │   │   ├── verify-otp/route.ts      # POST /api/auth/verify-otp
│   │   │   │   ├── forgot-password/route.ts # POST /api/auth/forgot-password
│   │   │   │   ├── reset-password/route.ts  # POST /api/auth/reset-password
│   │   │   │   ├── me/route.ts              # GET  /api/auth/me (protected)
│   │   │   │   ├── profile/skills/route.ts  # POST /api/auth/profile/skills
│   │   │   │   ├── questionnaire/route.ts   # POST /api/auth/questionnaire
│   │   │   │   └── register-partner/route.ts# POST /api/auth/register-partner
│   │   │   └── health/route.ts              # GET  /api/health
│   │   │
│   │   ├── entrepreneur/page.tsx            # Protected: Entrepreneur Dashboard (/entrepreneur)
│   │   ├── manufacturer/page.tsx            # Protected: Manufacturer Dashboard (/manufacturer)
│   │   ├── mentor/page.tsx                  # Protected: Mentor Dashboard (/mentor)
│   │   ├── supplier/page.tsx                # Protected: Supplier Dashboard (/supplier)
│   │   ├── admin/page.tsx                   # Protected: Admin Dashboard (/admin)
│   │   │
│   │   ├── middleware.ts                    # Authentication & Route Protection Middleware
│   │   ├── layout.tsx                       # Root layout with providers
│   │   └── page.tsx                         # Home/Landing page (/)
│   │
│   ├── components/                          # Reusable UI Components
│   │   ├── sections/                        # Page section components
│   │   │   ├── navbar.tsx                   # Navigation bar with logo and auth links
│   │   │   ├── hero.tsx                     # Landing page hero section
│   │   │   ├── herobg.tsx                   # Hero section background
│   │   │   ├── hero-mockup.tsx              # Product mockup display
│   │   │   ├── problems.tsx                 # Problem statement section
│   │   │   ├── solutions.tsx                # Solution highlights section
│   │   │   ├── why-bizify.tsx               # Value proposition section
│   │   │   ├── how-it-works-new.tsx         # Process explanation section
│   │   │   ├── ai-startup-mentor.tsx        # AI mentorship CTA section
│   │   │   ├── pricing.tsx                  # Pricing tiers section
│   │   │   ├── process-card.tsx             # Individual process step card
│   │   │   ├── footer.tsx                   # Footer with links and info
│   │   │   ├── logo.tsx                     # Logo component
│   │   │   └── section-with-bg.tsx          # Container with background styling
│   │   │
│   │   ├── ui/                              # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx                   # Styled button component
│   │   │   ├── card.tsx                     # Card container component
│   │   │   ├── alert.tsx                    # Alert/notification component
│   │   │   └── badge.tsx                    # Badge/tag component
│   │   │
│   │   ├── providers/                       # Context providers and wrappers
│   │   │   ├── ReactQueryProvider.tsx       # TanStack React Query setup
│   │   │   └── AnimationProvider.tsx        # Animation framework setup
│   │   │
│   │   └── shared/                          # Shared utility components (reserved)
│   │
│   ├── features/                            # Feature-specific logic (Modular organization)
│   │   └── auth/                            # Authentication feature module
│   │       ├── components/                  # Auth-specific components
│   │       │   ├── SignupForm.tsx           # Multi-step signup form component
│   │       │   ├── LoginForm.tsx            # Login form component
│   │       │   ├── ForgotPasswordForm.tsx   # Forgot password form component
│   │       │   ├── ResetPasswordForm.tsx    # Reset password form component
│   │       │   ├── OTPVerification.tsx      # OTP input and verification
│   │       │   ├── AccountStep.tsx          # Account information step in signup
│   │       │   ├── SkillsStep.tsx           # Skills selection step in signup
│   │       │   ├── QuestionnaireStep.tsx    # Profile questionnaire step
│   │       │   ├── SuccessStep.tsx          # Signup completion success screen
│   │       │   └── ProgressBar.tsx          # Multi-step progress indicator
│   │       │
│   │       ├── hooks/                       # Custom React hooks for auth
│   │       │   ├── useAuth.ts               # Authentication context hook
│   │       │   ├── useLogin.ts              # Login mutation hook
│   │       │   └── useSignup.ts             # Signup mutation hook
│   │       │
│   │       ├── context/                     # React Context setup
│   │       │   └── AuthContext.tsx          # Global auth state context
│   │       │
│   │       ├── lib/                         # Utility functions for auth
│   │       │   ├── api.ts                   # Axios instance with interceptors
│   │       │   ├── validations.ts           # Zod validation schemas
│   │       │   └── helpers.ts               # Utility functions (reserved)
│   │       │
│   │       ├── types/                       # TypeScript type definitions
│   │       │   └── index.ts                 # Auth-related types (User, Credentials, etc.)
│   │       │
│   │       └── screens/                     # Full-page auth screens (reserved)
│   │
│   ├── styles/                              # Global styles
│   │   ├── globals.css                      # Global CSS and Tailwind directives
│   │   └── animations.css                   # Custom animation definitions
│   │
│   ├── lib/                                 # Shared utility functions
│   │   └── utils.ts                         # Miscellaneous helpers (cn for classNames)
│   │
│   ├── types/                               # Global type definitions (reserved)
│   ├── hooks/                               # Global custom hooks (reserved)
│   └── i18n/                                # Internationalization setup (reserved)
│
├── public/                                  # Static assets
│   └── (favicons, robots.txt, etc.)
│
├── src/assets/                              # Project images and media
│   ├── imgs/
│   │   ├── auth/                            # Authentication-related images
│   │   │   └── login.png                    # Login page background
│   │   └── landing/                         # Landing page images
│   │       ├── hero-bg.png                  # Hero section background
│   │       ├── mock-bg.png                  # Product mockup background
│   │       ├── section2.png                 # Mid-page section background
│   │       └── section33.png                # Lower section background
│   │
│   └── fonts/                               # Custom font files (reserved)
│
├── .env.local                               # Environment variables (gitignored)
├── .gitignore                               # Git ignore rules
├── .next/                                   # Next.js build output (gitignored)
├── tsconfig.json                            # TypeScript configuration
├── tsconfig.tsbuildinfo                     # TypeScript build cache
├── next.config.ts                           # Next.js configuration
├── postcss.config.mjs                       # PostCSS configuration
├── eslint.config.mjs                        # ESLint configuration
├── components.json                          # shadcn/ui configuration
├── package.json                             # NPM dependencies and scripts
├── package-lock.json                        # Locked dependency versions
├── README.md                                # This file
└── CLAUDE.md                                # Claude AI instructions

```

---

## Authentication System

### Overview
The authentication system is built on a **token-based architecture** with query parameter-driven API endpoints. The backend manages credentials, OTP generation, and token issuance, while the frontend handles form submission, state management, and token storage.

### Key Components

#### 1. **AuthContext** (`src/features/auth/context/AuthContext.tsx`)
Global React Context providing authentication state across the application.

**Provided Values:**
- `isAuthenticated`: Boolean flag indicating user login status
- `user`: Current user object with role, email, and profile information
- `token`: Bearer token for API authentication
- `login()`: Function to initiate login flow
- `logout()`: Function to clear session and remove token
- `signup()`: Function to register new user

#### 2. **API Interceptor** (`src/features/auth/lib/api.ts`)
Axios instance with automatic Bearer token injection.

**Request Interceptor Flow:**
```
1. Extract auth_token from document.cookie
2. Add to Authorization header: "Bearer {token}"
3. Attach to all outgoing API requests
4. Log token attachment for debugging
```

**Response Interceptor Flow:**
```
1. Inspect response status
2. If 401 (Unauthorized): Token expired, trigger re-login
3. If 4xx/5xx errors: Log and pass to error handlers
4. Return response or reject promise
```

#### 3. **Validation Schemas** (`src/features/auth/lib/validations.ts`)
Zod schemas for all authentication operations:

```typescript
// Signup validation
- Email format validation (RFC 5322 compliant)
- Password strength: minimum 8 characters, mixed case, numbers, special chars
- Password confirmation match
- Full name required and trimmed

// Login validation
- Valid email format
- Non-empty password

// OTP validation
- 6-digit numeric code
- Non-empty requirement

// Reset password validation
- Valid email
- Valid OTP code
- New password meets strength requirements
- Password confirmation match
```

### Authentication Workflow Details

#### **Signup Flow (Multi-Step)**

**Step 1: Account Creation**
```
User Input: email, full_name, password, confirm_password
           ↓
Validation (Zod): Email format, password strength, match confirmation
           ↓
API Call: POST /api/auth/signup?email={email}&full_name={name}&password={pass}
           ↓
Backend:
  - Hash password (bcrypt or similar)
  - Create user record with role = "pending"
  - Generate OTP and send via email
  - Return temporary JWT token
           ↓
Frontend: Store token in auth_token cookie (HTTP-only)
           ↓
Display: OTP verification step
```

**Step 2: OTP Verification**
```
User Input: otp_code (6 digits)
           ↓
API Call: POST /api/auth/verify-otp?email={email}&otp_code={code}
           ↓
Backend:
  - Validate OTP against stored code
  - Check OTP expiry (typically 10-15 minutes)
  - Mark email as verified
  - Update user account status
           ↓
Frontend: Display skills selection step
```

**Step 3: Skills Selection**
```
User Input: Select skills from predefined list (checkboxes)
           ↓
Frontend: Store in local state
           ↓
Display: Questionnaire step or success confirmation
```

**Step 4: Questionnaire (Optional)**
```
User Input: Business profile questions
           - Industry type
           - Company stage
           - Team size
           - Funding status
           - Key challenges
           ↓
API Call: POST /api/auth/questionnaire?answers={serialized_json}
           ↓
Backend:
  - Process questionnaire responses
  - Enrich user profile with additional data
  - Update role based on answers (if applicable)
  - Trigger AI profile matching
           ↓
Frontend: Show success screen with next steps
```

#### **Login Flow**

```
User Input: email, password
           ↓
Validation: Email format, non-empty password
           ↓
API Call: POST /api/auth/login?email={email}&password={password}
           ↓
Backend:
  - Retrieve user by email
  - Compare password hash
  - Verify email is verified and account is active
  - Check if 2FA is required
           ↓
Response Options:
  A) 2FA Required:
     - Generate OTP
     - Send via email
     - Return temporary token
     - Redirect to OTP verification
  
  B) 2FA Not Required:
     - Generate JWT token
     - Set auth_token cookie (HTTP-only, Secure, SameSite=Strict)
     - Return user profile
           ↓
Frontend:
  - Store permanent token in cookie
  - Dispatch AuthContext update
  - Redirect to protected dashboard
```

#### **Password Recovery Flow**

**Step 1: Request Password Reset**
```
User Input: email
           ↓
API Call: POST /api/auth/forgot-password?email={email}
           ↓
Backend:
  - Find user by email
  - Generate OTP reset code
  - Send OTP via email
  - Create temporary reset token (short TTL)
           ↓
Frontend: Display OTP entry form
```

**Step 2: OTP Verification & Password Reset**
```
User Input: otp_code, new_password, confirm_password
           ↓
API Call: POST /api/auth/reset-password?email={email}&otp_code={code}&new_password={pass}
           ↓
Backend:
  - Validate OTP matches generated code
  - Validate OTP not expired
  - Hash new password
  - Update user password in database
  - Invalidate previous tokens (force re-login)
  - Send confirmation email
           ↓
Frontend: Show success message, redirect to login
```

### Token Management

#### **Token Storage**
- **Location**: HTTP-only cookie named `auth_token`
- **Security Flags**:
  - `HttpOnly`: Prevents JavaScript access (CSRF protection)
  - `Secure`: Transmitted only over HTTPS
  - `SameSite=Strict`: Prevents cross-site cookie transmission
- **Expiry**: Backend-determined (typically 7-30 days)

#### **Token Lifecycle**
```
Issuance (Login/OTP):
  └─ Backend generates JWT with user ID, role, expiry
  └─ Frontend receives via Set-Cookie header
  └─ Browser manages cookie automatically

Request Attachment:
  └─ Axios interceptor reads cookie
  └─ Adds "Authorization: Bearer {token}" header
  └─ All API requests include token

Expiry & Refresh:
  └─ Token expiry checked on each API response
  └─ If 401 received: Token expired
  └─ Trigger silent refresh or redirect to login
  └─ User re-authenticates to get new token

Logout:
  └─ Frontend: Delete auth_token cookie
  └─ Clear AuthContext state
  └─ Redirect to login page
  └─ Backend: May invalidate token in token blacklist
```

---

## Role-Based Access Control (RBAC)

### Role Definitions

| Role | Route | Purpose | Key Permissions |
|------|-------|---------|-----------------|
| **Entrepreneur** | `/entrepreneur` | Access to business tools, mentorship resources, supplier connections | View mentor profiles, Request mentorship, Browse suppliers, Create RFQs |
| **Manufacturer** | `/manufacturer` | Production insights, order management, supplier oversight | Manage orders, Track production, Supplier management, Analytics |
| **Mentor** | `/mentor` | Guide startups, track mentees, deliver guidance | View startup profiles, Provide feedback, Track progress, Schedule sessions |
| **Supplier** | `/supplier` | Manage inventory, fulfill orders, business analytics | Manage catalog, Process orders, Analytics, Track inventory |
| **Admin** | `/admin` | Platform governance, user management, system monitoring | User management, Content moderation, Analytics, System settings |

### Access Control Implementation

#### **Middleware-Level Protection** (`src/app/middleware.ts`)

```typescript
// Protected routes requiring authentication
const protectedPrefixes = [
  "/entrepreneur",  // Only authenticated users
  "/manufacturer",  // Only authenticated users
  "/mentor",        // Only authenticated users
  "/supplier",      // Only authenticated users
  "/admin",         // Only authenticated users + admin role check
];

// Public routes (accessible without auth)
const publicRoutes = [
  "/",              // Landing page
  "/login",         // Login page
  "/signup",        // Signup page
  "/forgot-password", // Forgot password page
  "/reset-password" // Reset password page
];

// Middleware Logic:
1. Extract auth_token from cookies
2. If token exists AND user on public route → Redirect to home
3. If route is protected AND no token → Redirect to login (preserve callback URL)
4. Otherwise → Allow access
```

#### **Component-Level Protection**

Within dashboard components, role validation can be implemented:

```typescript
// Example in Entrepreneur Dashboard
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function EntrepreneurDashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== "entrepreneur") {
    // Redirect or show unauthorized message
    return <Unauthorized />;
  }

  return <Dashboard />;
}
```

#### **API-Level Role Enforcement**

Each API route can validate user role from token:

```typescript
// Example in /api/auth/me route
export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifyTokenAndGetUser(token);
  
  if (!user) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  return Response.json(user);
}
```

---

## API Architecture

### API Design Principles
- **Query Parameter-Based**: All parameters passed via URL query strings (not JSON bodies)
- **RESTful Conventions**: Standard HTTP methods (GET, POST, PUT, PATCH)
- **Authentication**: Bearer token in Authorization header
- **Response Format**: JSON responses with consistent error handling

### Endpoint Reference

#### **Authentication Endpoints**

**1. User Registration**
```
Endpoint: POST /api/auth/signup
Query Params:
  - email: string (required, email format)
  - full_name: string (required)
  - password: string (required, minimum 8 chars)
  - role: string (optional, default: "pending")

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "pending",
      "is_verified": false,
      "created_at": "2024-05-08T10:00:00Z"
    },
    "token": "jwt_token_here"
  }
}

Response (400):
{
  "success": false,
  "error": "Email already registered"
}
```

**2. User Login**
```
Endpoint: POST /api/auth/login
Query Params:
  - email: string (required)
  - password: string (required)

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "entrepreneur",
      "full_name": "John Doe",
      "is_verified": true,
      "is_active": true,
      "created_at": "2024-05-08T10:00:00Z"
    },
    "token": "jwt_token_here"
  }
}

Response (401):
{
  "success": false,
  "error": "Invalid credentials"
}
```

**3. OTP Verification**
```
Endpoint: POST /api/auth/verify-otp
Query Params:
  - email: string (required)
  - otp_code: string (required, 6 digits)

Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}

Response (400):
{
  "success": false,
  "error": "Invalid or expired OTP"
}
```

**4. Forgot Password Request**
```
Endpoint: POST /api/auth/forgot-password
Query Params:
  - email: string (required)

Response (200):
{
  "success": true,
  "message": "OTP sent to registered email"
}

Response (404):
{
  "success": false,
  "error": "User not found"
}
```

**5. Reset Password**
```
Endpoint: POST /api/auth/reset-password
Query Params:
  - email: string (required)
  - otp_code: string (required)
  - new_password: string (required)

Response (200):
{
  "success": true,
  "message": "Password reset successfully"
}

Response (400):
{
  "success": false,
  "error": "Invalid OTP or password requirements not met"
}
```

**6. Get Current User Profile**
```
Endpoint: GET /api/auth/me
Headers:
  - Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "entrepreneur",
    "full_name": "John Doe",
    "is_verified": true,
    "is_active": true,
    "skills": ["Business Development", "Marketing"],
    "created_at": "2024-05-08T10:00:00Z"
  }
}

Response (401):
{
  "success": false,
  "error": "Unauthorized"
}
```

**7. Update User Skills**
```
Endpoint: POST /api/auth/profile/skills
Query Params:
  - skills: string[] (array of skill names)

Headers:
  - Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Skills updated successfully",
  "data": {
    "skills": ["Business Development", "Marketing", "Finance"]
  }
}
```

**8. Submit Questionnaire**
```
Endpoint: POST /api/auth/questionnaire
Query Params:
  - answers: JSON string (serialized array of {field, value})

Headers:
  - Authorization: Bearer {token}

Example Query:
?answers=[{"field":"industry","value":"SaaS"},{"field":"stage","value":"seed"}]

Response (200):
{
  "success": true,
  "message": "Questionnaire processed",
  "data": {
    "profile_enriched": true,
    "matches_found": 5
  }
}
```

**9. Register as Partner**
```
Endpoint: POST /api/auth/register-partner
Query Params:
  - company_name: string (required)
  - industry: string (required)
  - representative_name: string (required)

Headers:
  - Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": {
    "partner_id": "uuid",
    "status": "pending_approval"
  }
}
```

#### **System Endpoints**

**Health Check**
```
Endpoint: GET /api/health
Query Params: None
Headers: None

Response (200):
{
  "status": "healthy",
  "timestamp": "2024-05-08T10:00:00Z"
}
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 9+ or yarn
- Git
- A code editor (VS Code recommended)

### Environment Configuration

Create `.env.local` in the project root:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Backend Service URL (for API routes to call)
BACKEND_SERVICE_URL=https://api.bizify-backend.com

# Optional: Sentry for error tracking
NEXT_PUBLIC_SENTRY_DSN=

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
```

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/bizify-v2.git
cd bizify-v2

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:3000
```

### Build for Production

```bash
# Build optimized bundle
npm run build

# Start production server
npm start

# Or use a process manager (PM2)
pm2 start npm --name "bizify" -- start
```

---

## Development Workflow

### Code Organization & Best Practices

#### **Component Structure**
- Separate UI components (`/components/ui`) from feature components (`/features/auth/components`)
- Use TypeScript strict mode for type safety
- Props should be typed with interfaces
- Functional components with hooks

#### **State Management Strategy**
```
Client State (React Context):
  └─ Authentication status, user profile, UI preferences
  
Server State (React Query):
  └─ Business data, user listings, analytics
  
Form State (React Hook Form):
  └─ Form inputs, validation, submission handling
```

#### **API Integration Pattern**
```typescript
// 1. Define types
interface LoginRequest {
  email: string;
  password: string;
}

// 2. Create hook
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // Update auth context
    },
    onError: (error) => {
      // Handle error
    }
  });
};

// 3. Use in component
const { mutate: login, isLoading } = useLogin();
```

### Common Development Tasks

#### **Adding a New Protected Route**

1. Create page file: `src/app/new-dashboard/page.tsx`
2. Add to middleware protected routes
3. Create role guard component
4. Wire up authentication check

#### **Adding a New API Endpoint**

1. Create route file: `src/app/api/new/route.ts`
2. Define types for request/response
3. Add middleware for auth validation
4. Implement business logic
5. Add error handling

#### **Adding UI Components**

1. Check shadcn/ui library first
2. If not available, create in `src/components/ui`
3. Use Tailwind CSS for styling
4. Export from components index file
5. Document component props

---

## Deployment

### Deployment Platforms

#### **Vercel (Recommended for Next.js)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# With environment variables
vercel env add BACKEND_SERVICE_URL
vercel deploy --prod
```

#### **Docker Deployment**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./
COPY public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

#### **Traditional Server (Node + Nginx)**

```nginx
upstream bizify {
  server localhost:3000;
}

server {
  listen 80;
  server_name bizify.example.com;

  location / {
    proxy_pass http://bizify;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### Pre-Deployment Checklist

- [ ] Environment variables configured correctly
- [ ] Backend service API is accessible
- [ ] Database migrations completed
- [ ] SSL/HTTPS configured
- [ ] CORS settings match backend
- [ ] Rate limiting implemented
- [ ] Error tracking (Sentry) configured
- [ ] Monitoring and alerting set up
- [ ] Load testing completed
- [ ] Security audit performed

---

## Contributing

When contributing to Bizify, please:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Follow the existing code style
3. Add types for all new code
4. Test thoroughly before submitting PR
5. Update documentation as needed
6. Submit PR with clear description

---

## License

This project is proprietary software. All rights reserved.

---

## Support & Contact

For issues, questions, or support:
- Email: support@bizify.io
- Documentation: https://docs.bizify.io
- Issue Tracker: [GitHub Issues](link)

---

## Version History

**v2.0.0** - Initial Release (May 2024)
- Multi-role authentication system
- Landing page with marketing content
- Role-based dashboards
- AI mentorship framework
- OTP-based email verification
- Password recovery workflow
