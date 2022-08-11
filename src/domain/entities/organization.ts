export interface OrganizationProperties {
  id: string;
  name: string;
  modifiedOn?: number;
}

export class Organization {
  #id: string;

  #name: string;

  #modifiedOn: number;

  get id(): string {
    return this.#id;
  }

  get name(): string {
    return this.#name;
  }

  get modifiedOn(): number {
    return this.#modifiedOn;
  }

  set modifiedOn(modifiedOn: number) {
    this.#modifiedOn = modifiedOn;
  }

  private constructor(properties: OrganizationProperties) {
    this.#id = properties.id;
    this.#name = properties.name;
    this.#modifiedOn = properties.modifiedOn || Date.now();
  }

  static create(
    properties: OrganizationProperties
  ): Organization {
    if (!properties.id) throw new Error('Organization must have id');
    if (!properties.name) throw new Error('Organization must have name');

    const organization = new Organization(properties);
    return organization;
  }
}
