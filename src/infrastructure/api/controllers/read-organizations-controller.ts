// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadOrganizations,
  ReadOrganizationsRequestDto,
  ReadOrganizationsResponseDto,
} from '../../../domain/organization/read-organizations';
import Result from '../../../domain/value-types/transient-types/result';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class ReadOrganizationsController extends BaseController {
  #readOrganizations: ReadOrganizations;

  public constructor(readOrganizations: ReadOrganizations) {
    super();
    this.#readOrganizations = readOrganizations;
  }

  #buildRequestDto = (httpRequest: Request): Result<ReadOrganizationsRequestDto> => {
    const { name, modifiedOnStart, modifiedOnEnd, timezoneOffset } =
      httpRequest.query;

    const requestValid = this.#queryParametersValid([
      name,
      modifiedOnStart,
      modifiedOnEnd,
      timezoneOffset,
    ]);
    if (!requestValid)
      throw new Error(
        'Request query parameter are supposed to be in string format'
      );

    try {
      return Result.ok<ReadOrganizationsRequestDto>({
        name: typeof name === 'string' ? name : undefined,
        modifiedOnStart:
          typeof modifiedOnStart === 'string'
            ? this.#buildDate(modifiedOnStart)
            : undefined,
        modifiedOnEnd:
          typeof modifiedOnEnd === 'string'
            ? this.#buildDate(modifiedOnEnd)
            : undefined,
      });
    } catch (error: any) {
      return Result.fail<ReadOrganizationsRequestDto>(
        typeof error === 'string' ? error : error.message
      );
    }
  };

  #buildDate = (timestamp: string): number => {
    const date = timestamp.match(/[^T]*/s);
    const time = timestamp.match(/(?<=T)[^Z]*/s);

    if (
      !date ||
      !date[0] ||
      date[0].length !== 8 ||
      !time ||
      !time[0] ||
      time[0].length !== 6
    )
      throw new Error(`${timestamp} not in format YYYYMMDD"T"HHMMSS"Z"`);

    const year = date[0].slice(0, 4);
    const month = date[0].slice(4, 6);
    const day = date[0].slice(6, 8);

    const hour = time[0].slice(0, 2);
    const minute = time[0].slice(2, 4);
    const second = time[0].slice(4, 6);

    return Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  };

  #queryParametersValid = (parameters: unknown[]): boolean => {
    const validationResults = parameters.map(
      (parameter) => !!parameter === (typeof parameter === 'string')
    );
    return !validationResults.includes(false);
  };

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const buildDtoResult: Result<ReadOrganizationsRequestDto> =
        this.#buildRequestDto(req);

      if (buildDtoResult.error)
        return ReadOrganizationsController.badRequest(res, buildDtoResult.error);
      if (!buildDtoResult.value)
        return ReadOrganizationsController.badRequest(
          res,
          'Invalid request query paramerters'
        );

      const useCaseResult: ReadOrganizationsResponseDto =
        await this.#readOrganizations.execute(buildDtoResult.value);

      if (useCaseResult.error) {
        return ReadOrganizationsController.badRequest(res, useCaseResult.error);
      }

      return ReadOrganizationsController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: any) {
      return ReadOrganizationsController.fail(res, error);
    }
  }
}