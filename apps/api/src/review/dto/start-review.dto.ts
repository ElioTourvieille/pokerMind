import { IsString, IsNotEmpty } from 'class-validator'

export class StartReviewDto {
  @IsString()
  @IsNotEmpty()
  mainId!: string
}
