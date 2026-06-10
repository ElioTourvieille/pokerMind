import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UploadMainDto } from './dto/upload-main.dto'

@Injectable()
export class MainsService {
  constructor(private prisma: PrismaService) {}

  async upload(utilisateurId: string, dto: UploadMainDto) {
    // TODO Phase 1 : appeler le service Python parser
    // const parsee = await this.parserService.parser(dto.texte, dto.site)
    const parsee = { brouillon: true, message: 'Parser en cours de développement' }

    const main = await this.prisma.main.create({
      data: {
        utilisateurId,
        texteOriginal: dto.texte,
        donneesParsees: parsee,
        site: dto.site,
        idMainSite: `tmp-${Date.now()}`,
        joueeLE: new Date(),
        stakes: 'inconnu',
        typeJeu: 'cash',
      },
    })

    return main
  }

  async lister(utilisateurId: string) {
    return this.prisma.main.findMany({
      where: { utilisateurId },
      orderBy: { joueeLE: 'desc' },
      select: {
        id: true,
        site: true,
        stakes: true,
        typeJeu: true,
        joueeLE: true,
        creeLe: true,
        reviewIA: { select: { id: true } },
      },
    })
  }

  async trouver(id: string, utilisateurId: string) {
    const main = await this.prisma.main.findFirst({
      where: { id, utilisateurId },
      include: { reviewIA: true },
    })
    if (!main) throw new BadRequestException('Main introuvable')
    return main
  }
}
