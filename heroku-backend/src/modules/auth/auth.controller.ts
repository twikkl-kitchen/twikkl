import { CreateUserDto } from './../user/dto/create-user.dto';
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Get,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninRequestDto, SigninResponseDto } from './dto/signin.dto';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { GoogleOAuthService } from './google-oauth.service';
import { Response } from 'express';

// @UseInterceptors(AuthInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private googleOAuthService: GoogleOAuthService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: SigninRequestDto,
  ): Promise<SigninResponseDto> {
    const user = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
    if (!user) {
      throw new HttpException(
        'Unauthorized: Invalid username or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async signUp(@Body() signUpDto: CreateUserDto) {
    const user = await this.authService.signUp(signUpDto);
    return user;
  }

  @Get('google')
  async googleAuth(@Res() res: Response) {
    const authUrl = this.googleOAuthService.getAuthUrl();
    res.redirect(authUrl);
  }

  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Res() res: Response) {
    try {
      const tokens = await this.googleOAuthService.getTokensFromCode(code);
      const googleUser: any = await this.googleOAuthService.getUserInfo(tokens.access_token);
      
      const user = await this.authService.googleLogin({
        googleId: googleUser.sub,
        email: googleUser.email,
        firstName: googleUser.given_name,
        lastName: googleUser.family_name,
        picture: googleUser.picture,
      });
      
      // Redirect back to mobile app with deep link
      const deepLink = `twikkl://auth?token=${user.access_token}&user=${encodeURIComponent(JSON.stringify(user))}`;
      res.redirect(deepLink);
    } catch (error) {
      throw new HttpException('Google authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('me')
  async getCurrentUser(@Req() req) {
    return req.user;
  }

  @Post('logout')
  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }
}
