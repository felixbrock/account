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
import Dbo from '../../persistence/db/mongo-db';
import {
  BaseController,
  CodeHttp,
  UserAccountInfo,
} from '../../shared/base-controller';

export default class CreateAccountController extends BaseController {
  #createAccount: CreateAccount;

  #readAccounts: ReadAccounts;

  readonly #dbo: Dbo;

  constructor(createAccount: CreateAccount, readAccounts: ReadAccounts, dbo: Dbo) {
    super();
    this.#createAccount = createAccount;
    this.#readAccounts = readAccounts;
    this.#dbo = dbo;
  }

  #buildRequestDto = (httpRequest: Request): CreateAccountRequestDto => ({
    targetUserId: httpRequest.body.userId,
    targetOrganizationId: httpRequest.body.organizationId,
  });

  #buildAuthDto = (userAccountInfo: UserAccountInfo): CreateAccountAuthDto => ({
    isSystemInternal: userAccountInfo.isSystemInternal,
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
          this.#readAccounts, this.#dbo.dbConnection
        );

      if (!getUserAccountInfoResult.success)
        return CreateAccountController.unauthorized(
          res,
          getUserAccountInfoResult.error
        );
      if (!getUserAccountInfoResult.value)
        throw new Error('Authorization failed');

      if(!getUserAccountInfoResult.value.isSystemInternal)
          return CreateAccountController.unauthorized(res, 'Not authorized to perform action');

      const requestDto: CreateAccountRequestDto = this.#buildRequestDto(req);
      const authDto: CreateAccountAuthDto = this.#buildAuthDto(
        getUserAccountInfoResult.value
      );

      const useCaseResult: CreateAccountResponseDto =
        await this.#createAccount.execute(requestDto, authDto, this.#dbo.dbConnection);

      if (!useCaseResult.success) {
        return CreateAccountController.badRequest(res, useCaseResult.error);
      }

      return CreateAccountController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: unknown) {
      console.error(error);
      if(typeof error === 'string') return CreateAccountController.fail(res, error);
      if(error instanceof Error) return CreateAccountController.fail(res, error);
      return CreateAccountController.fail(res,'Unknown error occured');
    }
  }
}
