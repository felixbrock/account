import { Account } from '../entities/account';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import {IAccountRepository} from './i-account-repository';
import {AccountDto, buildAccountDto } from './account-dto';

export interface ReadAccountRequestDto {
  id: string;
}

export type ReadAccountResponseDto = Result<AccountDto | null>;

export class ReadAccount
  implements IUseCase<ReadAccountRequestDto, ReadAccountResponseDto>
{
  #accountRepository: IAccountRepository;

  public constructor(accountRepository: IAccountRepository) {
    this.#accountRepository = accountRepository;
  }

  public async execute(
    request: ReadAccountRequestDto
  ): Promise<ReadAccountResponseDto> {
    try {
      const account: Account | null =
        await this.#accountRepository.findOne(request.id);
      if (!account)
        throw new Error(
          `Account with id ${request.id} does not exist`
        );

      return Result.ok<AccountDto>(
        buildAccountDto(account)
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }
}
