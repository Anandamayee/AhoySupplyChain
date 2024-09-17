import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as fs from 'fs';
import { TeaProcessModule } from './tea-process.module';
import { HttpExceptionFilter, MongoExceptionFilter } from '@app/exceptions';

async function bootstrap() {
  const app = await NestFactory.create(TeaProcessModule);
  const configService = app.get<ConfigService>(ConfigService);

  // Middleware
  app.use(cookieParser());

  // CORS Configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
    methods: 'GET,POST,PUT,DELETE,HEAD',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Security Middleware
  app.use(helmet());
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        'script-src': ["'self'"],
        'style-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'connect-src': ["'self'"],
        'font-src': ["'self'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
      },
    }),
  );

  app.use(
    helmet.frameguard({
        action: "deny"
    })
);


  // Cache Control Header
  app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
  });

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter(), new MongoExceptionFilter());

  // Set up Winston Logger globally
  const logger = new Logger('Bootstrap');
  app.useLogger(logger);

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Tea Supply Chain Management APIs')
    .setDescription(
      "The blockchain-based tea supply chain management system ensures transparency, traceability, and security from the tea plantation to the consumer. Each step in the tea supply chain is recorded on the blockchain, providing an immutable and transparent record of the tea's journey.",
    )
    .setVersion('1.0')
    .addServer(
      configService.get<string>('USER_LOCALHOST'),
      'Local environment',
    )
    .addCookieAuth(
      'accessToken',
      { type: 'apiKey', in: 'cookie' },
      'cookieAuth',
    )
    .addCookieAuth('refreshToken', { type: 'apiKey', in: 'cookie' }, 'cookie')
    .addCookieAuth('user', { type: 'apiKey', in: 'cookie' }, 'cookie')
    .build();

  if (
    configService.get<string>('NODE_ENV') === configService.get<string>('LOCAL')
  ) {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('cpc', app, document);
    const jsonOutput = JSON.stringify(document, null, 2);
    fs.writeFileSync('tea_process_swagger.json', jsonOutput);
  }

  // Start the application
  await app.listen(configService.get<string>('TEA_PORT'));
}
// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Optionally exit process with error code
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Optionally exit process with error code
  process.exit(1);
});

bootstrap();
