// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import IUseCase from '../services/use-case';
import { Account, AccountProperties } from '../entities/account';
import { buildAccountDto, AccountDto } from './account-dto';
import { IAccountRepository } from './i-account-repository';
import Result from '../value-types/transient-types/result';
import { IOrganizationRepository } from '../organization/i-organization-repository';
import { Organization } from '../entities/organization';
import { ReadAccounts, ReadAccountsResponseDto } from './read-accounts';

export interface CreateAccountRequestDto {
  userId: string;
  organizationId: string;
}

export interface CreateAccountAuthDto {
  isAdmin: boolean;
}

export type CreateAccountResponseDto = Result<AccountDto>;

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
    const createResult: Result<Account> = this.#createAccount(request);
    if (!createResult.value) return createResult;

    try {
      if (!auth.isAdmin) throw new Error('Not authorized to perform action');

      const validatedRequest = await this.#validateRequest(createResult.value);
      if (validatedRequest.error) throw new Error(validatedRequest.error);

      await this.#accountRepository.insertOne(createResult.value);

      return Result.ok(buildAccountDto(createResult.value));
    } catch (error: unknown) {
      if(typeof error === 'string') return Result.fail(error);
      if(error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #validateRequest = async (account: Account): Promise<Result<undefined>> => {
    const readAccountsResult: ReadAccountsResponseDto =
      await this.#readAccounts.execute({}, { userId: account.userId });

    if (!readAccountsResult.success) throw new Error(readAccountsResult.error);
    if (!readAccountsResult.value) throw new Error('Reading accounts failed');
    if (readAccountsResult.value.length)
      throw new Error(
        `User ${readAccountsResult.value[0].userId} has already an account with the id ${readAccountsResult.value[0].id}`
      );

    const readOrganizationResult: Organization | null =
      await this.#organizationRepository.findOne(account.organizationId);

    if (!readOrganizationResult)
      return Result.fail(
        `No organization exists under id ${account.organizationId}`
      );

    return Result.ok(undefined);
  };

  #createAccount = (
    request: CreateAccountRequestDto
  ): Result<Account> => {
    const accountProperties: AccountProperties = {
      id: new ObjectId().toHexString(),
      userId: request.userId,
      organizationId: request.organizationId,
    };

    return Account.create(accountProperties);
  };
}
