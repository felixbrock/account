// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import IUseCase from '../services/use-case';
import { Account, AccountProperties } from '../entities/account';
import { IAccountRepository } from './i-account-repository';
import { IOrganizationRepository } from '../organization/i-organization-repository';
import { Organization } from '../entities/organization';
import { ReadAccounts, ReadAccountsResponseDto } from './read-accounts';
import Result from '../value-types/transient-types/result';

export interface CreateAccountRequestDto {
  userId: string;
  organizationId: string;
}

export interface CreateAccountAuthDto {
  isAdmin: boolean;
}

export type CreateAccountResponseDto = Result<string>;

export class CreateAccount
  implements
    IUseCase<
      CreateAccountRequestDto,
      CreateAccountResponseDto,
      CreateAccountAuthDto
    >
{
  #accountRepository: IAccountRepository;

  #organizationRepository: IOrganizationRepository;

  #readAccounts: ReadAccounts;

  public constructor(
    accountRepository: IAccountRepository,
    organizationRepository: IOrganizationRepository,
    readAccounts: ReadAccounts
  ) {
    this.#accountRepository = accountRepository;
    this.#organizationRepository = organizationRepository;
    this.#readAccounts = readAccounts;
  }

  public async execute(
    request: CreateAccountRequestDto,
    auth: CreateAccountAuthDto
  ): Promise<CreateAccountResponseDto> {
    if (!auth.isAdmin)
      return Promise.reject(new Error('Not authorized to perform action'));

    try {
      const createResult: Account = this.#createAccount(request);

      await this.#requestIsValid(createResult);

      const insertResult = await this.#accountRepository.insertOne(
        createResult
      );

      return Result.ok(insertResult);
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #requestIsValid = async (account: Account): Promise<boolean> => {
    const readAccountsResult: ReadAccountsResponseDto =
      await this.#readAccounts.execute({}, { userId: account.userId });

    if (!readAccountsResult.success) throw new Error('Reading accounts failed');
    if (readAccountsResult.value && readAccountsResult.value.length)
      throw new Error(
        `User ${readAccountsResult.value[0].userId} has already an account with the id ${readAccountsResult.value[0].id}`
      );

    const readOrganizationResult: Organization | null =
      await this.#organizationRepository.findOne(account.organizationId);

    if (!readOrganizationResult)
      return Promise.reject(
        new Error(`No organization exists under id ${account.organizationId}`)
      );

    return true;
  };

  #createAccount = (request: CreateAccountRequestDto): Account => {
    const accountProperties: AccountProperties = {
      id: new ObjectId().toHexString(),
      userId: request.userId,
      organizationId: request.organizationId,
    };

    return Account.create(accountProperties);
  };
}
