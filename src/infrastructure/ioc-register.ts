import { InjectionMode, asClass, createContainer } from 'awilix';

import AccountDomain from '../domain/account-domain';

import { CreateAccount } from '../domain/account/create-account';
import { ReadAccount } from '../domain/account/read-account';
import { ReadAccounts } from '../domain/account/read-accounts';

import AccountRepository from './persistence/account-repository';

const iocRegister = createContainer({ injectionMode: InjectionMode.CLASSIC });

iocRegister.register({
  accountDomain: asClass(AccountDomain),

  createAccount: asClass(CreateAccount),
  readAccount: asClass(ReadAccount),
  readAccounts: asClass(ReadAccounts),

  accountRepository: asClass(AccountRepository),
});

const accountMain =
  iocRegister.resolve<AccountDomain>('accountDomain');

export default {
  accountMain,
  container: iocRegister,
};
