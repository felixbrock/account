import { Organization } from '../entities/organization';

export interface OrganizationDto {
  id: string;
  name: string;
  modifiedOn: string;
}

export const buildOrganizationDto = (organization: Organization): OrganizationDto => ({
  id: organization.id,
  name: organization.name,
  modifiedOn: organization.modifiedOn,
});
