import { Organization } from '../entities/organization';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import {IOrganizationRepository} from './i-organization-repository';
import {OrganizationDto, buildOrganizationDto } from './organization-dto';

export interface ReadOrganizationRequestDto {
  id: string;
}

export type ReadOrganizationResponseDto = Result<OrganizationDto | null>;

export class ReadOrganization
  implements IUseCase<ReadOrganizationRequestDto, ReadOrganizationResponseDto>
{
  #organizationRepository: IOrganizationRepository;

  public constructor(organizationRepository: IOrganizationRepository) {
    this.#organizationRepository = organizationRepository;
  }

  public async execute(
    request: ReadOrganizationRequestDto
  ): Promise<ReadOrganizationResponseDto> {
    try {
      const organization: Organization | null =
        await this.#organizationRepository.findOne(request.id);
      if (!organization)
        throw new Error(
          `Organization with id ${request.id} does not exist`
        );

      return Result.ok<OrganizationDto>(
        buildOrganizationDto(organization)
      );
    } catch (error: any) {
      return Result.fail<null>(typeof error === 'string' ? error : error.message);
    }
  }
}
