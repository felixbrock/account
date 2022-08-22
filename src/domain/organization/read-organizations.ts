import { Organization } from '../entities/organization';
import { DbConnection } from '../services/i-db';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import {
  IOrganizationRepository,
  OrganizationQueryDto,
} from './i-organization-repository';
import { OrganizationDto, buildOrganizationDto } from './organization-dto';

export interface ReadOrganizationsRequestDto {
  name?: string;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface ReadOrganizationsAuthDto {
  isSystemInternal: boolean;
}

export type ReadOrganizationsResponseDto = Result<OrganizationDto[]>;

export class ReadOrganizations
  implements
    IUseCase<
      ReadOrganizationsRequestDto,
      ReadOrganizationsResponseDto,
      ReadOrganizationsAuthDto,
      DbConnection
    >
{
  #organizationRepository: IOrganizationRepository;

  #dbConnection: DbConnection;

  constructor(organizationRepository: IOrganizationRepository) {
    this.#organizationRepository = organizationRepository;
  }

  async execute(
    request: ReadOrganizationsRequestDto,
    auth: ReadOrganizationsAuthDto,
    dbConnection: DbConnection
  ): Promise<ReadOrganizationsResponseDto> {

    this.#dbConnection = dbConnection; 

    try {
      if (!auth.isSystemInternal) throw new Error('Not authorized to perform action');

      const organizations: Organization[] =
        await this.#organizationRepository.findBy(
          this.#buildOrganizationQueryDto(request), dbConnection
        );
      if (!organizations) throw new Error(`Queried organizations do not exist`);

      return Result.ok(
        organizations.map((organization) => buildOrganizationDto(organization))
      );
    } catch (error: unknown) {
      if(typeof error === 'string') return Result.fail(error);
      if(error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #buildOrganizationQueryDto = (
    request: ReadOrganizationsRequestDto
  ): OrganizationQueryDto => {
    const queryDto: OrganizationQueryDto = {};

    if (request.name) queryDto.name = request.name;
    if (request.modifiedOnStart)
      queryDto.modifiedOnStart = request.modifiedOnStart;
    if (request.modifiedOnEnd) queryDto.modifiedOnEnd = request.modifiedOnEnd;

    return queryDto;
  };
}
