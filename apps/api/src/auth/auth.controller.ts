import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { InscriptionDto } from './dto/inscription.dto'
import { ConnexionDto } from './dto/connexion.dto'
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

  @UseGuards(JwtAuthGuard)
  @Get('moi')
  moi(@Request() req: { user: { id: string; email: string; pseudo: string | null } }) {
    return req.user
  }
}
