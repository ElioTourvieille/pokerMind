import { Module } from '@nestjs/common'
import { MainsController } from './mains.controller'
import { MainsService } from './mains.service'
import { ParserService } from './parser.service'

@Module({
  controllers: [MainsController],
  providers: [MainsService, ParserService],
})
export class MainsModule {}
