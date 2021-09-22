// TODO Violation of Dependency Rule
import { ObjectId } from 'mongodb';
import IUseCase from '../services/use-case';
import { Account, AccountProperties } from '../entities/account';
import { buildAccountDto, AccountDto } from './account-dto';
import { IAccountRepository } from './i-account-repository';
import Result from '../value-types/transient-types/result';
import { IOrganizationRepository } from '../organization/i-organization-repository';
import { Organization } from '../entities/organization';

export interface CreateAccountRequestDto {
  userId: string;
  organizationId: string;
}

export type CreateAccountResponseDto = Result<AccountDto | null>;

export class CreateAccount
  implements IUseCase<CreateAccountRequestDto, CreateAccountResponseDto>
{
  #accountRepository: IAccountRepository;

  #organizationRepository: IOrganizationRepository;

  public constructor(
    accountRepository: IAccountRepository,
    organizationRepository: IOrganizationRepository
  ) {
    this.#accountRepository = accountRepository;
    this.#organizationRepository = organizationRepository;
  }

  public async execute(
    request: CreateAccountRequestDto
  ): Promise<CreateAccountResponseDto> {
    const createResult: Result<Account | null> = this.#createAccount(request);
    if (!createResult.value) return createResult;

    try {
      const validatedRequest = await this.#validateRequest(createResult.value);
      if (validatedRequest.error) throw new Error(validatedRequest.error);

      await this.#accountRepository.insertOne(createResult.value);

      return Result.ok<AccountDto>(buildAccountDto(createResult.value));
    } catch (error: any) {
      return Result.fail<AccountDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  }

  #validateRequest = async (account: Account): Promise<Result<undefined>> => {
    const readAccountResult: AccountDto[] =
      await this.#accountRepository.findBy({
        userId: account.userId,
      });
    if (readAccountResult.length)
      return Result.fail(
        `User ${account.userId} has already an account with the id ${readAccountResult[0].id}`
      );

    const readOrganizationResult: Organization | null =
      await this.#organizationRepository.findOne(account.organizationId);

    if (!readOrganizationResult)
      return Result.fail(
        `No organization exists under id ${account.organizationId}`
      );

    return Result.ok<undefined>(undefined);
  };

  #createAccount = (
    request: CreateAccountRequestDto
  ): Result<Account | null> => {
    const accountProperties: AccountProperties = {
      id: new ObjectId().toHexString(),
      userId: request.userId,
      organizationId: request.organizationId,
    };

    return Account.create(accountProperties);
  };
}
