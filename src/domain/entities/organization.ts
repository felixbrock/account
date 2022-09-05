export interface OrganizationProperties {
  id: string;
  name: string;
  modifiedOn?: string;
}

export class Organization {
  #id: string;

  #name: string;

  #modifiedOn: string;

  get id(): string {
    return this.#id;
  }

  get name(): string {
    return this.#name;
  }

  get modifiedOn(): string {
    return this.#modifiedOn;
  }

  set modifiedOn(modifiedOn: string) {
    this.#modifiedOn = modifiedOn;
  }

  private constructor(properties: OrganizationProperties) {
    this.#id = properties.id;
    this.#name = properties.name;
    this.#modifiedOn = properties.modifiedOn || new Date().toISOString();
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
