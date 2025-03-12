'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign in'}
    </Button>
  )
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, undefined)
  const router = useRouter()
  
  // Redirect on successful login
  useEffect(() => {
    if (state?.success) {
      console.log('Login successful, redirecting to dashboard');
      router.push('/');
      // Force a refresh to ensure the session is loaded
      router.refresh();
    }
  }, [state, router])

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <Label htmlFor="email">Email</Label>
        <div className="mt-2">
          <Input 
            id="email" 
            name="email" 
            type="email" 
            autoComplete="email" 
            required 
            placeholder="admin@example.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="mt-2">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
        </div>
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state?.success && (
        <Alert>
          <AlertDescription>Login successful! Redirecting...</AlertDescription>
        </Alert>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}