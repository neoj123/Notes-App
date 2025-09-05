import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getNote } from '@/lib/db'
import { summarizeWithOpenAI, summarizeWithGemini } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { noteId, provider = 'openai' } = body

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    // Get the note to ensure user has access
    const note = await getNote(noteId, user.id)
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Generate summary based on provider
    let summary: string
    try {
      if (provider === 'gemini') {
        summary = await summarizeWithGemini(note.content)
      } else {
        summary = await summarizeWithOpenAI(note.content)
      }
    } catch (error) {
      console.error('AI summarization error:', error)
      return NextResponse.json(
        { error: 'Failed to generate summary. Please check your API key configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error in summarize API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
