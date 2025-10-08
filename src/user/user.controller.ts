import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ApiResponse as ApiResponseType, ApiResponseDto } from '../common/dto';
import { Auth } from 'src/user/auth/decorators/auth.decorator';
import { Request } from 'express';
import { USER_MESSAGES } from './constants/user.messages';

@ApiTags('User Management')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}


  
} 