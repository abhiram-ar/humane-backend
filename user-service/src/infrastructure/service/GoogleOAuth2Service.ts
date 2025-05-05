import { OAuth2Client } from 'google-auth-library';

export const googleOAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
