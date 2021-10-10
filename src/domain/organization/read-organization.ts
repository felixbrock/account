import { Organization } from '../entities/organization';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { IOrganizationRepository } from './i-organization-repository';
import { OrganizationDto, buildOrganizationDto } from './organization-dto';

export interface ReadOrganizationRequestDto {
  organizationId: string;
}

export interface ReadOrganizationAuthDto {
  organizationId: string;
  isAdmin: boolean;
}

export type ReadOrganizationResponseDto = Result<OrganizationDto | null>;

export class ReadOrganization
  implements
    IUseCase<
      ReadOrganizationRequestDto,
      ReadOrganizationResponseDto,
      ReadOrganizationAuthDto
    >
{
  #organizationRepository: IOrganizationRepository;

  public constructor(organizationRepository: IOrganizationRepository) {
    this.#organizationRepository = organizationRepository;
  }

  public async execute(
    request: ReadOrganizationRequestDto,
    auth: ReadOrganizationAuthDto
  ): Promise<ReadOrganizationResponseDto> {
    try {
      if (request.organizationId !== auth.organizationId && !auth.isAdmin)
      throw new Error('Not authorized to perform action');

      const organization: Organization | null =
        await this.#organizationRepository.findOne(request.organizationId);
      if (!organization)
        throw new Error(
          `Organization with id ${request.organizationId} does not exist`
        );

      return Result.ok<OrganizationDto>(buildOrganizationDto(organization));
    } catch (error: any) {
      return Result.fail<null>(
        typeof error === 'string' ? error : error.message
      );
    }
  }
}
