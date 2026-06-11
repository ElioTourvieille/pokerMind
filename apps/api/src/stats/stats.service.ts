import { Injectable, BadGatewayException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { FiltreStatsDto, FiltreLeaksDto } from './dto/filtre-stats.dto'

const TTL_STATS = 3600 // 1h

interface ResultatStats {
  mains_analysees: number
  stats: {
    mains: number
    vpip_pct: number
    pfr_pct: number
    wwsf_pct: number
    fold_3bet_pct: number
    cbet_pct: number
    fold_cbet_pct: number
    ev_par_position: Record<string, number>
    bb_par_100: number
  }
  fuites: unknown[]
}

@Injectable()
export class StatsService {
  private readonly parserUrl = process.env.PARSER_URL ?? 'http://localhost:8001'

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async obtenirSummary(utilisateurId: string, dto: FiltreStatsDto) {
    const result = await this.calculer(utilisateurId, dto)
    return { mains_analysees: result.mains_analysees, stats: result.stats }
  }

  async obtenirFuites(utilisateurId: string, dto: FiltreLeaksDto) {
    const result = await this.calculer(utilisateurId, dto)
    const max = dto.max_fuites ?? 3
    return { fuites: (result.fuites as unknown[]).slice(0, max) }
  }

  private async calculer(utilisateurId: string, dto: FiltreStatsDto): Promise<ResultatStats> {
    const cacheKey = `stats:${utilisateurId}:${dto.debut ?? 'all'}:${dto.fin ?? 'all'}:${dto.hero ?? 'auto'}`

    const cached = await this.redis.get<ResultatStats>(cacheKey)
    if (cached) return cached

    const mains = await this.prisma.main.findMany({
      where: {
        utilisateurId,
        ...(dto.debut || dto.fin
          ? {
              joueeLE: {
                ...(dto.debut ? { gte: new Date(dto.debut) } : {}),
                ...(dto.fin ? { lte: new Date(dto.fin) } : {}),
              },
            }
          : {}),
      },
      select: { donneesParsees: true },
    })

    if (!mains.length) throw new NotFoundException('Aucune main pour cette période')

    const res = await fetch(`${this.parserUrl}/stats/parsees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mains: mains.map((m) => m.donneesParsees),
        hero: dto.hero,
        max_fuites: 6,
      }),
    })

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { detail?: string }
      throw new BadGatewayException(err.detail ?? 'Erreur du service parser')
    }

    const data = (await res.json()) as ResultatStats
    await this.redis.set(cacheKey, data, TTL_STATS)
    return data
  }
}
