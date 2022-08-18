import { Account } from '../entities/account';
import IUseCase from '../services/use-case';
import { IAccountRepository } from './i-account-repository';
import { AccountDto, buildAccountDto } from './account-dto';
import Result from '../value-types/transient-types/result';
import { DbConnection } from '../services/i-db';

export interface ReadAccountRequestDto {
  accountId: string;
}

export interface ReadAccountAuthDto {
  accountId: string;
  isAdmin: boolean;
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

      if (request.accountId !== auth.accountId && !auth.isAdmin)
        throw new Error('Not authorized to perform action');

      const account: Account | null = await this.#accountRepository.findOne(
        request.accountId,
        this.#dbConnection
      );
      if (!account)
        throw new Error(`Account with id ${request.accountId} does not exist`);

      return Result.ok(buildAccountDto(account));
    } catch (error: unknown) {
      if(typeof error === 'string') return Result.fail(error);
      if(error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }
}
