import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { AdminRepository } from './repositories/admin.repository';
import { Property } from '../property/entities/property.entity';
import { PropertyRepository } from '../property/repositories/property.repository';
import { JwtAuthGuard } from '../user/auth/guards/jwt-auth.guard';
import { PropertyModule } from '../property/property.module';
import { Lead } from './entities/lead.entity';
import { LeadNote } from './entities/lead-note.entity';
import { LeadPropertyContact } from './entities/lead-property-contact.entity';
import { LeadRepository } from './repositories/lead.repository';
import { LeadNoteRepository } from './repositories/lead-note.repository';
import { LeadPropertyContactRepository } from './repositories/lead-property-contact.repository';
import { LeadService } from './services/lead.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => PropertyModule),
    TypeOrmModule.forFeature([
      Admin,
      Property,
      Lead,
      LeadNote,
      LeadPropertyContact,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminRepository,
    PropertyRepository,
    JwtAuthGuard,
    LeadRepository,
    LeadNoteRepository,
    LeadPropertyContactRepository,
    LeadService,
  ],
  exports: [AdminService, AdminRepository, LeadService],
})
export class AdminModule {}

