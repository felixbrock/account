import { Account } from '../entities/account';
import IUseCase from '../services/use-case';
import { IAccountRepository } from './i-account-repository';
import { AccountDto, buildAccountDto } from './account-dto';
import Result from '../value-types/transient-types/result';
import { DbConnection } from '../services/i-db';

export interface ReadAccountRequestDto {
  targetAccountId: string;
}

export interface ReadAccountAuthDto {
  callerAccountId?: string;
  isSystemInternal: boolean;
}

export type ReadAccountResponseDto = Result<AccountDto>;

export class ReadAccount
  implements
    IUseCase<ReadAccountRequestDto, ReadAccountResponseDto, ReadAccountAuthDto, DbConnection>
{
  #accountRepository: IAccountRepository;

  #dbConnection: DbConnection;

  constructor(accountRepository: IAccountRepository) {
    this.#accountRepository = accountRepository;
  }

  async execute(
    request: ReadAccountRequestDto,
    auth: ReadAccountAuthDto,
    dbConnection: DbConnection
  ): Promise<ReadAccountResponseDto> {
    try {
    this.#dbConnection = dbConnection;

      if (auth.callerAccountId && request.targetAccountId !== auth.callerAccountId && !auth.isSystemInternal)
        throw new Error('Not authorized to perform action');

      const account: Account | null = await this.#accountRepository.findOne(
        request.targetAccountId,
        this.#dbConnection
      );
      if (!account)
        throw new Error(`Account with id ${request.targetAccountId} does not exist`);

      return Result.ok(buildAccountDto(account));
    } catch (error: unknown) {
      if(typeof error === 'string') return Result.fail(error);
      if(error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
