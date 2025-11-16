import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsOptional } from 'class-validator';

export class StartDocusignDto {
  @ApiProperty({ description: 'Return URL after signing completes', example: 'https://app.example.com/cp/onboarding/complete' })
  @IsString()
  @IsUrl()
  returnUrl: string;

  @ApiProperty({ description: 'Channel partner full name (fallback to user.name if omitted)', required: false, example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Channel partner email (fallback to user.email if omitted)', required: false, example: 'john@example.com' })
  @IsOptional()
  @IsString()
  email?: string;
}

export class StartDocusignResponseDto {
  @ApiProperty({ description: 'Embedded signing URL for DocuSign', example: 'https://demo.docusign.net/Member/StartInSession.aspx?....' })
  url: string;

  @ApiProperty({ description: 'DocuSign envelope ID', example: 'b4fdc1b6-3f46-4f5f-8f3a-0a9b2b1a2e5d' })
  envelopeId: string;
}


