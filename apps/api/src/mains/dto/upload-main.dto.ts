import { IsEnum, IsOptional, IsString } from 'class-validator'

export enum SitePoker {
  POKERSTARS = 'pokerstars',
  GGPOKER = 'ggpoker',
  WINAMAX = 'winamax',
}

export class UploadMainDto {
  @IsString({ message: 'Le texte du fichier est requis' })
  texte!: string

  @IsEnum(SitePoker, { message: 'Site invalide : pokerstars, ggpoker ou winamax' })
  site!: SitePoker

  @IsString()
  @IsOptional()
  hero?: string
}
