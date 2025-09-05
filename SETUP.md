# Notes App Setup Guide

This is a complete notes application built with Next.js, Supabase, and AI summarization features.

## Features

- ✅ **Authentication**: Sign up, login, logout with Supabase Auth
- ✅ **Notes Management**: Create, read, update, delete notes
- ✅ **Dashboard**: View all notes in a beautiful card layout
- ✅ **Single Note Editor**: Full-featured note editing with textarea
- ✅ **AI Summarization**: Generate AI summaries using OpenAI or Gemini
- ✅ **Responsive Design**: Mobile-friendly Tailwind CSS styling

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# OpenAI Configuration (for AI summarization)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Gemini Configuration (alternative to OpenAI)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. In the SQL Editor, run this query to create the notes table:

```sql
-- Create notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. AI API Setup (Optional)

#### OpenAI Setup:
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it to your `.env.local` file

#### Gemini Setup (Alternative):
1. Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env.local` file

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign Up**: Create a new account
2. **Login**: Sign in with your credentials
3. **Create Notes**: Click "Create New Note" on the dashboard
4. **Edit Notes**: Click "Edit" on any note card
5. **AI Summary**: Click "Summarize with AI" on any saved note
6. **Delete Notes**: Click "Delete" on any note card

## Project Structure

```
app/
├── api/
│   ├── notes/
│   │   ├── route.ts          # GET, POST notes
│   │   └── [id]/route.ts     # GET, PUT, DELETE single note
│   └── summarize/route.ts    # AI summarization endpoint
├── dashboard/page.tsx        # Main dashboard
├── login/page.tsx           # Login page
├── signup/page.tsx          # Signup page
├── note/[id]/page.tsx       # Note editor
└── layout.tsx               # Root layout with auth provider

lib/
├── auth.ts                  # Authentication utilities
├── db.ts                    # Database operations
├── supabase.ts              # Supabase client
└── ai.ts                    # AI summarization utilities

contexts/
└── AuthContext.tsx          # React context for auth state

components/
└── ProtectedRoute.tsx       # Route protection component
```

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-3.5-turbo or Google Gemini Pro

## Security Features

- Row Level Security (RLS) in Supabase
- User authentication required for all operations
- Protected routes with automatic redirects
- Input validation and error handling
