// src/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ERROR_MESSAGES } from './errormessage.config';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine message based on status code
    const message = ERROR_MESSAGES[status] || ERROR_MESSAGES[500];
    
    // Log the exception details
    this.logger.log('Unhandled exception:', exception);

    response.status(status).json({
      statusCode: status,
      message: exception instanceof HttpException ? exception.getResponse() : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
