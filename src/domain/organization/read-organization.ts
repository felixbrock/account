import { Organization } from '../entities/organization';
import { DbConnection } from '../services/i-db';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import { IOrganizationRepository } from './i-organization-repository';
import { OrganizationDto, buildOrganizationDto } from './organization-dto';

export interface ReadOrganizationRequestDto {
  targetOrgId: string;
}

export interface ReadOrganizationAuthDto {
  callerOrgId?: string;
  isSystemInternal: boolean;
}

export type ReadOrganizationResponseDto = Result<OrganizationDto>;

export class ReadOrganization
  implements
    IUseCase<
      ReadOrganizationRequestDto,
      ReadOrganizationResponseDto,
      ReadOrganizationAuthDto,
      DbConnection
    >
{
  #organizationRepository: IOrganizationRepository;

  #dbConnection: DbConnection;

  constructor(organizationRepository: IOrganizationRepository) {
    this.#organizationRepository = organizationRepository;
  }

  async execute(
    request: ReadOrganizationRequestDto,
    auth: ReadOrganizationAuthDto,
    dbConnection: DbConnection
  ): Promise<ReadOrganizationResponseDto> {
    this.#dbConnection = dbConnection;

    try {
      if (
        auth.callerOrgId && request.targetOrgId !== auth.callerOrgId &&
        !auth.isSystemInternal
      )
        throw new Error('Not authorized to perform action');

      const organization: Organization | null =
        await this.#organizationRepository.findOne(
          request.targetOrgId,
          this.#dbConnection
        );
      if (!organization)
        throw new Error(
          `Organization with id ${request.targetOrgId} does not exist`
        );

      return Result.ok(buildOrganizationDto(organization));
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
