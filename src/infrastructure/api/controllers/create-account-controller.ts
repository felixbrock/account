// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  CreateAccount,
  CreateAccountRequestDto,
  CreateAccountResponseDto,
} from '../../../domain/account/create-account';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class CreateAccountController extends BaseController {
  #createAccount: CreateAccount;

  public constructor(createAccount: CreateAccount) {
    super();
    this.#createAccount = createAccount;
  }

  #buildRequestDto = (httpRequest: Request): CreateAccountRequestDto => ({
    userId: httpRequest.body.data.userId,
    organizationId: httpRequest.body.data.organizationId
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: CreateAccountRequestDto = this.#buildRequestDto(req);
      const useCaseResult: CreateAccountResponseDto =
        await this.#createAccount.execute(requestDto);

      if (useCaseResult.error) {
        return CreateAccountController.badRequest(res, useCaseResult.error);
      }

      return CreateAccountController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: any) {
      return CreateAccountController.fail(res, error);
    }
  }
}
