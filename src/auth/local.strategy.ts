import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
  constructor(private authService: AuthService) {
    super(
      {
        usernameField:'account',
        passwordField:'pw'  //request로 받을 body의 키값
      }
    );
  }


  async validate(account: string, pw: string):Promise<any>{
    const user = await this.authService.validateUser(account, pw)
    if(!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}