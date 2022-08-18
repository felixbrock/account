import { Organization } from '../entities/organization';
import { DbConnection } from '../services/i-db';

export interface OrganizationQueryDto {
  name?: string;
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
}

export interface IOrganizationRepository {
  findOne(id: string, dbConnection: DbConnection): Promise<Organization | null>;
  findBy(
    organizationQueryDto: OrganizationQueryDto,
    dbConnection: DbConnection
  ): Promise<Organization[]>;
  all(dbConnection: DbConnection): Promise<Organization[]>;
  insertOne(
    organization: Organization,
    dbConnection: DbConnection
  ): Promise<string>;
}
