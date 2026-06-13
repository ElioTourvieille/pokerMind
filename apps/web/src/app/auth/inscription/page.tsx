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

export default function InscriptionPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      const msg = 'Les mots de passe ne correspondent pas'
      setError(msg)
      toast.error(msg)
      return
    }
    setStatus('loading')
    setError(null)

    try {
      const res = await post<AuthResponse>('/auth/inscription', {
        email,
        password,
        pseudo: pseudo || undefined,
      })
      localStorage.setItem('token', res.accessToken)
      localStorage.setItem('refreshToken', res.refreshToken)
      toast.success('Compte créé avec succès !')
      router.push('/dashboard')
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'inscription"
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
          <h1 className="text-lg font-semibold mt-6">Créer un compte</h1>
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
            <label className="text-sm font-medium text-muted-foreground">
              Pseudo <span className="opacity-50">(optionnel)</span>
            </label>
            <input
              type="text"
              autoComplete="username"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              placeholder="HeroBluff42"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Mot de passe</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Confirmer</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full bg-card border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors ${
                confirm && confirm !== password ? 'border-red-500/50' : 'border-border'
              }`}
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
            {status === 'loading' ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <a href="/auth/connexion" className="text-primary hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  )
}
