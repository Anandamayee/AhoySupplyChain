import { Module, SetMetadata } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DbUtilitesModule } from '@app/db-utilites';
import { UserStratagy } from './jwt/user.stratagy';
import { JWTGuard } from './jwt/user-jwt.guards';
import { RolesGuardJWT } from './jwt/user-role.guard';
import { NoAuthGuard } from './noAuth/noAUth.guard';
import { PassportModule } from '@nestjs/passport';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
export const IS_PUBLIC_KEY = 'isPublic';
export const NoAuth = () => SetMetadata(IS_PUBLIC_KEY, true);

@Module({
  imports: [
    PassportModule.register({ session: true }),
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
  ],
  providers: [
    UserStratagy,
    JWTGuard,
    ConfigService,
    RolesGuardJWT,
    NoAuthGuard,
  ],
  exports: [JwtModule, UserStratagy, JWTGuard, RolesGuardJWT],
})
export class UserGuardsModule {}
