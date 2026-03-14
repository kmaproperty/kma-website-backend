import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactUsService } from './contact-us.service';
import { ApiResponseDto, ApiResponse as ApiResponseType } from '../common/dto';
import {
  CreateContactUsDto,
  CreateContactUsResponseDto,
  CreateJoinUsDto,
  CreateJoinUsResponseDto,
  CreateSalesEnquiryDto,
  CreateSalesEnquiryResponseDto,
} from './dto';

@ApiTags('Contact Us')
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit contact form' })
  @ApiResponse({
    status: 201,
    description: 'Contact form submitted successfully',
    type: CreateContactUsResponseDto,
  })
  async createContactForm(
    @Body() createContactUsDto: CreateContactUsDto,
  ): Promise<CreateContactUsResponseDto> {
    return await this.contactUsService.createContactForm(createContactUsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contact forms with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Contact forms retrieved successfully',
  })
  async getAllContacts(
    @Query('skip') skip: string = '0',
    @Query('take') take: string = '10',
  ): Promise<ApiResponseType<any>> {
    const skipNum = parseInt(skip, 10) || 0;
    const takeNum = parseInt(take, 10) || 10;

    const result = await this.contactUsService.getAllContacts(skipNum, takeNum);
    return ApiResponseDto.success(
      result,
      'Contact forms retrieved successfully',
    );
  }

  @Post('join-us')
  @ApiOperation({ summary: 'Submit Join Us / Channel Partner application' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    type: CreateJoinUsResponseDto,
  })
  async createJoinUsEnquiry(
    @Body() dto: CreateJoinUsDto,
  ): Promise<CreateJoinUsResponseDto> {
    return await this.contactUsService.createJoinUsEnquiry(dto);
  }

  @Post('sales-enquiry')
  @ApiOperation({ summary: 'Submit Sales Enquiry / Request Callback' })
  @ApiResponse({
    status: 201,
    description: 'Sales enquiry submitted successfully',
    type: CreateSalesEnquiryResponseDto,
  })
  async createSalesEnquiry(
    @Body() dto: CreateSalesEnquiryDto,
  ): Promise<CreateSalesEnquiryResponseDto> {
    return await this.contactUsService.createSalesEnquiry(dto);
  }
}
