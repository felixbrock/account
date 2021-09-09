import { CreateAccount } from './account/create-account';
import { ReadAccount } from './account/read-account';
import { ReadAccounts } from './account/read-accounts';

export default class AccountDomain {
  #createAccount: CreateAccount;
  
  #readAccount: ReadAccount;

  #readAccounts: ReadAccounts;

  public get createAccount(): CreateAccount {
    return this.#createAccount;
  }

  public get readAccount(): ReadAccount {
    return this.#readAccount;
  }

  public get readAccounts(): ReadAccounts {
    return this.#readAccounts;
  }

  public constructor(
    createAccount: CreateAccount,
    readAccount: ReadAccount,
    readAccounts: ReadAccounts,
  ) {
    this.#createAccount = createAccount;
    this.#readAccount = readAccount;
    this.#readAccounts = readAccounts;
  }
}
