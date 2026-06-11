import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty } from 'class-validator'

export class AnswerReviewDto {
  @IsString()
  @IsNotEmpty()
  mainId!: string

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answers!: string[]
}
