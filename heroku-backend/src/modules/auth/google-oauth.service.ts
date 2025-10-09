import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleOAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL || 'http://localhost:3000'}/auth/google/callback`
    );
  }

  getAuthUrl() {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
    });
  }

  async getTokensFromCode(code: string) {
    const { tokens } = await this.client.getToken(code);
    return tokens;
  }

  async getUserInfo(accessToken: string) {
    this.client.setCredentials({ access_token: accessToken });
    const userinfo = await this.client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });
    return userinfo.data;
  }
}
