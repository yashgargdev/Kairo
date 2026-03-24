'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function resetPassword(formData: FormData) {
    const email = formData.get('email')?.toString()
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    if (!email) {
        return redirect('/forgot-password?error=Email is required')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/update-password`,
    })

    if (error) {
        return redirect('/forgot-password?error=Could not authenticate user')
    }

    return redirect('/forgot-password?message=Check your email for a password reset link')
}
