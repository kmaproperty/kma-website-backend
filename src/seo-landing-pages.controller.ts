import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('end-user/seo-landing-pages')
export class SeoLandingPagesController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get(':slug')
  async getSeoPage(@Param('slug') slug: string) {
    const query = `
      SELECT * 
      FROM seo_landing_pages 
      WHERE slug = $1 AND is_active = true 
      LIMIT 1
    `;

    const results = await this.dataSource.query(query, [slug]);

    if (!results || results.length === 0) {
      throw new NotFoundException('Page not found');
    }

    return results[0];
  }
}