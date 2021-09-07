import { Strategy } from 'passport-local'
import { PassportStrategy } from '@nestjs/passport'
import {Injectable, UnauthorizedException } from '@nestjs/common'
import * as CryptoJS from 'crypto-js'
import { AuthService } from './auth.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
  constructor(private authService: AuthService, private configService: ConfigService) {
    super(
      {
        usernameField:'account',
        passwordField:'pw'  //request로 받을 body의 키값
      }
    );
  }


  async validate(account: string, pw:string):Promise<any>{
    let  hashedPw = CryptoJS.SHA256(pw,this.configService.get('TOKEN_SECRET')).toString()
    const user = await this.authService.validateUser(account, hashedPw)
    if(!user) {
      throw new UnauthorizedException();
    }
    
    return user;
  }
}