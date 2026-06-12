import { Module } from '@nestjs/common'
import { ProgressionController } from './progression.controller'
import { ProgressionService } from './progression.service'
import { StatsModule } from '../stats/stats.module'

@Module({
  imports: [StatsModule],
  controllers: [ProgressionController],
  providers: [ProgressionService],
})
export class ProgressionModule {}
