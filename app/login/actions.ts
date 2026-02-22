'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function continueWithEmail(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    // Step 1: Try signing in
    const { error: signInError } = await supabase.auth.signInWithPassword(data)

    if (!signInError) {
        // ✅ Existing user, correct password — logged in
        revalidatePath('/', 'layout')
        redirect('/chat')
    }

    // Step 2: Sign-in failed. Only proceed to sign-up check for credential errors.
    const isCredentialError =
        signInError.message.toLowerCase().includes('invalid') ||
        signInError.message.toLowerCase().includes('credential')

    if (!isCredentialError) {
        // Other error (e.g. email not confirmed, rate limit) — show as-is
        redirect(`/login?error=${encodeURIComponent(signInError.message)}`)
    }

    // Step 3: Attempt sign-up to determine if the email is new or existing.
    // Supabase returns `identities: []` for an already-registered email (security-safe behaviour).
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(data)

    if (signUpError) {
        redirect(`/login?error=${encodeURIComponent(signUpError.message)}`)
    }

    // Step 4: identities[] is empty → email already registered → wrong password
    if (signUpData.user?.identities?.length === 0) {
        redirect('/login?error=Incorrect password. Please try again.')
    }

    // Step 5: New user created. If session is null, email confirmation is required.
    if (!signUpData.session) {
        redirect('/login?error=Account created! Please check your email to confirm your account before logging in.')
    }

    // ✅ New account created + auto-confirmed (confirmation disabled in Supabase)
    revalidatePath('/', 'layout')
    redirect('/chat')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string

    const { error } = await supabase.auth.updateUser({
        data: {
            full_name: name,
            phone: phone
        }
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function updatePersonalization(formData: FormData) {
    const supabase = await createClient()

    const aboutYou = formData.get('aboutYou') as string
    const customInstructions = formData.get('customInstructions') as string

    const { error } = await supabase.auth.updateUser({
        data: {
            about_you: aboutYou,
            custom_instructions: customInstructions
        }
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function changePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

/** Enroll a new TOTP factor. Returns the QR code URI and factor ID. */
export async function enrollMFA() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Kairo Authenticator',
    })

    if (error) return { error: error.message }

    return {
        success: true,
        factorId: data.id,
        qrCodeUrl: data.totp.qr_code,   // SVG data URI
        secret: data.totp.secret,        // manual entry fallback
    }
}

/** Verify TOTP code to complete enrollment. */
export async function verifyMFA(factorId: string, code: string) {
    const supabase = await createClient()

    // Create a challenge first
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeError) return { error: challengeError.message }

    // Verify the challenge with the user's OTP
    const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
    })

    if (verifyError) return { error: verifyError.message }

    revalidatePath('/', 'layout')
    return { success: true }
}

/** Unenroll (disable) an existing TOTP factor. */
export async function unenrollMFA(factorId: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) return { error: error.message }

    revalidatePath('/', 'layout')
    return { success: true }
}

/** Get list of enrolled MFA factors for the current user. */
export async function getMFAFactors() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) return { error: error.message }

    const totpFactors = data.totp.filter(f => f.status === 'verified')
    return { success: true, factors: totpFactors }
}
