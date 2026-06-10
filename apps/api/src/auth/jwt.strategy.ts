import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from '../prisma/prisma.service'

interface JwtPayload {
  sub: string
  email: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me',
    })
  }

  async validate(payload: JwtPayload) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, pseudo: true },
    })
    if (!utilisateur) throw new UnauthorizedException()
    return utilisateur
  }
}
