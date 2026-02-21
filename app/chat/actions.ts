'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, unstable_noStore as noStore } from 'next/cache'

export async function getChats() {
    noStore(); // Prevent Next.js from caching the database fetch laterally
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching chats:', error)
        return []
    }

    return data
}

export async function getChatMessages(chatId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching messages:', error)
        return []
    }

    return data
}

export async function deleteChat(chatId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/chat', 'layout')
    return { success: true }
}

export async function toggleChatShare(chatId: string, isShared: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('chats')
        .update({ is_shared: isShared })
        .eq('id', chatId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/chat/${chatId}`)
    return { success: true }
}
