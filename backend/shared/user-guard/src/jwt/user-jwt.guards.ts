import { JwtServiceProviders } from '@app/db-utilites/jwtProviders/jwtService.providers';
import { ERROR_MESSAGES } from '@app/exceptions';
import {
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Injectable()
export class JWTGuard extends AuthGuard('jwt') {
  logger = new Logger(JWTGuard.name);
  constructor(
    readonly jwtService: JwtService,
    @Inject('JWTSERVICE_PROVIDER')
    readonly jwtServiceProvisers: JwtServiceProviders,
    readonly configService: ConfigService,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //passport jwt stratagy validation
    try {
      if (!(await super.canActivate(context))) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVALID_ACCESSTOKEN);
      }
      return true;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`, error.stack);
      const request: Request = context.switchToHttp().getRequest();
      const response: Response = context.switchToHttp().getResponse();
      try {
        const refreshToken = request.cookies['refreshToken'];
        if (!refreshToken) {
          this.logger.warn('No refresh token provided.');
          throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_EXPIRED);
        }
        if (!(await this.jwtServiceProvisers.isValidSession(refreshToken))) {
          throw new UnauthorizedException(ERROR_MESSAGES.INVALID_SESSION);
        }
        const payload =
          await this.jwtServiceProvisers.getSessionPayload(refreshToken);

        const newAccessToken = await this.jwtService.sign(
          { payload },
          {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('ACESS_TOKEN_AGE'),
          },
        );
        response.cookie('accessToken', newAccessToken, {
          domain: request.hostname,
          httpOnly: true,
          sameSite: true,
          maxAge: 60 * 60 * 1000,
          secure: true,
        });

        return true;
      } catch (refreshError) {
        this.logger.error(`Error during token refresh: ${refreshError.message}`, refreshError.stack);
        response.clearCookie('accessToken');
        response.clearCookie('refreshToken');
        response.clearCookie('user');
        throw new UnauthorizedException(ERROR_MESSAGES.SESSION_EXPIRED);
      }
    }
  }
}
