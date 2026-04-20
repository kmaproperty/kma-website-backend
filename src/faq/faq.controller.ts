import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FaqService } from './faq.service';

@ApiTags('FAQs')
@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @ApiOperation({
    summary: 'Get active FAQs grouped by category (Public)',
    description:
      'Returns all active FAQs grouped by category, sorted by sortOrder. Public endpoint — no auth required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active FAQs grouped by category',
  })
  async getActiveFaqs() {
    return this.faqService.getActiveFaqs();
  }
}
