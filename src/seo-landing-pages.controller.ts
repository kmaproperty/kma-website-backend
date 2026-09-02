@Get('end-user/seo-landing-pages/:slug')
async getSeoPage(@Param('slug') slug: string) {
  const page = await this.seoLandingPageRepo.findOne({
    where: { slug, is_active: true },
  });
  if (!page) {
    throw new NotFoundException('Page not found');
  }
  return page;
}