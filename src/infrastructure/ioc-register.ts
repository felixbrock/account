import { InjectionMode, asClass, createContainer } from 'awilix';

import { CreateAccount } from '../domain/account/create-account';
import { ReadAccount } from '../domain/account/read-account';
import { ReadAccounts } from '../domain/account/read-accounts';

import AccountRepository from './persistence/account-repository';

import { CreateOrganization } from '../domain/organization/create-organization';
import { ReadOrganization } from '../domain/organization/read-organization';
import { ReadOrganizations } from '../domain/organization/read-organizations';

import OrganizationRepository from './persistence/organization-repository';

import Dbo from './persistence/db/mongo-db';


const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  createAccount: asClass(CreateAccount),
  readAccount: asClass(ReadAccount),
  readAccounts: asClass(ReadAccounts),

  createOrganization: asClass(CreateOrganization),
  readOrganization: asClass(ReadOrganization),
  readOrganizations: asClass(ReadOrganizations),

  accountRepository: asClass(AccountRepository),

  organizationRepository: asClass(OrganizationRepository),

  dbo: asClass(Dbo).singleton(),
});

export default iocRegister;
