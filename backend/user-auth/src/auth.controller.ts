import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateUserDTO,
  LoginResposne,
  LoginUserDTO,
  UserDetails,
  UserRole,
} from '@app/db-utilites';
import { Request, Response } from 'express';
import { NoAuth, Roles, RolesGuardJWT } from '@app/user-guard';
// import { LoginResposne, UserDetails } from '../../shared/db-utilites/src/Model/UserModel/UserModel';

@Controller('auth')
@ApiTags('UserAuth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  
  /**
   * Registers a new user to the blockchain.
   * @param request - The request object.
   * @param createUser - The DTO containing user registration details.
   * @returns A promise resolving to the details of the created user.
   */
  @ApiOperation({
    summary: 'Register User to Blockchain',
  })
  @ApiBody({ type: CreateUserDTO })
  @ApiResponse({
    status: 201,
    description: 'User Registered Sucessfully',
  })
  @NoAuth()
  @Post('/signUp')
  RegisterUser(
    @Req() request: Request,
    @Body() createUser: CreateUserDTO,
  ): Promise<UserDetails> {
    try{
      return this.authService.createUser(createUser);
    }
    catch(error){
      throw error
    }
    
  }

  /**
   * Logs in a user.
   * @param request - The request object.
   * @param signInUser - The DTO containing user login details.
   * @param response - The response object used to send tokens.
   * @returns A promise resolving to the login response.
   */

  @ApiOperation({
    summary: 'User Login',
  })
  @ApiBody({ type: LoginUserDTO })
  @ApiResponse({
    type: LoginResposne,
    status: 201,
    description: 'Logined sucessfully ',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @NoAuth()
  @Post('/signIn')
  async SignInUser(
    @Req() request: Request,
    @Body() signInUser: LoginUserDTO,
    @Res() response: Response,
  )  {
    try{
       await this.authService.signInUser(request, signInUser, response);
    }
    catch(error){
      throw error
    }
    
  }

   /**
   * Logs out a user by clearing session or token cookies.
   * @param request - The request object.
   * @param response - The response object used to clear cookies.
   */

  @ApiOperation({
    summary: 'Logout user',
  })
  @ApiResponse({
    status: 201,
    description: 'Loged Out sucessfully',
  })
  @Roles(
    UserRole.FARMER,
    UserRole.PROCESSOR,
    UserRole.RETAILER,
    UserRole.TRANSPORTER,
  )
  @UseGuards(RolesGuardJWT)
  @Get('/logout')
  Logout(@Req() request: Request, @Res() response: Response) {
    // Clear session or token from cookie on logout
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    response.clearCookie('user');
    response.send("LogedOut")
  }

   /**
   * Retrieves user details based on the provided GST number.
   * @param request - The request object.
   * @param GSTNumber - The GST number of the user.
   * @returns A promise resolving to the user details.
   */

  @ApiOperation({
    summary: 'Get user details',
  })
  @ApiParam({ name: 'GSTNumber', description: '22AAAAA0000A1Z5' })
  @ApiResponse({
    status: 201,
    description: 'User details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(
    UserRole.FARMER,
    UserRole.PROCESSOR,
    UserRole.RETAILER,
    UserRole.TRANSPORTER,
  )
  @UseGuards(RolesGuardJWT)
  @Get('/userDetails/:GSTNumber')
  getUserDetails(
    @Req() request: Request,
    @Param('GSTNumber') GSTNumber: string,
  ): Promise<UserDetails> {
    try{
      return this.authService.getUser(GSTNumber,request);
    }
    catch(error){
      throw error
    }
    
  }
}
