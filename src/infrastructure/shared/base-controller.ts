import { Request, Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { appConfig } from '../../config';
import {
  ReadAccounts,
  ReadAccountsResponseDto,
} from '../../domain/account/read-accounts';
import { DbConnection } from '../../domain/services/i-db';
import Result from '../../domain/value-types/transient-types/result';

export enum CodeHttp {
  OK = 200,
  CREATED,
  BAD_REQUEST = 400,
  UNAUTHORIZED,
  FORBIDDEN = 403,
  NOT_FOUND,
  CONFLICT = 409,
  SERVER_ERROR = 500,
}

export interface UserAccountInfo {
  userId?: string;
  accountId?: string;
  callerOrgId?: string;
  isAdmin: boolean;
  isSystemInternal: boolean;
}

export abstract class BaseController {
  static jsonResponse(res: Response, code: number, message: string): Response {
    return res.status(code).json({ message });
  }

  async execute(req: Request, res: Response): Promise<void | Response> {
    try {
      await this.executeImpl(req, res);
    } catch (error) {
      BaseController.fail(res, 'An unexpected error occurred');
    }
  }

  static async getUserAccountInfo(
    jwt: string,
    readAccounts: ReadAccounts,
    dbConnection: DbConnection
  ): Promise<Result<UserAccountInfo>> {
    if (!jwt) return Result.fail('Unauthorized');

    try {
      const client = jwksClient({
        jwksUri: `https://cognito-idp.${appConfig.cloud.region}.amazonaws.com/${appConfig.cloud.userPoolId}/.well-known/jwks.json`,
      });

      const unverifiedDecodedAuthPayload = jsonwebtoken.decode(jwt, {
        json: true,
        complete: true,
      });

      if (!unverifiedDecodedAuthPayload) return Result.fail('Unauthorized');

      const { kid } = unverifiedDecodedAuthPayload.header;

      if (!kid) return Result.fail('Unauthorized');

      const key = await client.getSigningKey(kid);
      const signingKey = key.getPublicKey();

      const authPayload = jsonwebtoken.verify(jwt, signingKey, {
        algorithms: ['RS256'],
      });

      if (typeof authPayload === 'string')
        return Result.fail('Unexpected auth payload format');

      const isSystemInternal = authPayload.scope
        ? authPayload.scope.includes('system-internal/system-internal')
        : false;

      const isAdmin = authPayload['cognito:groups']
        ? authPayload['cognito:groups'].includes('admin')
        : false;

      if (isSystemInternal && isAdmin)
        return Result.fail(
          'Unauthorized - Conflicting caller authorization groups'
        );

      if (!authPayload.username && !isSystemInternal)
        return Result.fail('Unauthorized');

      if (isSystemInternal)
        return Result.ok({
          userId: undefined,
          accountId: undefined,
          callerOrgId: undefined,
          isAdmin,
          isSystemInternal,
        });

      const readAccountsResult: ReadAccountsResponseDto =
        await readAccounts.execute(
          { targetUserId: authPayload.username },
          { isSystemInternal: true },
          dbConnection
        );

      if (!readAccountsResult.value)
        throw new Error(`No account found for ${authPayload.username}`);
      if (!readAccountsResult.value.length)
        throw new Error(`No account found for ${authPayload.username}`);

      return Result.ok({
        userId: authPayload.username,
        accountId: readAccountsResult.value[0].id,
        callerOrgId: readAccountsResult.value[0].organizationId,
        isAdmin,
        isSystemInternal,
      });
    } catch (error: unknown) {
      if (typeof error === 'string') return Result.fail(error);
      if (error instanceof Error) return Result.fail(error.message);
      return Result.fail('Unknown error occured');
    }
  }

  static ok<T>(res: Response, dto?: T, created?: CodeHttp): Response {
    const codeHttp: CodeHttp = created || CodeHttp.OK;
    if (dto) {
      res.type('application/json');

      return res.status(codeHttp).json(dto);
    }
    return res.status(codeHttp).json({});
  }

  static badRequest(res: Response, message?: string): Response {
    return BaseController.jsonResponse(
      res,
      CodeHttp.BAD_REQUEST,
      message || 'BadRequest'
    );
  }

  static unauthorized(res: Response, message?: string): Response {
    return BaseController.jsonResponse(
      res,
      CodeHttp.UNAUTHORIZED,
      message || 'Unauthorized'
    );
  }

  static notFound(res: Response, message?: string): Response {
    return BaseController.jsonResponse(
      res,
      CodeHttp.NOT_FOUND,
      message || 'Not found'
    );
  }

  static fail(res: Response, error: Error | string): Response {
    return res.status(CodeHttp.SERVER_ERROR).json({
      message: error.toString(),
    });
  }

  protected abstract executeImpl(
    req: Request,
    res: Response
  ): Promise<Response>;
}
