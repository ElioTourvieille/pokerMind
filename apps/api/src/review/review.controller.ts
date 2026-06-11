import { Body, Controller, Post, Request, Res, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ReviewService } from './review.service'
import { StartReviewDto } from './dto/start-review.dto'
import { AnswerReviewDto } from './dto/answer-review.dto'

interface JwtUser {
  id: string
  email: string
  pseudo: string | null
}

@UseGuards(JwtAuthGuard)
@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post('start')
  start(@Request() req: { user: JwtUser }, @Body() dto: StartReviewDto) {
    return this.reviewService.startReview(req.user.id, dto)
  }

  @Post('answer')
  async answer(
    @Request() req: { user: JwtUser },
    @Body() dto: AnswerReviewDto,
    @Res() reply: any,
  ) {
    // Validate before hijacking so NestJS exception filters can still handle errors
    const { hand, questions } = await this.reviewService.validateForAnswer(req.user.id, dto.mainId)

    reply.hijack()
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    await this.reviewService.streamAnswer(hand, questions, dto, reply.raw)
  }
}
