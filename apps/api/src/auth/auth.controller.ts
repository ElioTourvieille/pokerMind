import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { InscriptionDto } from './dto/inscription.dto'
import { ConnexionDto } from './dto/connexion.dto'
import { RefreshDto } from './dto/refresh.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('inscription')
  inscrire(@Body() dto: InscriptionDto) {
    return this.authService.inscrire(dto)
  }

  @Post('connexion')
  connecter(@Body() dto: ConnexionDto) {
    return this.authService.connecter(dto)
  }

  @Post('refresh')
  rafraichir(@Body() dto: RefreshDto) {
    return this.authService.rafraichir(dto.refreshToken)
  }

  @Post('deconnexion')
  deconnecter(@Body() dto: RefreshDto) {
    return this.authService.deconnecter(dto.refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Get('moi')
  moi(@Request() req: { user: { id: string; email: string; pseudo: string | null } }) {
    return req.user
  }
}
