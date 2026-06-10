import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { InscriptionDto } from './dto/inscription.dto'
import { ConnexionDto } from './dto/connexion.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async inscrire(dto: InscriptionDto) {
    const existant = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    })
    if (existant) throw new ConflictException('Cet email est déjà utilisé')

    const hash = await bcrypt.hash(dto.motDePasse, 12)
    const utilisateur = await this.prisma.utilisateur.create({
      data: { email: dto.email, motDePasse: hash, pseudo: dto.pseudo },
      select: { id: true, email: true, pseudo: true },
    })

    return { utilisateur, token: this.signerToken(utilisateur.id, utilisateur.email) }
  }

  async connecter(dto: ConnexionDto) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    })
    if (!utilisateur) throw new UnauthorizedException('Identifiants incorrects')

    const valide = await bcrypt.compare(dto.motDePasse, utilisateur.motDePasse)
    if (!valide) throw new UnauthorizedException('Identifiants incorrects')

    return {
      utilisateur: { id: utilisateur.id, email: utilisateur.email, pseudo: utilisateur.pseudo },
      token: this.signerToken(utilisateur.id, utilisateur.email),
    }
  }

  private signerToken(id: string, email: string) {
    return this.jwt.sign({ sub: id, email })
  }
}
