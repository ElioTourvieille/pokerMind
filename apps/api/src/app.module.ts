import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { AuthModule } from './auth/auth.module'
import { MainsModule } from './mains/mains.module'
import { StatsModule } from './stats/stats.module'
import { ReviewModule } from './review/review.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    MainsModule,
    StatsModule,
    ReviewModule,
  ],
})
export class AppModule {}
