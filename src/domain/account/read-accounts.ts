import { Account } from '../entities/account';
import IUseCase from '../services/use-case';
import { IAccountRepository, AccountQueryDto } from './i-account-repository';
import { AccountDto, buildAccountDto } from './account-dto';
import Result from '../value-types/transient-types/result';
import { DbConnection } from '../services/i-db';

export interface ReadAccountsRequestDto {
  modifiedOnStart?: number;
  modifiedOnEnd?: number;
  targetUserId?: string;
}

export interface ReadAccountsAuthDto {
  callerUserId?: string;
  isSystemInternal: boolean;
}

export type ReadAccountsResponseDto = Result<AccountDto[]>;

export class ReadAccounts
  implements
    IUseCase<
      ReadAccountsRequestDto,
      ReadAccountsResponseDto,
      ReadAccountsAuthDto,
      DbConnection
    >
{
  #accountRepository: IAccountRepository;

  #dbConnection: DbConnection;

  constructor(accountRepository: IAccountRepository) {
    this.#accountRepository = accountRepository;
  }

  async execute(
    request: ReadAccountsRequestDto,
    auth: ReadAccountsAuthDto,
    dbConnection: DbConnection
  ): Promise<ReadAccountsResponseDto> {
    try {
      if (auth.isSystemInternal && !request.targetUserId)
        throw new Error('Target user id missing');
      if (!auth.isSystemInternal && !auth.callerUserId)
        throw new Error('Caller user id missing');
      if (!request.targetUserId && !auth.callerUserId)
        throw new Error('No user Id instance provided');

      let userId: string;
      if (auth.isSystemInternal && request.targetUserId)
        userId = request.targetUserId;
      else if (auth.callerUserId)
        userId = auth.callerUserId;
      else throw new Error('Unhandled organizationId allocation');

      this.#dbConnection = dbConnection;

      const accounts: Account[] = await this.#accountRepository.findBy(
        this.#buildAccountQueryDto(request, userId),
        this.#dbConnection
      );
      if (!accounts) throw new Error(`Queried accounts do not exist`);

      return Result.ok(accounts.map((account) => buildAccountDto(account)));
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  #buildAccountQueryDto = (
    request: ReadAccountsRequestDto,
    userId: string
  ): AccountQueryDto => {
    const queryDto: AccountQueryDto = { userId};

    if (request.modifiedOnStart)
      queryDto.modifiedOnStart = request.modifiedOnStart;
    if (request.modifiedOnEnd) queryDto.modifiedOnEnd = request.modifiedOnEnd;

    return queryDto;
  };
}
