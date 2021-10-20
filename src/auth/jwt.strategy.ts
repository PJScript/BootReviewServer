import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration:true,
      secretOrKey:process.env.TOKEN_SECRET
    })
  }
  validate(payload: any) {
    console.log('여기 123')
    return {
      account:payload.account,
      gender:payload.gender,
      name:payload.name
    }
  }
}