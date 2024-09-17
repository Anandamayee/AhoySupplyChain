import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './globalExceptionFilter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [],
})
export class ExceptionsModule {}
