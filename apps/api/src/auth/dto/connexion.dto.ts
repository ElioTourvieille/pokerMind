import { IsEmail, IsString, MinLength } from 'class-validator'

export class ConnexionDto {
  @IsEmail({}, { message: "L'email est invalide" })
  email: string

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit faire au moins 8 caractères' })
  motDePasse: string
}
