'use server'

import { signIn } from '@/auth'

export async function login(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Use redirect: false to handle redirection manually in the client component
    const result = await signIn('credentials', { 
      email, 
      password,
      redirect: false
    })
    
    // Check if there was an error during sign in
    if (result?.error) {
      return { error: 'Invalid email or password' }
    }
    
    // If we get here, login was successful
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    
    // Check if the error is a CredentialsSignin error
    if ((error as Error).message.includes('CredentialsSignin')) {
      return { error: 'Invalid email or password' }
    }
    
    return { error: 'Something went wrong. Please try again.' }
  }
}