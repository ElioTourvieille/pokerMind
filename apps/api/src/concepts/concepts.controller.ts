import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { ConceptsService, DrillSubmission } from './concepts.service'

interface JwtUser {
  id: string
  email: string
  pseudo: string | null
}

@UseGuards(JwtAuthGuard)
@Controller('concepts')
export class ConceptsController {
  constructor(private conceptsService: ConceptsService) {}

  @Get()
  list(@Request() req: { user: JwtUser }, @Query('leak') leak?: string) {
    if (leak) return this.conceptsService.getConceptsByLeak(req.user.id, leak)
    return this.conceptsService.listConcepts(req.user.id)
  }

  @Get(':id')
  getOne(@Request() req: { user: JwtUser }, @Param('id') id: string) {
    return this.conceptsService.getConcept(req.user.id, id)
  }

  @Post(':id/drill')
  submitDrill(
    @Request() req: { user: JwtUser },
    @Param('id') id: string,
    @Body() dto: DrillSubmission,
  ) {
    return this.conceptsService.submitDrill(req.user.id, id, dto)
  }
}
