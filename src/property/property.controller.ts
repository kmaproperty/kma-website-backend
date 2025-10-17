import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';

@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get('master/types')
  async getPropertyTypes() {
    return await this.propertyService.getPropertyTypes();
  }

  @Get('master/categories')
  async getPropertyCategories() {
    return await this.propertyService.getPropertyCategories();
  }

  @Get('master/types/:id')
  async getPropertyTypeById(@Param('id') id: string) {
    return await this.propertyService.getPropertyTypeById(id);
  }

  @Get('master/categories/:id')
  async getPropertyCategoryById(@Param('id') id: string) {
    return await this.propertyService.getPropertyCategoryById(id);
  }
}