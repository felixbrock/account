// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadAccount,
  ReadAccountRequestDto,
  ReadAccountResponseDto,
} from '../../../domain/account/read-account';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class ReadAccountController extends BaseController {
  #readAccount: ReadAccount;

  public constructor(readAccount: ReadAccount) {
    super();
    this.#readAccount = readAccount;
  }

  #buildRequestDto = (httpRequest: Request): ReadAccountRequestDto => ({
    id: httpRequest.params.accountId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: ReadAccountRequestDto = this.#buildRequestDto(req);
      const useCaseResult: ReadAccountResponseDto =
        await this.#readAccount.execute(requestDto);

      if (useCaseResult.error) {
        return ReadAccountController.badRequest(res, useCaseResult.error);
      }

      return ReadAccountController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: any) {
      return ReadAccountController.fail(res, error);
    }
  }
}
