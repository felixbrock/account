import { Document, FindCursor, InsertOneResult, ObjectId } from 'mongodb';
import sanitize from 'mongo-sanitize';
import {
  Organization,
  OrganizationProperties,
} from '../../domain/entities/organization';
import {
  OrganizationQueryDto,
  IOrganizationRepository,
} from '../../domain/organization/i-organization-repository';
import Result from '../../domain/value-types/transient-types/result';
import { close, connect, createClient } from './db/mongo-db';

interface OrganizationPersistence {
  _id: string;
  name: string;
  modifiedOn: number;
}

interface OrganizationQueryFilter {
  name?: string;
  modifiedOn?: { [key: string]: number };
}

const collectionName = 'organizations';

export default class OrganizationRepositoryImpl
  implements IOrganizationRepository
{
  public findOne = async (id: string): Promise<Organization | null> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: any = await db
        .collection(collectionName)
        .findOne({ _id: new ObjectId(sanitize(id)) });

      close(client);

      if (!result) return null;

      return this.#toEntity(this.#buildProperties(result));
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public findBy = async (
    organizationQueryDto: OrganizationQueryDto
  ): Promise<Organization[]> => {
    if (!Object.keys(organizationQueryDto).length) return this.all();

    const client = createClient();
    try {
      const db = await connect(client);
      const result: FindCursor = await db
        .collection(collectionName)
        .find(this.#buildFilter(sanitize(organizationQueryDto)));
      const results = await result.toArray();

      close(client);

      if (!results || !results.length) return [];

      return results.map((element: any) =>
        this.#toEntity(this.#buildProperties(element))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #buildFilter = (organizationQueryDto: OrganizationQueryDto): OrganizationQueryFilter => {
    const filter: { [key: string]: any } = {};

    if (organizationQueryDto.name) filter.name = organizationQueryDto.name;

    const modifiedOnFilter: { [key: string]: number } = {};
    if (organizationQueryDto.modifiedOnStart)
      modifiedOnFilter.$gte = organizationQueryDto.modifiedOnStart;
    if (organizationQueryDto.modifiedOnEnd)
      modifiedOnFilter.$lte = organizationQueryDto.modifiedOnEnd;
    if (Object.keys(modifiedOnFilter).length)
      filter.modifiedOn = modifiedOnFilter;

    return filter;
  };

  public all = async (): Promise<Organization[]> => {
    const client = createClient();
    try {
      const db = await connect(client);
      const result: FindCursor = await db.collection(collectionName).find();
      const results = await result.toArray();

      close(client);

      if (!results || !results.length) return [];

      return results.map((element: any) =>
        this.#toEntity(this.#buildProperties(element))
      );
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public insertOne = async (organization: Organization): Promise<string> => {
    const client = createClient();

    try {
      const db = await connect(client);
      const result: InsertOneResult<Document> = await db
        .collection(collectionName)
        .insertOne(this.#toPersistence(sanitize(organization)));

      if (!result.acknowledged)
        throw new Error(
          'Organization creation failed. Insert not acknowledged'
        );

      close(client);

      return result.insertedId.toHexString();
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #toEntity = (
    organizationProperties: OrganizationProperties
  ): Organization => {
    const createOrganizationResult: Result<Organization> = Organization.create(
      organizationProperties
    );

    if (createOrganizationResult.error)
      throw new Error(createOrganizationResult.error);
    if (!createOrganizationResult.value)
      throw new Error('Organization creation failed');

    return createOrganizationResult.value;
  };

  #buildProperties = (
    organization: OrganizationPersistence
  ): OrganizationProperties => ({
    // eslint-disable-next-line no-underscore-dangle
    id: organization._id,
    name: organization.name,
    modifiedOn: organization.modifiedOn,
  });

  #toPersistence = (organization: Organization): Document => ({
    _id: ObjectId.createFromHexString(organization.id),
    name: organization.name,
    modifiedOn: organization.modifiedOn,
  });
}
