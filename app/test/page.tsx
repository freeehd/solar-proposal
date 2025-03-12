'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function TestAuth() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Password123!')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      
      setResult(res)
      
      if (res?.error) {
        setError(res.error)
      }
    } catch (err) {
      setError(String(err))
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block mb-1">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          Test Login
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}