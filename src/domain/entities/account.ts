import Result from '../value-types/transient-types/result';

export interface AccountProperties {
  id: string;
  userId: string;
}

export class Account {
  #id: string;

  #userId: string;

  public get id(): string {
    return this.#id;
  }

  public get userId(): string {
    return this.#userId;
  }

  private constructor(properties: AccountProperties) {
    this.#id = properties.id;
    this.#userId = properties.userId;
  }

  public static create(
    properties: AccountProperties
  ): Result<Account> {
    if (!properties.id) return Result.fail<Account>('Account must have id');
    if (!properties.userId) return Result.fail<Account>('Account must have user-id');

    const account = new Account(properties);
    return Result.ok<Account>(account);
  }
}
