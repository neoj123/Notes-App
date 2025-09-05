import { supabase } from './supabase'

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface CreateNoteData {
  title: string
  content: string
}

export interface UpdateNoteData {
  title?: string
  content?: string
}

export async function createNote(userId: string, data: CreateNoteData): Promise<Note> {
  const { data: note, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      title: data.title,
      content: data.content,
    })
    .select()
    .single()

  if (error) throw error
  return note
}

export async function getNotes(userId: string): Promise<Note[]> {
  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return notes || []
}

export async function getNote(noteId: string, userId: string): Promise<Note | null> {
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows returned
    throw error
  }
  return note
}

export async function updateNote(noteId: string, userId: string, data: UpdateNoteData): Promise<Note> {
  const { data: note, error } = await supabase
    .from('notes')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return note
}

export async function deleteNote(noteId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId)

  if (error) throw error
}
