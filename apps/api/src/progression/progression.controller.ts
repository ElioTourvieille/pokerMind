import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ProgressionService } from './progression.service'

interface JwtUser {
  id: string
  email: string
  pseudo: string | null
}

@UseGuards(JwtAuthGuard)
@Controller('progression')
export class ProgressionController {
  constructor(private progressionService: ProgressionService) {}

  @Get('profil')
  getProfile(@Request() req: { user: JwtUser }) {
    return this.progressionService.getProfile(req.user.id)
  }
}
