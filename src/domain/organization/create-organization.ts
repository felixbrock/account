// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import IUseCase from '../services/use-case';
import { Organization, OrganizationProperties } from '../entities/organization';
import { IOrganizationRepository } from './i-organization-repository';
import {
  ReadOrganizations,
  ReadOrganizationsResponseDto,
} from './read-organizations';
import Result from '../value-types/transient-types/result';

export interface CreateOrganizationRequestDto {
  name: string;
}

export interface CreateOrganizationAuthDto {
  isAdmin: boolean;
}

export type CreateOrganizationResponseDto = Result<string>;

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

  constructor(
    organizationRepository: IOrganizationRepository,
    readOrganizations: ReadOrganizations
  ) {
    this.#organizationRepository = organizationRepository;
    this.#readOrganizations = readOrganizations;
  }

  async execute(
    request: CreateOrganizationRequestDto,
    auth: CreateOrganizationAuthDto
  ): Promise<CreateOrganizationResponseDto> {
    if (!auth.isAdmin)
      Promise.reject(new Error('Not authorized to perform action'));

    try {
      const organization: Organization = this.#createOrganization(request);

      const readOrganizationsResult: ReadOrganizationsResponseDto =
        await this.#readOrganizations.execute(
          { name: organization.name },
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

      const insertResult = await this.#organizationRepository.insertOne(
        organization
      );

      return Result.ok(insertResult);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #createOrganization = (
    request: CreateOrganizationRequestDto
  ): Organization => {
    const organizationProperties: OrganizationProperties = {
      id: new ObjectId().toHexString(),
      name: request.name,
    };

    return Organization.create(organizationProperties);
  };
}
