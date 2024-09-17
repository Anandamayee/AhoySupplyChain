import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MongoError } from 'mongodb'; // MongoDB error type
import { Request, Response } from 'express';
import { ERROR_MESSAGES } from './errormessage.config';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();


    let message = ERROR_MESSAGES.MONGO_GENERAL_ERROR;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    switch (exception.code) {
      case 11000:
        // Duplicate key error
        message = ERROR_MESSAGES.MONGO_DUPLICATE_KEY;
        status = HttpStatus.BAD_REQUEST;
        break;
      case 121:
        // Document validation error
        message = ERROR_MESSAGES.MONGO_DOCUMENT_VALIDATION;
        status = HttpStatus.BAD_REQUEST;
        break;
      case 60:
        // Network timeout
        message = ERROR_MESSAGES.MONGO_NETWORK_TIMEOUT;
        status = HttpStatus.REQUEST_TIMEOUT;
        break;
      case 13:
        // Unauthorized
        message = ERROR_MESSAGES.MONGO_UNAUTHORIZED;
        status = HttpStatus.FORBIDDEN;
        break;
      case 9:
        // Not master
        message = ERROR_MESSAGES.MONGO_NOT_MASTER;
        status = HttpStatus.SERVICE_UNAVAILABLE;
        break;
      case 47:
        // Exceeded memory limit
        message = ERROR_MESSAGES.MONGO_EXCEEDED_MEMORY_LIMIT;
        status = HttpStatus.PAYLOAD_TOO_LARGE;
        break;
      case 103:
        // Key too long
        message = ERROR_MESSAGES.MONGO_KEY_TOO_LONG;
        status = HttpStatus.BAD_REQUEST;
        break;
      case 131:
        // Cursor not found
        message = ERROR_MESSAGES.MONGO_CURSOR_NOT_FOUND;
        status = HttpStatus.NOT_FOUND;
        break;
      case 79:
        // Write conflict
        message = ERROR_MESSAGES.MONGO_WRITE_CONFLICT;
        status = HttpStatus.CONFLICT;
        break;
      default:
        // General MongoDB error
        message = ERROR_MESSAGES.MONGO_GENERAL_ERROR;
        break;
    }


    response.status(status).json({
      status,
      message,
      error: 'DatabaseError',
      details: {
        code: exception.code,
        message: exception.message,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
