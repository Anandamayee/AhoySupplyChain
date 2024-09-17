import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as ms from 'ms';
import { JwtServiceProviders } from '@app/db-utilites/jwtProviders/jwtService.providers';
import {  UserDetails } from '@app/db-utilites';
import { encryptData } from '@app/db-utilites/DbInstance.providers';

@Injectable()
export class JWTHelper {
  private readonly logger = new Logger(JWTHelper.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject('JWTSERVICE_PROVIDER')
    private readonly jwtServiceProvisers: JwtServiceProviders,
  ) {}

  public async generateJWTToken(
    request: Request,
    response: Response,
    user: UserDetails,
  ) {
    try {
      // Encrypt data using your helper function
      const data = await encryptData(
        this.configService,
        'JWT_DATA_SECRET',
        user,
      );
      // Generate the access token
      const accessToken = this.jwtService.sign(
        { data },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('ACESS_TOKEN_AGE'),
        },
      );
      // Store the refresh token in your session management service
      const session = await this.jwtServiceProvisers.storefreshToken(
        ms(this.configService.get('REFRESH_TOKEN_AGE')),
        data,
      );
      // Set cookies for the response
      response.cookie('accessToken', accessToken, {
        domain: request.hostname,
        httpOnly: true,
        sameSite: true,
        maxAge: 60 * 60 * 1000, // 1 hour
        secure: true,
      });
      response.cookie('refreshToken', session.sessionId, {
        domain: request.hostname,
        httpOnly: true,
        sameSite: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: true,
      });
      response.cookie('user', JSON.stringify(user), {
        domain: request.hostname,
        httpOnly: true,
        sameSite: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: true,
      });
      // Explicitly end the response
      response.send({
        success: true,
        GSTNumber: user.GSTNumber,
        role: user.role,
        firmName: user.firmName,
        accessToken: accessToken,
        refreshSessionId: session.sessionId,
      });
    } catch (error) {
      console.error('Error in JWTHelper.generateJWTToken():', error.stack);
      throw error;
    }
  }
}
