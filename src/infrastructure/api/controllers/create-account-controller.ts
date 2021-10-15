// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  CreateAccount,
  CreateAccountAuthDto,
  CreateAccountRequestDto,
  CreateAccountResponseDto,
} from '../../../domain/account/create-account';
import { ReadAccounts } from '../../../domain/account/read-accounts';
import Result from '../../../domain/value-types/transient-types/result';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateAccountController extends BaseController {
  #createAccount: CreateAccount;

  #readAccounts: ReadAccounts;

  public constructor(createAccount: CreateAccount, readAccounts: ReadAccounts) {
    super();
    this.#createAccount = createAccount;
    this.#readAccounts = readAccounts;
  }

  #buildRequestDto = (httpRequest: Request): CreateAccountRequestDto => ({
    userId: httpRequest.body.userId,
    organizationId: httpRequest.body.organizationId,
  });

  #buildAuthDto = (userAccountInfo: UserAccountInfo): CreateAccountAuthDto => ({
    isAdmin: userAccountInfo.isAdmin,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader)
        return CreateAccountController.unauthorized(res, 'Unauthorized');

      const jwt = authHeader.split(' ')[1];

      const getUserAccountInfoResult: Result<UserAccountInfo> =
        await CreateAccountController.getUserAccountInfo(
          jwt,
          this.#readAccounts
        );

      if (!getUserAccountInfoResult.success)
        return CreateAccountController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      const requestDto: CreateAccountRequestDto = this.#buildRequestDto(req);
      const authDto: CreateAccountAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: CreateAccountResponseDto =
        await this.#createAccount.execute(requestDto, authDto);

      if (!useCaseResult.success) {
        return CreateAccountController.badRequest(res, useCaseResult.error);
      }

      return CreateAccountController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: unknown) {
      if(typeof error === 'string') return CreateAccountController.fail(res, error);
      if(error instanceof Error) return CreateAccountController.fail(res, error);
      return CreateAccountController.fail(res,'Unknown error occured');
    }
  }
}
