import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class FiltreStatsDto {
  @IsOptional()
  @IsDateString()
  debut?: string

  @IsOptional()
  @IsDateString()
  fin?: string

  @IsOptional()
  @IsString()
  hero?: string
}

export class FiltreLeaksDto extends FiltreStatsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  max_fuites?: number = 3
}
