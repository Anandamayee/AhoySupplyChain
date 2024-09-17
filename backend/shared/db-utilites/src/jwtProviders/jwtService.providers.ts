import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from '../Model/SessionModel/session';
import { RefreshTokenSchema } from '../Model/SessionModel/sessionSchema';
import { v4 as uuidv4 } from 'uuid';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class JwtServiceProviders {
  constructor(
    @InjectModel('Session')
    private readonly refreshTokenModel: Model<typeof RefreshTokenSchema>,
  ) {}
  logger = new Logger(JwtServiceProviders.name);

  /**
   * Creates a new refresh token and stores it in the database.
   * @param ageInMS - The expiration time of the token in milliseconds.
   * @param payload - The data to be associated with the token.
   * @returns The created session object.
   */
  public async storefreshToken(
    ageInMS: number,
    payload: string,
  ): Promise<Session | any> {
    try {
      const id = uuidv4();
      const validUntilDate = new Date(Date.now() + ageInMS);
      return await this.refreshTokenModel.create({
        sessionId: id.toString(),
        payload,
        validUntil: validUntilDate,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves the payload data associated with a given session ID.
   * @param sessionId - The ID of the session whose payload is to be retrieved.
   * @returns The payload associated with the session ID.
   */

  public async getSessionPayload(sessionId: string): Promise<string> {
    try {
      const session = await this.refreshTokenModel
        .findOne({ sessionId })
        .select('payload')
        .exec();
      return session['_doc'].payload;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks if a given session ID is valid based on the expiration time.
   * @param sessionId - The ID of the session to be checked.
   * @returns True if the session is valid, otherwise false.
   */

  public async isValidSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.refreshTokenModel
        .findOne({
          sessionId,
          validUntile: { $gte: new Date() },
        })
        .exec();
      return !!session;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deletes a session based on its session ID.
   * @param sessionId - The ID of the session to be deleted.
   */

  public async deleteSession(sessionId: string): Promise<void> {
    await this.refreshTokenModel.findByIdAndDelete(sessionId);
  }

  /**
   * Deletes all expired sessions from the database.
   */
  public async deleteExpiredSession(): Promise<void> {
    const result = await this.refreshTokenModel.deleteMany({
      validUntile: { $lt: Date.now() },
    });
    this.logger.log(`Deleted ${result.deletedCount} expired sessions.`);
  }

  /**
   * Refreshes a session by creating a new refresh token and updating the session.
   * @param sessionId - The ID of the session to be refreshed.
   * @returns The new session object.
   */

  public async refreshToken(sessionId: string): Promise<Session | any> {
    try {
      const session: Session = await this.refreshTokenModel.findById(sessionId);
      if (!session) {
        throw new UnauthorizedException('User Not Found');
      }
      const age = 60 * 60;
      return this.storefreshToken(age, session.payload);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Periodically deletes expired sessions from the database.
   * This method runs every hour according to the CronExpression.
   */
  
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    try {
      await this.refreshTokenModel.deleteMany({
        validUntile: { $lt: Date.now() },
      });
    } catch (error) {
      throw error;
    }
  }
}
