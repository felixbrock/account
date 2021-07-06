// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadAccounts,
  ReadAccountsRequestDto,
  ReadAccountsResponseDto,
} from '../../../domain/account/read-accounts';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class ReadAccountsController extends BaseController {
  #readAccounts: ReadAccounts;

  public constructor(readAccounts: ReadAccounts) {
    super();
    this.#readAccounts = readAccounts;
  }

  #buildRequestDto = (httpRequest: Request): Result<ReadAccountsRequestDto> => {
    const { userId } = httpRequest.query;

    const requestValid = this.#queryParametersValid([userId]);
    if (!requestValid)
      return Result.fail<ReadAccountsRequestDto>(
        'Request query parameter are supposed to be in string format'
      );

    try {
      return Result.ok<ReadAccountsRequestDto>({
        userId: typeof userId === 'string' ? userId : undefined,
      });
    } catch (error) {
      return Result.fail<ReadAccountsRequestDto>(error.message);
    }
  };

  #queryParametersValid = (parameters: unknown[]): boolean => {
    const validationResults = parameters.map(
      (parameter) => !!parameter === (typeof parameter === 'string')
    );
    return !validationResults.includes(false);
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<ReadAccountsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return ReadAccountsController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return ReadAccountsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const useCaseResult: ReadAccountsResponseDto =
        await this.#readAccounts.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return ReadAccountsController.badRequest(res, useCaseResult.error);
      }

      return ReadAccountsController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error) {
      return ReadAccountsController.fail(res, error);
    }
  }
}
