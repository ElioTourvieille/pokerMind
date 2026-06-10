import { Module } from '@nestjs/common'
import { MainsController } from './mains.controller'
import { MainsService } from './mains.service'

@Module({
  controllers: [MainsController],
  providers: [MainsService],
})
export class MainsModule {}
