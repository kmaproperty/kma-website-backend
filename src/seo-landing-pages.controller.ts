// import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
// import { InjectDataSource } from '@nestjs/typeorm';
// import { DataSource } from 'typeorm';

// @Controller('end-user/seo-landing-pages')
// export class SeoLandingPagesController {
//   constructor(
//     @InjectDataSource()
//     private readonly dataSource: DataSource,
//   ) {}

//   @Get(':slug')
//   async getSeoPage(@Param('slug') slug: string) {
//     const query = `
//       SELECT * 
//       FROM seo_landing_pages 
//       WHERE slug = $1 AND is_active = true 
//       LIMIT 1
//     `;

//     const results = await this.dataSource.query(query, [slug]);

//     if (!results || results.length === 0) {
//       throw new NotFoundException('Page not found');
//     }

//     return results[0];
//   }
// }

import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('end-user/seo-landing-pages')
export class SeoLandingPagesController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // URL: GET /end-user/seo-landing-pages
  @Get()
  async getAllSeoPages() {
    const query = `
      SELECT slug, h1_heading, meta_description, city_name 
      FROM seo_landing_pages 
      WHERE is_active = true 
      ORDER BY created_at DESC
    `;
    return await this.dataSource.query(query);
  }

  // URL: GET /end-user/seo-landing-pages/related/:slug
  @Get('related/:slug')
  async getRelatedSeoPages(@Param('slug') slug: string) {
    const query = `
      SELECT slug, h1_heading, meta_description, city_name 
      FROM seo_landing_pages 
      WHERE slug != $1 AND is_active = true 
      ORDER BY created_at DESC 
      LIMIT 6
    `;
    return await this.dataSource.query(query, [slug]);
  }

  // URL: GET /end-user/seo-landing-pages/:slug
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