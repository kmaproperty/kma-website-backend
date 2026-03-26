import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { LeadRepository } from '../repositories/lead.repository';
import { LeadNoteRepository } from '../repositories/lead-note.repository';
import { LeadPropertyContactRepository } from '../repositories/lead-property-contact.repository';
import { PropertyRepository } from '../../property/repositories/property.repository';
import {
  CreateLeadDto,
  UpdateLeadDto,
  AddLeadNoteDto,
  UpdateLeadStatusDto,
  LeadPropertyContactDto,
  AdminLeadListQueryDto,
  AdminLeadListResponseDto,
  LeadResponseDto,
  LeadNoteResponseDto,
  LeadPropertyContactResponseDto,
} from '../dto/admin-lead.dto';
import {
  UserLeadListQueryDto,
  UserLeadListResponseDto,
  UserLeadResponseDto,
} from '../../property/dto/lead-listing.dto';
import {
  CreatePropertyLeadDto,
  CreatePropertyLeadResponseDto,
} from '../../property/dto/create-property-lead.dto';
import { Lead, LeadStatus, LeadBuildingType } from '../entities/lead.entity';
import { LeadNote } from '../entities/lead-note.entity';
import { LeadPropertyContact } from '../entities/lead-property-contact.entity';

@Injectable()
export class LeadService {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly leadNoteRepository: LeadNoteRepository,
    private readonly leadPropertyContactRepository: LeadPropertyContactRepository,
    private readonly propertyRepository: PropertyRepository,
  ) {}

  async createLead(dto: CreateLeadDto): Promise<LeadResponseDto> {
    const lead = await this.leadRepository.create({
      name: dto.name,
      phone: dto.phone || null,
      email: dto.email || null,
      budgetMin: dto.budgetMin || null,
      budgetMax: dto.budgetMax || null,
      sizeMin: dto.sizeMin || null,
      sizeMax: dto.sizeMax || null,
      buildingType: dto.buildingType || null,
      propertyTypes: dto.propertyTypes || null,
      locations: dto.locations || null,
      status: LeadStatus.NEW,
      propertiesContactedCount: 0,
    });

    return this.mapToResponseDto(lead);
  }

  async listLeads(
    query: AdminLeadListQueryDto,
  ): Promise<AdminLeadListResponseDto> {
    const { leads, total, statusCounts } =
      await this.leadRepository.findWithFilters(query);

    const page = query.page || 1;
    const limit = query.limit || 20;

    return {
      success: true,
      data: leads.map((lead) => this.mapToResponseDto(lead)),
      total,
      page,
      limit,
      statusCounts,
    };
  }

  async getLeadById(id: string): Promise<LeadResponseDto> {
    const lead = await this.leadRepository.findById(id, [
      'notes',
      'propertyContacts',
      'propertyContacts.property',
    ]);

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return this.mapToResponseDto(lead);
  }

  async updateLead(
    id: string,
    dto: UpdateLeadDto,
  ): Promise<LeadResponseDto> {
    const lead = await this.leadRepository.findById(id);

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    const updateData: Partial<Lead> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.phone !== undefined) updateData.phone = dto.phone || null;
    if (dto.email !== undefined) updateData.email = dto.email || null;
    if (dto.budgetMin !== undefined) updateData.budgetMin = dto.budgetMin || null;
    if (dto.budgetMax !== undefined) updateData.budgetMax = dto.budgetMax || null;
    if (dto.sizeMin !== undefined) updateData.sizeMin = dto.sizeMin || null;
    if (dto.sizeMax !== undefined) updateData.sizeMax = dto.sizeMax || null;
    if (dto.buildingType !== undefined)
      updateData.buildingType = dto.buildingType || null;
    if (dto.propertyTypes !== undefined)
      updateData.propertyTypes = dto.propertyTypes || null;
    if (dto.locations !== undefined)
      updateData.locations = dto.locations || null;
    if (dto.status !== undefined) updateData.status = dto.status;

    await this.leadRepository.update(id, updateData);

    const updatedLead = await this.leadRepository.findById(id, [
      'notes',
      'propertyContacts',
      'propertyContacts.property',
    ]);

    return this.mapToResponseDto(updatedLead!);
  }

  async updateLeadStatus(
    id: string,
    dto: UpdateLeadStatusDto,
  ): Promise<LeadResponseDto> {
    const lead = await this.leadRepository.findById(id);

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    await this.leadRepository.update(id, {
      status: dto.status,
      lastContactedAt: new Date(),
    });

    const updatedLead = await this.leadRepository.findById(id, [
      'notes',
      'propertyContacts',
      'propertyContacts.property',
    ]);

    return this.mapToResponseDto(updatedLead!);
  }

  async addNoteToLead(
    id: string,
    dto: AddLeadNoteDto,
    adminId?: string,
  ): Promise<LeadNoteResponseDto> {
    const lead = await this.leadRepository.findById(id);

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    const note = await this.leadNoteRepository.create({
      leadId: id,
      note: dto.note,
      createdByAdminId: adminId || null,
    });

    return {
      id: note.id,
      note: note.note,
      createdAt: note.createdAt,
      createdByAdminId: note.createdByAdminId,
    };
  }

  async addPropertyContact(
    id: string,
    dto: LeadPropertyContactDto,
  ): Promise<LeadPropertyContactResponseDto> {
    const lead = await this.leadRepository.findById(id);

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    const property = await this.propertyRepository.findByIdWithRelations(dto.propertyId);

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }

    // Check if contact already exists
    const existingContact =
      await this.leadPropertyContactRepository.findByLeadAndProperty(
        id,
        dto.propertyId,
      );

    if (existingContact) {
      // Update contacted time
      await this.leadPropertyContactRepository.update(existingContact.id, {
        contactedAt: new Date(),
      });
      const updatedContact = await this.leadPropertyContactRepository.findByLeadAndProperty(
        id,
        dto.propertyId,
      );
      return this.mapPropertyContactToResponseDto(updatedContact!, property);
    }

    const contact = await this.leadPropertyContactRepository.create({
      leadId: id,
      propertyId: dto.propertyId,
      contactedAt: new Date(),
    });

    // Update lead's properties contacted count
    const count =
      await this.leadPropertyContactRepository.countByLeadId(id);
    await this.leadRepository.update(id, {
      propertiesContactedCount: count,
      lastContactedAt: new Date(),
    });

    return this.mapPropertyContactToResponseDto(contact, property);
  }

  async deleteLead(id: string): Promise<void> {
    const lead = await this.leadRepository.findById(id);

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    await this.leadRepository.delete(id);
  }

  async syncLeadStatus(): Promise<{ message: string; synced: number }> {
    // This method can be used to sync lead statuses from external systems
    // For now, it's a placeholder
    return {
      message: 'Lead statuses synced successfully',
      synced: 0,
    };
  }

  async createLeadFromPropertyContact(
    dto: CreatePropertyLeadDto,
    userId?: string,
  ): Promise<CreatePropertyLeadResponseDto> {
    // Verify property exists
    const property = await this.propertyRepository.findByIdWithRelations(
      dto.propertyId,
    );

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }

    // Check if lead already exists by phone number
    let lead = await this.leadRepository.findByPhone(dto.phone);

    if (lead) {
      // Update lead information if provided
      const updateData: Partial<Lead> = {
        lastContactedAt: new Date(),
      };

      if (dto.name && dto.name !== lead.name) {
        updateData.name = dto.name;
      }

      if (dto.email && dto.email !== lead.email) {
        updateData.email = dto.email;
      }

      // Update status to CONTACTED if it's NEW
      if (lead.status === LeadStatus.NEW) {
        updateData.status = LeadStatus.CONTACTED;
      }

      await this.leadRepository.update(lead.id, updateData);
      const updatedLead = await this.leadRepository.findById(lead.id);
      if (!updatedLead) {
        throw new NotFoundException('Lead not found after update');
      }
      lead = updatedLead;
    } else {
      // Infer building type from property
      const inferredBuildingType =
        property.category?.code?.toUpperCase() === 'COMMERCIAL'
          ? LeadBuildingType.COMMERCIAL
          : property.category?.code?.toUpperCase() === 'RESIDENTIAL'
          ? LeadBuildingType.RESIDENTIAL
          : null;

      // Create new lead
      lead = await this.leadRepository.create({
        name: dto.name,
        phone: dto.phone,
        email: dto.email || null,
        status: LeadStatus.NEW,
        propertiesContactedCount: 0,
        lastContactedAt: new Date(),
        // Set both buildingType and legacy type column
        buildingType: inferredBuildingType,
        type: inferredBuildingType, // Legacy column
        propertyTypes: property.propertyType
          ? [property.propertyType.name]
          : null,
        locations: property.locality?.name
          ? [property.locality.name]
          : property.society?.name
          ? [property.society.name]
          : null,
      });
    }

    if (!lead) {
      throw new BadRequestException('Failed to create or retrieve lead');
    }

    // Check if property contact already exists
    const existingContact =
      await this.leadPropertyContactRepository.findByLeadAndProperty(
        lead.id,
        dto.propertyId,
      );

    if (!existingContact) {
      // Create property contact
      await this.leadPropertyContactRepository.create({
        leadId: lead.id,
        propertyId: dto.propertyId,
        contactedAt: new Date(),
      });

      // Update lead's properties contacted count
      const count =
        await this.leadPropertyContactRepository.countByLeadId(lead.id);
      await this.leadRepository.update(lead.id, {
        propertiesContactedCount: count,
        lastContactedAt: new Date(),
      });
    } else {
      // Update contacted time if contact already exists
      await this.leadPropertyContactRepository.update(existingContact.id, {
        contactedAt: new Date(),
      });
      await this.leadRepository.update(lead.id, {
        lastContactedAt: new Date(),
      });
    }

    return {
      success: true,
      leadId: lead.id,
      message: 'Lead created/updated successfully',
    };
  }

  async exportLeads(query: AdminLeadListQueryDto): Promise<any[]> {
    const { leads } = await this.leadRepository.findWithFilters({
      ...query,
      limit: 10000, // Large limit for export
    });

    return leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      budgetMin: lead.budgetMin,
      budgetMax: lead.budgetMax,
      sizeMin: lead.sizeMin,
      sizeMax: lead.sizeMax,
      buildingType: lead.buildingType,
      propertyTypes: lead.propertyTypes,
      locations: lead.locations,
      status: lead.status,
      lastContactedAt: lead.lastContactedAt,
      propertiesContactedCount: lead.propertiesContactedCount,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    }));
  }

  async listLeadsForUser(
    userId: string,
    query: UserLeadListQueryDto,
  ): Promise<UserLeadListResponseDto> {
    // Get all properties owned by the user
    const userProperties = await this.propertyRepository.findByUserId(userId);

    const propertyIds = userProperties.map((p) => p.id);

    if (propertyIds.length === 0) {
      return {
        success: true,
        data: [],
        total: 0,
        page: query.page || 1,
        limit: query.limit || 20,
      };
    }

    // Get leads that have contacted user's properties
    const { leads, total, tabCounts } = await this.leadRepository.findByUserProperties(
      userId,
      propertyIds,
      {
        page: query.page,
        limit: query.limit,
        search: query.search,
        propertyId: query.propertyId,
        status: query.status,
        timeFilter: query.timeFilter,
        budgetMin: query.budgetMin,
        budgetMax: query.budgetMax,
        sizeMin: query.sizeMin,
        sizeMax: query.sizeMax,
        buildingType: query.buildingType,
        locality: query.locality,
      },
    );

    const page = query.page || 1;
    const limit = query.limit || 20;

    return {
      success: true,
      data: leads.map((lead) => this.mapToUserLeadResponseDto(lead)),
      total,
      page,
      limit,
      tabCounts,
    };
  }

  private mapToUserLeadResponseDto(lead: Lead): UserLeadResponseDto {
    // Filter property contacts to only include properties owned by the user
    const propertyContacts = lead.propertyContacts
      ? lead.propertyContacts.map((contact) =>
          this.mapPropertyContactToUserDto(contact, contact.property),
        )
      : [];

    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      budgetMin: lead.budgetMin,
      budgetMax: lead.budgetMax,
      sizeMin: lead.sizeMin,
      sizeMax: lead.sizeMax,
      buildingType: lead.buildingType,
      propertyTypes: lead.propertyTypes,
      locations: lead.locations,
      status: lead.status,
      lastContactedAt: lead.lastContactedAt,
      propertiesContactedCount: lead.propertiesContactedCount,
      propertyContacts,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }

  private mapPropertyContactToUserDto(
    contact: LeadPropertyContact,
    property?: any,
  ): any {
    return {
      id: contact.id,
      propertyId: contact.propertyId,
      property: property
        ? {
            id: property.id,
            title: this.getPropertyTitle(property),
            price: property.price || null,
            monthlyRent: property.monthlyRent || null,
            area: property.builtUpArea || property.carpetArea || null,
            areaUnit: property.builtUpAreaUnit || property.carpetAreaUnit || null,
            bhkTypeName: property.bhkType?.name || null,
            societyName: property.society?.name || null,
            localityName: property.locality?.name || null,
          }
        : null,
      contactedAt: contact.contactedAt,
    };
  }

  private mapToResponseDto(lead: Lead): LeadResponseDto {
    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      budgetMin: lead.budgetMin,
      budgetMax: lead.budgetMax,
      sizeMin: lead.sizeMin,
      sizeMax: lead.sizeMax,
      buildingType: lead.buildingType,
      propertyTypes: lead.propertyTypes,
      locations: lead.locations,
      status: lead.status,
      lastContactedAt: lead.lastContactedAt,
      propertiesContactedCount: lead.propertiesContactedCount,
      notes: lead.notes
        ? lead.notes.map((note) => ({
            id: note.id,
            note: note.note,
            createdAt: note.createdAt,
            createdByAdminId: note.createdByAdminId,
          }))
        : undefined,
      propertyContacts: lead.propertyContacts
        ? lead.propertyContacts.map((contact) =>
            this.mapPropertyContactToResponseDto(
              contact,
              contact.property,
            ),
          )
        : undefined,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }

  private mapPropertyContactToResponseDto(
    contact: LeadPropertyContact,
    property?: any,
  ): LeadPropertyContactResponseDto {
    return {
      id: contact.id,
      propertyId: contact.propertyId,
      property: property
        ? {
            id: property.id,
            title: this.getPropertyTitle(property),
            price: property.price || null,
            monthlyRent: property.monthlyRent || null,
            area: property.builtUpArea || property.carpetArea || null,
            areaUnit: property.builtUpAreaUnit || property.carpetAreaUnit || null,
            bhkTypeName: property.bhkType?.name || null,
            societyName: property.society?.name || null,
            localityName: property.locality?.name || null,
          }
        : undefined,
      contactedAt: contact.contactedAt,
    };
  }

  private getPropertyTitle(property: any): string {
    const parts: string[] = [];
    if (property.bhkType?.name) parts.push(property.bhkType.name);
    if (property.propertyType?.name) parts.push(property.propertyType.name);
    if (parts.length === 0) {
      return property.propertyDescription || 'Property';
    }
    return parts.join(' ');
  }
}

