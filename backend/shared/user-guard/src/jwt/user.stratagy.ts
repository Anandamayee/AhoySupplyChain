import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger } from '@nestjs/common';
import { decryptData } from '@app/db-utilites/DbInstance.providers';

@Injectable()
export class UserStratagy extends PassportStrategy(Strategy) {
  logger = new Logger(UserStratagy.name);
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {

          return request.cookies['accessToken'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // this.logger.log("payload...",payload)
    const { dataObject } = await decryptData(
      this.configService,
      'JWT_DATA_SECRET',
      payload.data,
    );
    return dataObject?.GSTNumber ? payload.data : null;
  }
}
