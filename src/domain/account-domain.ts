import { CreateAccount } from './account/create-account';
import { ReadAccount } from './account/read-account';
import { ReadAccounts } from './account/read-accounts';
import { CreateOrganization } from './organization/create-organization';
import { ReadOrganization } from './organization/read-organization';
import { ReadOrganizations } from './organization/read-organizations';

export default class AccountDomain {
  #createAccount: CreateAccount;
  
  #readAccount: ReadAccount;

  #readAccounts: ReadAccounts;

  #createOrganization: CreateOrganization;
  
  #readOrganization: ReadOrganization;

  #readOrganizations: ReadOrganizations;

  public get createAccount(): CreateAccount {
    return this.#createAccount;
  }

  public get readAccount(): ReadAccount {
    return this.#readAccount;
  }

  public get readAccounts(): ReadAccounts {
    return this.#readAccounts;
  }

  public get createOrganization(): CreateOrganization {
    return this.#createOrganization;
  }

  public get readOrganization(): ReadOrganization {
    return this.#readOrganization;
  }

  public get readOrganizations(): ReadOrganizations {
    return this.#readOrganizations;
  }

  public constructor(
    createAccount: CreateAccount,
    readAccount: ReadAccount,
    readAccounts: ReadAccounts,
    createOrganization: CreateOrganization,
    readOrganization: ReadOrganization,
    readOrganizations: ReadOrganizations,
  ) {
    this.#createAccount = createAccount;
    this.#readAccount = readAccount;
    this.#readAccounts = readAccounts;
    this.#createOrganization = createOrganization;
    this.#readOrganization = readOrganization;
    this.#readOrganizations = readOrganizations;
  }
}
