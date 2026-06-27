import { IsString, IsNumber, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRedeemRequestDto {
  @ApiProperty({ example: '9638527410' })
  @IsString()
  @IsNotEmpty()
  userMobile: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsNotEmpty()
  redeemCoins: number;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @IsNotEmpty()
  redeemAmount: number;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  bankDetails: {
    account_number: string;
    ifsc_code: string;
    bank_name: string;
    account_holder_name: string;
    branch_name?: string;
  };
}