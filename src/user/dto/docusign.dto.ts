import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsBase64 } from 'class-validator';
import { AgreementStatus } from '../entities/channel-partner-agreement.entity';

export class CreateEnvelopeDto {
  @ApiProperty({
    description: 'Recipient email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  recipientEmail: string;

  @ApiProperty({
    description: 'Recipient name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @ApiProperty({
    description: 'Document content in base64 format',
    example: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
  })
  @IsBase64()
  @IsNotEmpty()
  documentBase64: string;

  @ApiProperty({
    description: 'Document name',
    example: 'Channel Partner Agreement.pdf',
  })
  @IsString()
  @IsNotEmpty()
  documentName: string;

  @ApiProperty({
    description: 'Return URL after signing',
    example: 'https://example.com/signature-complete',
    required: false,
  })
  @IsString()
  @IsOptional()
  returnUrl?: string;
}

export class CreateFixedAgreementEnvelopeDto {
  @ApiProperty({
    description: 'Return URL after signing',
    example: 'https://example.com/signature-complete',
    required: false,
  })
  @IsString()
  @IsOptional()
  returnUrl?: string;
}

export class CreateEnvelopeResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Envelope created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Envelope ID from DocuSign',
    example: 'abc123-def456-ghi789',
  })
  envelopeId: string;

  @ApiProperty({
    description: 'URL for signing the document',
    example: 'https://demo.docusign.net/Signing/startinsession.aspx?t=...',
  })
  url: string;
}

export class AgreementResponseDto {
  @ApiProperty({
    description: 'Agreement ID',
    example: 'uuid-v4',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'uuid-v4',
  })
  userId: string;

  @ApiProperty({
    description: 'DocuSign envelope ID',
    example: 'abc123-def456-ghi789',
  })
  envelopeId: string;

  @ApiProperty({
    description: 'Agreement status',
    enum: AgreementStatus,
    example: AgreementStatus.SENT,
  })
  status: AgreementStatus;

  @ApiProperty({
    description: 'Completion date',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  completedAt: Date | null;

  @ApiProperty({
    description: 'Return URL',
    example: 'https://example.com/signature-complete',
    required: false,
  })
  returnUrl: string | null;

  @ApiProperty({
    description: 'Created date',
    example: '2024-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated date',
    example: '2024-01-01T00:00:00Z',
  })
  updatedAt: Date;
}

export class GetAgreementResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Agreement retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Agreement data',
    type: AgreementResponseDto,
  })
  data: AgreementResponseDto;
}

export class ListAgreementsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Agreements retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'List of agreements',
    type: [AgreementResponseDto],
  })
  data: AgreementResponseDto[];
}

export class UpdateEnvelopeStatusDto {
  @ApiProperty({
    description: 'Envelope ID from DocuSign',
    example: 'abc123-def456-ghi789',
  })
  @IsString()
  @IsNotEmpty()
  envelopeId: string;
}

export class UpdateEnvelopeStatusResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Envelope status updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Updated agreement data',
    type: AgreementResponseDto,
    required: false,
  })
  data?: AgreementResponseDto;
}

export class DocuSignWebhookDto {
  @ApiProperty({
    description: 'Envelope ID',
    example: 'abc123-def456-ghi789',
  })
  envelopeId: string;

  @ApiProperty({
    description: 'Envelope status',
    example: 'completed',
  })
  status: string;
}

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'Channel Partner Agreement Template',
    required: false,
  })
  @IsString()
  @IsOptional()
  templateName?: string;
}

export class CreateTemplateResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Template created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Template ID from DocuSign',
    example: 'abc123-def456-ghi789',
  })
  templateId: string;

  @ApiProperty({
    description: 'Instructions for using the template',
    example: 'Save this template ID to DOCUSIGN_TEMPLATE_ID environment variable',
  })
  instructions: string;
}

