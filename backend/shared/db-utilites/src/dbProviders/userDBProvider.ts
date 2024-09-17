import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDTO, LoginUserDTO } from '../Model/UserModel/UserDTO';
import { UserDetails } from '../Model/UserModel/UserModel';
import { UserSchema } from '../Model/UserModel/UserSchema';
import { UserkeySchema } from '../Model/UserModel/UserKeySchema';
import { UserKeyModel } from '../Model/UserModel/UserKeyModel';

@Injectable()
export class UserDBProvider {
  private readonly saltOrRound = 10;
  private readonly logger = new Logger(UserDBProvider.name);
  constructor(
    @InjectModel('User') private userModel: Model<typeof UserSchema>,
    @InjectModel('UserKey') private userKeyModel: Model<typeof UserkeySchema>,
  ) {}

  public async addUser(user: CreateUserDTO,transactionHash :string): Promise<UserDetails | any> {
    try {
      const userDetails: any = await this.userModel
        .findOne({ GSTNumber: user.GSTNumber })
        .exec();
      if (userDetails) {
        throw new BadRequestException(`${user.GSTNumber} already exist`);
      }
      const salt = await bcrypt.genSalt(this.saltOrRound);
      this.logger.log('salt', salt);
      const newUser = {
        ...user,
        password: await bcrypt.hash(user.password, salt),
        registerTeaTokenPlayersTxHash:transactionHash
      };
      this.logger.log('newUser', newUser);
      const data = new this.userModel(newUser);
      const { password, ...result } = data['_doc'];
      this.logger.log('data', result);
      await data.save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async validateUser(user: LoginUserDTO): Promise<UserDetails> {
    try {
      const userDetails: any = await this.userModel
        .findOne({ GSTNumber: user.GSTNumber })
        .exec();
      if (!userDetails) {
        throw new NotFoundException(`${user.GSTNumber} not found`);
      }
      const isMatch = await bcrypt.compare(user.password, userDetails.password);
      if (!isMatch) {
        throw new UnauthorizedException(`User name or password doesn't match`);
      }
      const { password, ...result } = userDetails['_doc'];
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async findUser(GSTNumber: string): Promise<UserDetails> {
    try {
      const userDetails: any = await this.userModel
        .findOne({ GSTNumber: GSTNumber })
        .exec();
      if (!userDetails) {
        throw new NotFoundException(`${GSTNumber} not found`);
      }
      const { password, ...result } = userDetails['_doc'];
      return result;
    } catch (error) {
      throw error;
    }
  }
  public async findUserKey(GSTNumber: string): Promise<UserKeyModel> {
    try {
      this.logger.debug('findUserKey : GSTNumber,',GSTNumber)
      const userDetails: any = await this.userKeyModel
        .findOne({ GSTNumber: GSTNumber })
        .exec();
      if (!userDetails) {
        throw new NotFoundException(`${GSTNumber} not found`);
      }
      return userDetails;
    } catch (error) {
      throw error;
    }
  }
  public async createUserKey(
    userKeydetails: UserKeyModel,
  ): Promise<UserKeyModel | any> {
    try {
      const data = new this.userKeyModel(userKeydetails);
      return data.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks if a user exists in the database based on the provided GSTNumber.
   * @param GSTNumber - The GST Number of the user to look up.
   * @returns A boolean indicating if the user exists or not.
   */
  public async getUser(GSTNumber: string): Promise<boolean> {
    try {
      const userDetails = await this.userModel.findOne({ GSTNumber :GSTNumber}).exec();

      // If the user is found, return true
      if (userDetails) {
        return true;
      }

      // If no user is found, return false
      return false;
    } catch (error) {
      this.logger.error('Error in getUser method', error);
      throw error;
    }
  }
}
