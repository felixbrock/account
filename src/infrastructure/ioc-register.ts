import { InjectionMode, asClass, createContainer } from 'awilix';

import AccountDomain from '../domain/account-domain';

import { CreateAccount } from '../domain/account/create-account';
import { ReadAccount } from '../domain/account/read-account';
import { ReadAccounts } from '../domain/account/read-accounts';

import AccountRepository from './persistence/account-repository';

import { CreateOrganization } from '../domain/organization/create-organization';
import { ReadOrganization } from '../domain/organization/read-organization';
import { ReadOrganizations } from '../domain/organization/read-organizations';

import OrganizationRepository from './persistence/organization-repository';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  accountDomain: asClass(AccountDomain),

  createAccount: asClass(CreateAccount),
  readAccount: asClass(ReadAccount),
  readAccounts: asClass(ReadAccounts),

  accountRepository: asClass(AccountRepository),

  createOrganization: asClass(CreateOrganization),
  readOrganization: asClass(ReadOrganization),
  readOrganizations: asClass(ReadOrganizations),

  organizationRepository: asClass(OrganizationRepository),
});

const accountMain =
  iocRegister.resolve<AccountDomain>('accountDomain');

export default {
  accountMain,
  container: iocRegister,
};
