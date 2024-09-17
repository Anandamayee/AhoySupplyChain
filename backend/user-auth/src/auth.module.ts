import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Module,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DbUtilitesModule } from '@app/db-utilites';
import { UserGuardsModule } from '@app/user-guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import * as https from 'https';
import { JWTHelper } from './jwtHelper';
import { EthUtilitesModule } from '@app/eth-utilites';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    // Modify the response object with the exception message
    response.status(status).json({
      statusCode: status,
      message: exception.message, // Access the exception message
      error: exception, // Optional: Include the full exception object (for debugging)
    });
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      // envFilePath: 'config.env', 
      isGlobal: true,
    }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.get<boolean>('AUTH_LOCALHOST')
          ? {}
          : {
              httpsAgent: new https.Agent({
                rejectUnauthorized: false,
              }),
            };
      },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: 3600,
          },
        };
      },
    }),
    DbUtilitesModule,
    UserGuardsModule,
    EthUtilitesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JWTHelper],
})
export class AuthModule {}
