import { Injectable, BadGatewayException } from '@nestjs/common'

export interface MainParsee {
  site: string
  id_main: string
  jouee_le: string
  stakes: { petite_blinde: number; grande_blinde: number }
  type_jeu: string
  nom_table: string
  joueurs: unknown[]
  hero: string
  rues: unknown[]
  board: string[]
  pot: { total: number; rake: number }
  gagnants: { joueur: string; montant: number }[]
  retours: Record<string, number>
}

@Injectable()
export class ParserService {
  private readonly url = process.env.PARSER_URL ?? 'http://localhost:8001'

  async parserLot(texte: string, site: string, hero?: string): Promise<MainParsee[]> {
    const res = await fetch(`${this.url}/lot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte, site, hero }),
    })

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { detail?: string }
      throw new BadGatewayException(err.detail ?? 'Erreur du service parser')
    }

    return res.json() as Promise<MainParsee[]>
  }
}
