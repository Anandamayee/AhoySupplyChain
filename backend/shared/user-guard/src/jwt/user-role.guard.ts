import { Inject, Logger, SetMetadata } from '@nestjs/common';

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JWTGuard } from './user-jwt.guards';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtServiceProviders } from '@app/db-utilites/jwtProviders/jwtService.providers';

@Injectable()
export class RolesGuardJWT extends JWTGuard implements CanActivate {
  logger = new Logger(RolesGuardJWT.name);
  constructor(
    private readonly reflector: Reflector,
    jwtService: JwtService,
    @Inject('JWTSERVICE_PROVIDER') jwtServiceProvisers: JwtServiceProviders,
    readonly configService: ConfigService,
  ) {
    super(jwtService, jwtServiceProvisers, configService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return false;
    }
    await super.canActivate(context); // First run the JWT Auth Guard
    const request = context.switchToHttp().getRequest();
    const user = JSON.parse(request.cookies?.user);
    return roles.includes(user.role);
  }
}
