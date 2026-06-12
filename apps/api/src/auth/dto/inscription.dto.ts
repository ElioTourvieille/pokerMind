import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class InscriptionDto {
  @IsEmail({}, { message: "L'email est invalide" })
  email!: string

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères' })
  motDePasse!: string

  @IsString()
  @IsOptional()
  pseudo?: string
}
