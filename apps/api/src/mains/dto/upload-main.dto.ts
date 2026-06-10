import { IsEnum, IsOptional, IsString } from 'class-validator'

export enum SitePoker {
  POKERSTARS = 'pokerstars',
  GGPOKER = 'ggpoker',
}

export class UploadMainDto {
  @IsString({ message: 'Le texte de la main est requis' })
  texte: string

  @IsEnum(SitePoker, { message: 'Site invalide : pokerstars ou ggpoker' })
  site: SitePoker

  @IsString()
  @IsOptional()
  pseudo?: string
}
