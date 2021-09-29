// TODO: Violation of control flow. DI for express instead
import { Request, Response } from 'express';
import {
  CreateOrganization,
  CreateOrganizationRequestDto,
  CreateOrganizationResponseDto,
} from '../../../domain/organization/create-organization';
import { BaseController, CodeHttp } from '../../shared/base-controller';

export default class CreateOrganizationController extends BaseController {
  #createOrganization: CreateOrganization;

  public constructor(createOrganization: CreateOrganization) {
    super();
    this.#createOrganization = createOrganization;
  }

  #buildRequestDto = (httpRequest: Request): CreateOrganizationRequestDto => ({
    name: httpRequest.body.data.name,
  });

  protected async executeImpl(req: Request, res: Response): Promise<Response> {
    try {
      const requestDto: CreateOrganizationRequestDto = this.#buildRequestDto(req);
      const useCaseResult: CreateOrganizationResponseDto =
        await this.#createOrganization.execute(requestDto);

      if (useCaseResult.error) {
        return CreateOrganizationController.badRequest(res, useCaseResult.error);
      }

      return CreateOrganizationController.ok(
        res,
        useCaseResult.value,
        CodeHttp.CREATED
      );
    } catch (error: any) {
      return CreateOrganizationController.fail(res, error);
    }
  }
}
