import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { StatsService } from './stats.service'
import { FiltreStatsDto, FiltreLeaksDto } from './dto/filtre-stats.dto'

interface UtilisateurJwt {
  id: string
  email: string
  pseudo: string | null
}

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get('summary')
  summary(@Request() req: { user: UtilisateurJwt }, @Query() dto: FiltreStatsDto) {
    return this.statsService.obtenirSummary(req.user.id, dto)
  }

  @Get('leaks')
  leaks(@Request() req: { user: UtilisateurJwt }, @Query() dto: FiltreLeaksDto) {
    return this.statsService.obtenirFuites(req.user.id, dto)
  }
}
