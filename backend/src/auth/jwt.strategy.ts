import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// estratégia/forma de autenticação usando JWT = como validar um token na autenticação
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    // pega a chave secreta para validar a assinatura do token
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET must be defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // diz que o JWT será lido do header Authorization como Bearer <token>
      ignoreExpiration: false, // o token expirado será rejeitado automaticamente
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // o que retorna aqui vai pro req.user
    return {
      userId: payload.sub,
      name: payload.name,
      email: payload.email,
      roles: payload.roles,
    };
  }
}
