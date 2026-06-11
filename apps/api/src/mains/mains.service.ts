import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ParserService } from './parser.service'
import { UploadMainDto } from './dto/upload-main.dto'
import { ListerMainsDto } from './dto/lister-mains.dto'

@Injectable()
export class MainsService {
  constructor(
    private prisma: PrismaService,
    private parser: ParserService,
  ) {}

  async upload(utilisateurId: string, dto: UploadMainDto) {
    const parsees = await this.parser.parserLot(dto.texte, dto.site, dto.hero)

    const resultats = await Promise.all(
      parsees.map(async (p) => {
        const existante = await this.prisma.main.findFirst({
          where: { utilisateurId, idMainSite: p.id_main },
          select: { id: true },
        })
        if (existante) return { id: existante.id, doublon: true }

        const main = await this.prisma.main.create({
          data: {
            utilisateurId,
            texteOriginal: dto.texte,
            donneesParsees: p as object,
            site: p.site,
            idMainSite: p.id_main,
            joueeLE: new Date(p.jouee_le),
            stakes: `${p.stakes.petite_blinde}/${p.stakes.grande_blinde}`,
            typeJeu: p.type_jeu,
          },
          select: { id: true },
        })
        return { id: main.id, doublon: false }
      }),
    )

    return {
      importees: resultats.filter((r) => !r.doublon).length,
      doublons: resultats.filter((r) => r.doublon).length,
      mains: resultats,
    }
  }

  async lister(utilisateurId: string, dto: ListerMainsDto) {
    const page = dto.page ?? 1
    const limite = dto.limite ?? 20
    const skip = (page - 1) * limite

    const [total, mains] = await this.prisma.$transaction([
      this.prisma.main.count({ where: { utilisateurId } }),
      this.prisma.main.findMany({
        where: { utilisateurId },
        orderBy: { joueeLE: 'desc' },
        skip,
        take: limite,
        select: {
          id: true,
          site: true,
          stakes: true,
          typeJeu: true,
          joueeLE: true,
          creeLe: true,
          reviewIA: { select: { id: true } },
        },
      }),
    ])

    return { total, page, limite, mains }
  }

  async trouver(id: string, utilisateurId: string) {
    const main = await this.prisma.main.findFirst({
      where: { id, utilisateurId },
      include: { reviewIA: true },
    })
    if (!main) throw new NotFoundException('Main introuvable')
    return main
  }
}
