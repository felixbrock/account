// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import IUseCase from '../services/use-case';
import { Organization, OrganizationProperties } from '../entities/organization';
import { buildOrganizationDto, OrganizationDto } from './organization-dto';
import { IOrganizationRepository } from './i-organization-repository';
import Result from '../value-types/transient-types/result';

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

  public constructor(organizationRepository: IOrganizationRepository) {
    this.#organizationRepository = organizationRepository;
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

      const readOrganizationResult: OrganizationDto[] =
        await this.#organizationRepository.findBy({
          name: organization.value.name,
        });
      if (readOrganizationResult.length)
        throw new Error(
          `${organization.value.name} already exists under the id ${readOrganizationResult[0].id}`
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
