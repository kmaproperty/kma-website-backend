import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionResponseDto {
  @ApiProperty({
    description:
      'Session ID to send in X-Session-Id header on subsequent requests (property views, search, etc.)',
    example: 'a1b2c3d4e5f6789012345678abcdef01',
  })
  sessionId: string;
}
