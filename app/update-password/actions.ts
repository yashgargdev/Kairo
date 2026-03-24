'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
    const password = formData.get('password')?.toString()
    const supabase = await createClient()

    if (!password) {
        return redirect('/update-password?error=Password is required')
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    })

    if (error) {
        return redirect(`/update-password?error=${encodeURIComponent(error.message)}`)
    }

    return redirect('/chat')
}
