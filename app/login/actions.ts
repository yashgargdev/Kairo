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

    // 1. Attempt login first
    const { error: signInError } = await supabase.auth.signInWithPassword(data)

    if (signInError) {
        // 2. If login fails with invalid credentials, it might be a new user. Try signup.
        const isCredentialError = signInError.message.toLowerCase().includes('credential') || signInError.message.toLowerCase().includes('invalid');

        if (isCredentialError) {
            const { error: signUpError } = await supabase.auth.signUp(data)

            if (signUpError) {
                // If the user already exists, then the password was just wrong
                if (signUpError.message.toLowerCase().includes('already registered')) {
                    redirect('/login?error=Incorrect password for existing account.')
                } else {
                    redirect(`/login?error=${encodeURIComponent(signUpError.message)}`)
                }
            }
            // Success: new account created
        } else {
            redirect(`/login?error=${encodeURIComponent(signInError.message)}`)
        }
    }

    // Success: logged in
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
