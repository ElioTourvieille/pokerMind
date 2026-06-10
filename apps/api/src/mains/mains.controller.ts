import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { MainsService } from './mains.service'
import { UploadMainDto } from './dto/upload-main.dto'

interface UtilisateurJwt {
  id: string
  email: string
  pseudo: string | null
}

@UseGuards(JwtAuthGuard)
@Controller('mains')
export class MainsController {
  constructor(private mainsService: MainsService) {}

  @Post()
  upload(@Request() req: { user: UtilisateurJwt }, @Body() dto: UploadMainDto) {
    return this.mainsService.upload(req.user.id, dto)
  }

  @Get()
  lister(@Request() req: { user: UtilisateurJwt }) {
    return this.mainsService.lister(req.user.id)
  }

  @Get(':id')
  trouver(@Request() req: { user: UtilisateurJwt }, @Param('id') id: string) {
    return this.mainsService.trouver(id, req.user.id)
  }
}
