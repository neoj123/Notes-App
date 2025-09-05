'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Note } from '@/lib/db'

interface NotePageProps {
  params: Promise<{ id: string }>
}

export default function NotePage({ params }: NotePageProps) {
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const router = useRouter()

  const resolvedParams = use(params)
  const isNewNote = resolvedParams.id === 'new'

  useEffect(() => {
    if (!isNewNote) {
      fetchNote()
    } else {
      setLoading(false)
    }
  }, [resolvedParams.id, isNewNote])

  const fetchNote = async () => {
    try {
      const response = await fetch(`/api/notes/${resolvedParams.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Note not found')
        } else {
          throw new Error('Failed to fetch note')
        }
        return
      }
      const noteData = await response.json()
      setNote(noteData)
      setTitle(noteData.title)
      setContent(noteData.content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required')
      return
    }

    setSaving(true)
    setError('')

    try {
      const url = isNewNote ? '/api/notes' : `/api/notes/${resolvedParams.id}`
      const method = isNewNote ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isNewNote ? 'create' : 'update'} note`)
      }

      const savedNote = await response.json()
      if (isNewNote) {
        router.push(`/note/${savedNote.id}`)
      } else {
        setNote(savedNote)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleSummarize = async () => {
    if (!content.trim()) {
      setError('Please add some content to summarize')
      return
    }

    setSummarizing(true)
    setError('')

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          noteId: isNewNote ? 'temp' : resolvedParams.id,
          provider: 'openai' // You can make this configurable
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      setSummary(data.summary)
      setShowSummary(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSummarizing(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 mr-4">
                  ← Back to Dashboard
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isNewNote ? 'Create New Note' : 'Edit Note'}
                </h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="mb-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter note title..."
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    id="content"
                    rows={15}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter note content..."
                  />
                </div>

                {!isNewNote && content.trim() && (
                  <div className="mb-6">
                    <button
                      onClick={handleSummarize}
                      disabled={summarizing}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {summarizing ? 'Generating Summary...' : 'Summarize with AI'}
                    </button>
                  </div>
                )}

                {showSummary && summary && (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
                    <h3 className="text-sm font-medium text-purple-800 mb-2">AI Summary:</h3>
                    <p className="text-purple-700 text-sm">{summary}</p>
                    <button
                      onClick={() => setShowSummary(false)}
                      className="mt-2 text-xs text-purple-600 hover:text-purple-500"
                    >
                      Hide Summary
                    </button>
                  </div>
                )}

                <div className="flex justify-between">
                  <Link
                    href="/dashboard"
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </Link>
                  <button
                    onClick={handleSave}
                    disabled={saving || !title.trim() || !content.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : isNewNote ? 'Create Note' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
