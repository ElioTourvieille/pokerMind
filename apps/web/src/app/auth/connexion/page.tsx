'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { post } from '@/lib/api'

interface AuthResponse {
  accessToken: string
  refreshToken: string
  utilisateur: { id: string; email: string; pseudo: string | null }
}

type Status = 'idle' | 'loading' | 'error'

export default function ConnexionPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    try {
      const res = await post<AuthResponse>('/auth/connexion', { email, password })
      localStorage.setItem('token', res.accessToken)
      localStorage.setItem('refreshToken', res.refreshToken)
      toast.success('Connexion réussie !')
      router.push('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de connexion'
      setError(msg)
      toast.error(msg)
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <a href="/" className="text-2xl font-bold">
            Poker<span className="text-primary">Mind</span>
          </a>
          <h1 className="text-lg font-semibold mt-6">Connexion</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              placeholder="vous@exemple.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Mot de passe</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === 'loading' ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Pas encore de compte ?{' '}
          <a href="/auth/inscription" className="text-primary hover:underline">
            S'inscrire
          </a>
        </p>
      </div>
    </main>
  )
}
