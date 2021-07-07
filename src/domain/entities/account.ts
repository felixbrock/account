import Result from '../value-types/transient-types/result';

export interface AccountProperties {
  id: string;
  userId: string;
  modifiedOn?: number;
}

export class Account {
  #id: string;

  #userId: string;

  #modifiedOn: number;

  public get id(): string {
    return this.#id;
  }

  public get userId(): string {
    return this.#userId;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public set modifiedOn(modifiedOn: number) {
    if (!Account.timestampIsValid(modifiedOn))
      throw new Error('ModifiedOn value lies in the past');

    this.#modifiedOn = modifiedOn;
  }

  private constructor(properties: AccountProperties) {
    this.#id = properties.id;
    this.#userId = properties.userId;
    this.#modifiedOn = Date.now();
  }

  public static create(
    properties: AccountProperties
  ): Result<Account> {
    if (!properties.id) return Result.fail<Account>('Account must have id');
    if (!properties.userId) return Result.fail<Account>('Account must have user-id');

    const account = new Account(properties);
    return Result.ok<Account>(account);
  }

  public static timestampIsValid = (timestamp: number): boolean => {
    const minute = 60 * 1000;
    if (timestamp && timestamp < Date.now() - minute) return false;
    return true;
  };
}
