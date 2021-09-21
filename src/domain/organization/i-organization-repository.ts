import { Organization } from '../entities/organization';
import Result from '../value-types/transient-types/result';

export interface OrganizationQueryDto {
  name?: string;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface IOrganizationRepository {
  findOne(id: string): Promise<Organization | null>;
  findBy(
    organizationQueryDto: OrganizationQueryDto
  ): Promise<Organization[]>;
  all(): Promise<Organization[]>;
  insertOne(organization: Organization): Promise<Result<null>>;
}
