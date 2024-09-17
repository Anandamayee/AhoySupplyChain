import { CreateUserDTO, LoginUserDTO, UserDetails } from '@app/db-utilites';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JWTHelper } from './jwtHelper';
import { UserDBProvider } from '@app/db-utilites/dbProviders/userDBProvider';
import { Request, Response } from 'express';
import { BlockchainHelper } from '@app/eth-utilites';
import { ERROR_MESSAGES } from '@app/exceptions';
import { SOLIDITY_METHODS } from '@app/db-utilites/Enums/enums';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject('USERDB_PROVIDER') private readonly userDBProvider: UserDBProvider,
    private readonly jWTHelper: JWTHelper,
    @Inject('BESU_HELPER') private readonly blockchainHelper: BlockchainHelper,
  ) {}

  /**
   * Method to create user in Blockchain and DB
   * @param createUser
   * @returns
   */
  public async createUser(createUser: CreateUserDTO): Promise<UserDetails> {
    try {
      this.logger.debug('validate if same user already exist or not');
      const existingUser = await this.userDBProvider?.getUser(
        createUser.GSTNumber,
      );
      this.logger.debug(`existingUser: ${existingUser}`);

      if (existingUser) {
        this.logger.debug(
          'If user already exists, throw a BadRequestException',
        );
        // If user already exists, throw a BadRequestException
        throw new BadRequestException(
          `${ERROR_MESSAGES.USER_EXIST} ${createUser.GSTNumber} .`,
        );
      }

      // Execute the blockchain transaction using the separate method
      this.logger.debug('Creating user in blockchain');
      const transactionHash = await this.registerUserOnBlockchain(createUser);
      this.logger.debug('----', transactionHash);

      // If the blockchain transaction was successful, proceed to add the user in the database
      this.logger.debug('Creating user in the database');
      const newUser = await this.userDBProvider.addUser(createUser,transactionHash);
      this.logger.debug('User created successfully in database');
      return newUser; 
    } catch (error) {
      this.logger.error('Error creating user in database', error);
      throw error;
    }
  }

  public async signInUser(
    request: Request,
    userDetails: LoginUserDTO,
    response: Response,
  ) {
    this.logger.debug('AuthService.signInUser() Invoked');
    try {
      const user = await this.userDBProvider?.validateUser(userDetails);
      await this.jWTHelper.generateJWTToken(request, response, user);
    } catch (error) {
      this.logger.debug(
        'Exception occured in AuthService.signInUser() Invoked',
        error,
      );
      throw new UnauthorizedException(ERROR_MESSAGES.USET_NOTFOUND);
    }
  }

  public async getUser(
    GSTNumber: string,
    request: Request,
  ): Promise<UserDetails> {
    try {
      if (JSON.parse(request.cookies?.user)?.GSTNumber !== GSTNumber) {
        throw new UnauthorizedException(
          `${ERROR_MESSAGES.UNAUTTHORIZED_ACCESS}`,
        );
      }

      let user = this.userDBProvider?.findUser(GSTNumber);
      if (!user)
        throw new UnauthorizedException(
          `${ERROR_MESSAGES.USER_NOT_FOUND} ${GSTNumber} .`,
        );
      return user;
    } catch (error) {
      throw error;
    }
  }

  // ------------------HELPER METHODS----------------------------//

  /**
   * Helper method to register user in blockchain with retyr logic
   * @param createUser
   * @returns transactionHash
   */
  private async registerUserOnBlockchain(
    createUser: CreateUserDTO,
  ): Promise<string> {
    const maxRetries = 3; // You can make this configurable via environment variables
    let attempt = 0;
    let transactionSuccess = false;
    let transactionHash = '';

    while (attempt < maxRetries && !transactionSuccess) {
      try {
        attempt++;
        this.logger.debug(`Blockchain transaction attempt: ${attempt}`);

        // NotE: send GST of sender as first argument always 

        // Simulate the blockchain transaction
        const result = await this.blockchainHelper.sendTransaction(
          SOLIDITY_METHODS.registerTeaTokenPlayers,
          createUser.GSTNumber,
          createUser.name,
          createUser.firmName,
          createUser.address,
          createUser.GSTNumber,
          createUser.mobileNumber,
          createUser.role,
        );

        transactionHash = result.transactionHash;
        this.logger.debug(
          `Transaction successful with hash: ${transactionHash}`,
        );
        transactionSuccess = true;
      } catch (blockchainError) {
        this.logger.error(
          `Blockchain transaction failed on attempt ${attempt}`,
          blockchainError,
        );

        if (attempt >= maxRetries) {
          this.logger.error('Max retries reached, throwing an exception');
          throw new BadRequestException(
            'Failed to register user in blockchain after multiple attempts.',
          );
        }
      }
    }

    return transactionHash;
  }
}
