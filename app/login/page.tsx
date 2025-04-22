import { LoginForm } from './login-form'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  // Check if user is already authenticated
  const session = await auth()
  
  // If already authenticated, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white-900">
Is this really Mathew????
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className=" pearlescent-card  px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}