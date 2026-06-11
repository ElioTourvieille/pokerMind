import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
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

    return { utilisateur, ...(await this.creerTokens(utilisateur.id, utilisateur.email)) }
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
      ...(await this.creerTokens(utilisateur.id, utilisateur.email)),
    }
  }

  async rafraichir(refreshToken: string) {
    const hash = this.hasherToken(refreshToken)
    const stocke = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
      include: { utilisateur: { select: { id: true, email: true, pseudo: true } } },
    })

    if (!stocke || stocke.expireLe < new Date()) {
      if (stocke) await this.prisma.refreshToken.delete({ where: { id: stocke.id } })
      throw new UnauthorizedException('Refresh token invalide ou expiré')
    }

    // Rotation : supprime l'ancien, en crée un nouveau
    await this.prisma.refreshToken.delete({ where: { id: stocke.id } })
    return {
      utilisateur: stocke.utilisateur,
      ...(await this.creerTokens(stocke.utilisateur.id, stocke.utilisateur.email)),
    }
  }

  async deconnecter(refreshToken: string) {
    const hash = this.hasherToken(refreshToken)
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash: hash } })
    return { message: 'Déconnecté' }
  }

  private async creerTokens(id: string, email: string) {
    const accessToken = this.jwt.sign({ sub: id, email })
    const refreshToken = crypto.randomUUID()
    const expireLe = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.prisma.refreshToken.create({
      data: { tokenHash: this.hasherToken(refreshToken), utilisateurId: id, expireLe },
    })

    return { accessToken, refreshToken }
  }

  private hasherToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }
}
