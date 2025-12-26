import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class UploadProfilePicDto {
  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile-pic.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  profile_pic_url: string;
}

export class UploadProfilePicResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Profile picture uploaded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile-pic.jpg',
  })
  profile_pic_url: string;
}

export class GetProfilePicResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile-pic.jpg',
    required: false,
  })
  profile_pic_url: string | null;
}

