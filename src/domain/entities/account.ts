import Result from '../value-types/transient-types/result';

export interface AccountProperties {
  id: string;
  userId: string;
  organizationId: string;
  modifiedOn?: number;
}

export class Account {
  #id: string;

  #userId: string;

  #organizationId: string;

  #modifiedOn: number;

  public get id(): string {
    return this.#id;
  }

  public get userId(): string {
    return this.#userId;
  }

  public get organizationId(): string {
    return this.#organizationId;
  }

  public get modifiedOn(): number {
    return this.#modifiedOn;
  }

  public set modifiedOn(modifiedOn: number) {
    this.#modifiedOn = modifiedOn;
  }

  private constructor(properties: AccountProperties) {
    this.#id = properties.id;
    this.#userId = properties.userId;
    this.#organizationId = properties.organizationId;
    this.#modifiedOn = properties.modifiedOn || Date.now();
  }

  public static create(
    properties: AccountProperties
  ): Result<Account> {  
    if (!properties.id) return Result.fail<Account>('Account must have id');
    if (!properties.userId) return Result.fail<Account>('Account must have user-id');
    if (!properties.organizationId) return Result.fail<Account>('Account must have organization-id');

    const account = new Account(properties);
    return Result.ok<Account>(account);
  }
}
