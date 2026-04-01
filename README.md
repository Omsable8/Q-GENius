# Q-GENius - AI-Powered MCQ Generator

A modern, user-friendly application for generating intelligent multiple-choice questions with AI-driven distractors to identify learner deficiencies.

## 🎯 Project Overview

Q-GENius is built on research demonstrating how three types of distractors reveal unique learner misconceptions:
- **Fact-Based**: Tests fundamental knowledge gaps
- **Process-Based**: Tests misunderstanding of methods/concepts
- **Accuracy-Based**: Tests precision and computational errors

## 🏗️ Application Architecture

### Frontend Pages

1. **Landing Page** (`/`)
   - Project overview and features
   - Interactive animations and scroll effects
   - Research team section
   - Call-to-action for signup

2. **Authentication** (`/signup`, `/login`)
   - Email-based registration and login
   - Form validation
   - Connected to Supabase

3. **Dashboard** (`/dashboard`)
   - Welcome overview
   - Quick action cards
   - Statistics display
   - Recent activity

4. **Generate Options** (`/generate-options`)
   - Single question input
   - Question type selection
   - Real-time distractor generation
   - Rating system for options
   - Download functionality
   - Rate limit handling

5. **Generate Questions** (`/generate-questions`)
   - Chat-like interface
   - Multi-step form (subject, topic, difficulty, grade)
   - Bulk question generation
   - Download results

### API Routes

- `POST /api/login` - Handle user login
- `POST /api/signup` - Handle user registration
- `POST /api/generate-options` - Generate distractors for a question
- `POST /api/generate-questions` - Generate bulk questions

## 🎨 Design System

**Color Palette:**
- Primary: `#8CA9FF` (Vibrant Blue)
- Secondary: `#AAC4F5` (Soft Blue)
- Accent/Muted: `#FFF2C6` (Warm Cream)
- Light Accent: `#FFF8DE` (Light Cream)

**Features:**
- Smooth animations and transitions
- Responsive design (mobile-first)
- Interactive hover effects
- Clean, modern aesthetic

## 🚀 Getting Started

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

You'll need to set up the following environment variables in your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Flask API
NEXT_PUBLIC_API_URL=http://localhost:5000

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=3600
```

## 📋 Backend Implementation Guide

The frontend is ready with API routes. Here's what your backend should implement:

### 1. Authentication Endpoints

**POST /api/signup**
- Input: `{ username, email, password }`
- Output: `{ success, user: { email }, message }`
- Uses: Supabase Auth

**POST /api/login**
- Input: `{ email, password }`
- Output: `{ success, user: { email }, token, message }`
- Uses: Supabase Auth

### 2. MCQ Generation Endpoints

**POST /api/generate-options**
- Input: `{ question, questionType, additionalPrompt }`
- Output: 
  ```json
  {
    "question": "...",
    "correctAnswer": "...",
    "options": [
      {
        "type": "fact|process|accuracy",
        "text": "...",
        "explanation": "..."
      }
    ]
  }
  ```
- Rate Limiting: Check quota and return 429 if exceeded

**POST /api/generate-questions**
- Input: `{ subject, topic, difficulty, grade, numQuestions, additionalPrompt }`
- Output: 
  ```json
  {
    "success": true,
    "questions": ["Q1", "Q2", ...],
    "parameters": { subject, topic, difficulty, grade }
  }
  ```
- Rate Limiting: Check quota and return 429 if exceeded

## 🔧 Technology Stack

- **Frontend Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4 with custom design tokens
- **UI Components**: shadcn/ui with custom components
- **Authentication**: Supabase (configure separately)
- **Data Fetching**: Fetch API with error handling
- **Toast Notifications**: Sonner
- **Icons**: Lucide React

## 📁 Project Structure

```
app/
├── layout.tsx              # Root layout
├── globals.css             # Global styles and animations
├── page.tsx                # Landing page
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/page.tsx      # Dashboard
├── generate-options/       # MCQ options page
├── generate-questions/     # MCQ questions page
└── api/
    ├── login/route.ts
    ├── signup/route.ts
    ├── generate-options/route.ts
    └── generate-questions/route.ts
components/
├── ui/                     # shadcn/ui components
└── [custom components]
```

## 🎯 Key Features Implemented

### ✅ Landing Page
- Animated hero section with floating elements
- Interactive feature cards
- Step-by-step process explanation
- Author/research team section
- Smooth scroll animations
- Responsive design

### ✅ Authentication
- Clean signup/login forms
- Form validation
- API integration ready
- Supabase integration guide

### ✅ MCQ Generation Pages
- Real-time distractor generation with rating system
- Chat-like interface for bulk question generation
- Multi-step form with progress tracking
- Download functionality
- Rate limit error handling with dialog
- Responsive layouts

### ✅ Dashboard
- User statistics
- Quick action buttons
- Recent activity display
- Help resources section

## 🔐 Security Considerations

1. All authentication should use Supabase's secure methods
2. Implement password hashing with bcrypt (Supabase handles this)
3. Use HTTP-only cookies for session management
4. Validate all inputs on backend
5. Implement CORS properly for API calls
6. Add rate limiting to prevent abuse

## 📊 Rate Limiting Strategy

- Implement per-user rate limits on generation endpoints
- Return 429 status code when limit exceeded
- Frontend shows user-friendly error dialog
- Consider implementing tiered pricing for higher limits

## 🧪 Testing Recommendations

1. Test all form validations
2. Test API error handling
3. Test rate limiting scenarios
4. Test responsive design on mobile/tablet
5. Test accessibility with screen readers
6. Test animations on slower devices

## 📝 Next Steps for Backend

1. Set up Supabase project and tables
2. Implement authentication endpoints
3. Create MCQ generation service using GPT-4o-mini/o3-mini
4. Implement rate limiting middleware
5. Set up proper error handling
6. Add logging for debugging
7. Deploy and connect frontend

## 🤝 Contributing

The frontend is fully functional and ready for backend integration. Connect your Flask/backend service and update the API routes to call your actual generation models.

## 📄 License

[Your License Here]

## 🔗 Related Research

This implementation is based on the Q-GENius research paper on intelligent MCQ generation with diagnostic distractors.
