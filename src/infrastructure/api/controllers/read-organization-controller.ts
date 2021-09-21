// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  ReadOrganization,
  ReadOrganizationRequestDto,
  ReadOrganizationResponseDto,
} from '../../../domain/organization/read-organization';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class ReadOrganizationController extends BaseController {
  #readOrganization: ReadOrganization;

  public constructor(readOrganization: ReadOrganization) {
    super();
    this.#readOrganization = readOrganization;
  }

  #buildRequestDto = (httpRequest: Request): ReadOrganizationRequestDto => ({
    id: httpRequest.params.organizationId,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: ReadOrganizationRequestDto = this.#buildRequestDto(req);
      const useCaseResult: ReadOrganizationResponseDto =
        await this.#readOrganization.execute(requestDto);

      if (useCaseResult.error) {
        return ReadOrganizationController.badRequest(res, useCaseResult.error);
      }

      return ReadOrganizationController.ok(res, useCaseResult.value, CodeHttp.OK);
    } catch (error: any) {
      return ReadOrganizationController.fail(res, error);
    }
  }
}
