import { CreateAccount } from './account/create-account';
import { ReadAccount } from './account/read-account';

export default class AccountDomain {
  #createAccount: CreateAccount;
  
  #readAccount: ReadAccount;

  public get createAccount(): CreateAccount {
    return this.#createAccount;
  }

  public get readAccount(): ReadAccount {
    return this.#readAccount;
  }

  constructor(
    createAccount: CreateAccount,
    readAccount: ReadAccount,
  ) {
    this.#createAccount = createAccount;
    this.#readAccount = readAccount;
  }
}
