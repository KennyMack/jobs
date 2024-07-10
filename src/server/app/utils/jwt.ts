import { getJWTPrivateKey } from '@app/environment';
import { JwtPayload, sign, verify } from 'jsonwebtoken';

type tokenData = {
  issuer: string,
  subject: string,
  data: object
}

export function generateToken(
  payload: tokenData
) {
  const token = sign(payload.data, getJWTPrivateKey(), {
    expiresIn: '1h',
    algorithm: 'HS256'
  });

  return token;
}

export type TokenResult = {
  valid: boolean,
  data: JwtPayload
}

export function checkToken(token: string) : TokenResult {
  try {
    const tokenValue = token.indexOf(' ') > -1 ?
      token.split(' ')[1] : token;

    const decoded = verify(tokenValue || '', getJWTPrivateKey(), {
      algorithms: ['HS256']
    });

    let data = {}
    if (decoded instanceof String) {
      data = {
        key: decoded as string
      }
    } else {
      data = {
        ...decoded as JwtPayload
      }
    }

    return {
      valid: true,
      data: {
        ...data
      }
    }
  } catch {
    return {
      valid: false,
      data: {}
    };
  }
}
