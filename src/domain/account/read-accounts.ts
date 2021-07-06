import { Account } from '../entities/account';
import IUseCase from '../services/use-case';
import Result from '../value-types/transient-types/result';
import {IAccountRepository, AccountQueryDto } from './i-account-repository';
import {AccountDto, buildAccountDto } from './account-dto';

export interface ReadAccountsRequestDto {
  userId?: string;
}

export type ReadAccountsResponseDto = Result<AccountDto[] | null>;

export class ReadAccounts
  implements IUseCase<ReadAccountsRequestDto, ReadAccountsResponseDto>
{
  #accountRepository: IAccountRepository;

  public constructor(accountRepository: IAccountRepository) {
    this.#accountRepository = accountRepository;
  }

  public async execute(request: ReadAccountsRequestDto): Promise<ReadAccountsResponseDto> {
    try {
      const accounts: Account[] | null =
        await this.#accountRepository.findBy(this.#buildAccountQueryDto(request));
      if (!accounts) throw new Error(`Queried accounts do not exist`);

      return Result.ok<AccountDto[]>(
        accounts.map((account) => buildAccountDto(account))
      );
    } catch (error) {
      return Result.fail<null>(error.message);
    }
  }



  #buildAccountQueryDto = (
    request: ReadAccountsRequestDto
  ): AccountQueryDto => 
  {

    const queryDto : AccountQueryDto = {};

    if(request.userId) queryDto.userId = request.userId;
    
    return queryDto;
  };
}
