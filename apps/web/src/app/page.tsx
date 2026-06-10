export default function Accueil() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Poker<span className="text-primary">Mind</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Ton coach poker intelligent. Pas un solver — un partenaire de progression.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <a
            href="/auth/inscription"
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Commencer
          </a>
          <a
            href="/auth/connexion"
            className="px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
          >
            Se connecter
          </a>
        </div>
      </div>
    </main>
  )
}
