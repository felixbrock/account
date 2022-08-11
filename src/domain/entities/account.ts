
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

  get id(): string {
    return this.#id;
  }

  get userId(): string {
    return this.#userId;
  }

  get organizationId(): string {
    return this.#organizationId;
  }

  get modifiedOn(): number {
    return this.#modifiedOn;
  }

  set modifiedOn(modifiedOn: number) {
    this.#modifiedOn = modifiedOn;
  }

  private constructor(properties: AccountProperties) {
    this.#id = properties.id;
    this.#userId = properties.userId;
    this.#organizationId = properties.organizationId;
    this.#modifiedOn = properties.modifiedOn || Date.now();
  }

  static create(
    properties: AccountProperties
  ): Account {  
    if (!properties.id) throw new Error('Account must have id');
    if (!properties.userId) throw new Error('Account must have user-id');
    if (!properties.organizationId) throw new Error('Account must have organization-id');

    const account = new Account(properties);
    return account;
  }
}
