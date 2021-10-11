// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import IUseCase from '../services/use-case';
import { Organization, OrganizationProperties } from '../entities/organization';
import { buildOrganizationDto, OrganizationDto } from './organization-dto';
import { IOrganizationRepository } from './i-organization-repository';
import Result from '../value-types/transient-types/result';
import {
  ReadOrganizations,
  ReadOrganizationsResponseDto,
} from './read-organizations';

export interface CreateOrganizationRequestDto {
  name: string;
}

export interface CreateOrganizationAuthDto {
  isAdmin: boolean;
}

export type CreateOrganizationResponseDto = Result<OrganizationDto | null>;

export class CreateOrganization
  implements
    IUseCase<
      CreateOrganizationRequestDto,
      CreateOrganizationResponseDto,
      CreateOrganizationAuthDto
    >
{
  #organizationRepository: IOrganizationRepository;

  #readOrganizations: ReadOrganizations;

  public constructor(
    organizationRepository: IOrganizationRepository,
    readOrganizations: ReadOrganizations
  ) {
    this.#organizationRepository = organizationRepository;
    this.#readOrganizations = readOrganizations;
  }

  public async execute(
    request: CreateOrganizationRequestDto,
    auth: CreateOrganizationAuthDto
  ): Promise<CreateOrganizationResponseDto> {
    const organization: Result<Organization | null> =
      this.#createOrganization(request);
    if (!organization.value) return organization;

    try {
      if (!auth.isAdmin) throw new Error('Not authorized to perform action');

      const readOrganizationsResult: ReadOrganizationsResponseDto =
        await this.#readOrganizations.execute(
          { name: organization.value.name },
          { isAdmin: auth.isAdmin }
        );

      if (!readOrganizationsResult.success)
        throw new Error(readOrganizationsResult.error);
      if (!readOrganizationsResult.value)
        throw new Error('Reading organizations failed');
      if (readOrganizationsResult.value.length)
        throw new Error(
          `Organization ${readOrganizationsResult.value[0].name} already exists under the id ${readOrganizationsResult.value[0].id}`
        );

      // TODO Install error handling
      await this.#organizationRepository.insertOne(organization.value);

      return Result.ok<OrganizationDto>(
        buildOrganizationDto(organization.value)
      );
    } catch (error: any) {
      return Result.fail<OrganizationDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #createOrganization = (
    request: CreateOrganizationRequestDto
  ): Result<Organization | null> => {
    const organizationProperties: OrganizationProperties = {
      id: new ObjectId().toHexString(),
      name: request.name,
    };

    return Organization.create(organizationProperties);
  };
}
