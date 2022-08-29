// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import IUseCase from '../services/use-case';
import { Account, AccountProperties } from '../entities/account';
import { IAccountRepository } from './i-account-repository';
import { IOrganizationRepository } from '../organization/i-organization-repository';
import { Organization } from '../entities/organization';
import { ReadAccounts, ReadAccountsResponseDto } from './read-accounts';
import Result from '../value-types/transient-types/result';
import { DbConnection } from '../services/i-db';

export interface CreateAccountRequestDto {
  targetUserId: string;
  targetOrganizationId: string;
}

export interface CreateAccountAuthDto {
  isSystemInternal: boolean;
}

export type CreateAccountResponseDto = Result<string>;

export class CreateAccount
  implements
    IUseCase<
      CreateAccountRequestDto,
      CreateAccountResponseDto,
      CreateAccountAuthDto,
      DbConnection
    >
{
  #accountRepository: IAccountRepository;

  #organizationRepository: IOrganizationRepository;

  #readAccounts: ReadAccounts;

  #dbConnection: DbConnection;

  constructor(
    accountRepository: IAccountRepository,
    organizationRepository: IOrganizationRepository,
    readAccounts: ReadAccounts
  ) {
    this.#accountRepository = accountRepository;
    this.#organizationRepository = organizationRepository;
    this.#readAccounts = readAccounts;
  }

  async execute(
    request: CreateAccountRequestDto,
    auth: CreateAccountAuthDto,
    dbConnection: DbConnection
  ): Promise<CreateAccountResponseDto> {
    this.#dbConnection = dbConnection;

    if (!auth.isSystemInternal)
      return Promise.reject(new Error('Not authorized to perform action'));

    try {
      const createResult: Account = this.#createAccount(request);

      await this.#requestIsValid(createResult);

      const insertResult = await this.#accountRepository.insertOne(
        createResult,
        this.#dbConnection
      );

      return Result.ok(insertResult);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #requestIsValid = async (
    account: Account,
  ): Promise<boolean> => {
    const readAccountsResult: ReadAccountsResponseDto =
      await this.#readAccounts.execute(
        { targetUserId: account.userId },
        { isSystemInternal: true },
        this.#dbConnection
      );

    if (!readAccountsResult.success) throw new Error('Reading accounts failed');
    if (readAccountsResult.value && readAccountsResult.value.length)
      throw new Error(
        `User ${readAccountsResult.value[0].userId} has already an account with the id ${readAccountsResult.value[0].id}`
      );

    const readOrganizationResult: Organization | null =
      await this.#organizationRepository.findOne(
        account.organizationId,
        this.#dbConnection
      );

    if (!readOrganizationResult)
      return Promise.reject(
        new Error(`No organization exists under id ${account.organizationId}`)
      );

    return true;
  };

  #createAccount = (request: CreateAccountRequestDto): Account => {
    const accountProperties: AccountProperties = {
      id: new ObjectId().toHexString(),
      userId: request.targetUserId,
      organizationId: request.targetOrganizationId,
    };

    return Account.create(accountProperties);
  };
}
