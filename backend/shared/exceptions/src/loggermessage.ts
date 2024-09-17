import { LoggerService } from "@nestjs/common";
import { createLogger ,format ,transports } from "winston";

export class WinstonLogger implements LoggerService {
  private readonly logger = createLogger({
    level: 'info', // Set the logging level
    format: format.combine(
      format.timestamp(),
      format.json(),
    ),
    transports: [
      new transports.File({ filename: 'cpc.log' }),
    ],
  });

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }
}