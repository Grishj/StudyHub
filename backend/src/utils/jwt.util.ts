import jwt from 'jsonwebtoken';
import { config } from '@/config/env';
import { TokenPayload } from '@/types/auth.types';

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    config.jwt.secret as jwt.Secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    config.jwt.refreshSecret as jwt.Secret,
    { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.secret as jwt.Secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret as jwt.Secret) as TokenPayload;
};