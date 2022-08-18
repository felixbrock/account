import { Db, Document, FindCursor, InsertOneResult, ObjectId } from 'mongodb';
import sanitize from 'mongo-sanitize';
import {
  Organization,
  OrganizationProperties,
} from '../../domain/entities/organization';
import {
  OrganizationQueryDto,
  IOrganizationRepository,
} from '../../domain/organization/i-organization-repository';

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
  public findOne = async (
    id: string,
    dbConnection: Db
  ): Promise<Organization | null> => {
    try {
      const result: any = await dbConnection
        .collection(collectionName)
        .findOne({ _id: new ObjectId(sanitize(id)) });

      if (!result) return null;

      return this.#toEntity(this.#buildProperties(result));
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  public findBy = async (
    organizationQueryDto: OrganizationQueryDto,
    dbConnection: Db
  ): Promise<Organization[]> => {
    try {
      if (!Object.keys(organizationQueryDto).length)
        return await this.all(dbConnection);

      const result: FindCursor = await dbConnection
        .collection(collectionName)
        .find(this.#buildFilter(sanitize(organizationQueryDto)));
      const results = await result.toArray();

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

  #buildFilter = (
    organizationQueryDto: OrganizationQueryDto
  ): OrganizationQueryFilter => {
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

  public all = async (dbConnection: Db): Promise<Organization[]> => {
    try {
      const result: FindCursor = await dbConnection
        .collection(collectionName)
        .find();
      const results = await result.toArray();

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

  public insertOne = async (
    organization: Organization,
    dbConnection: Db
  ): Promise<string> => {
    try {
      const result: InsertOneResult<Document> = await dbConnection
        .collection(collectionName)
        .insertOne(this.#toPersistence(sanitize(organization)));

      if (!result.acknowledged)
        throw new Error(
          'Organization creation failed. Insert not acknowledged'
        );

      return result.insertedId.toHexString();
    } catch (error: unknown) {
      if (typeof error === 'string') return Promise.reject(error);
      if (error instanceof Error) return Promise.reject(error.message);
      return Promise.reject(new Error('Unknown error occured'));
    }
  };

  #toEntity = (organizationProperties: OrganizationProperties): Organization =>
    Organization.create(organizationProperties);

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
