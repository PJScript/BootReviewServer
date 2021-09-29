import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport'
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
    ){}
  
  @Get()
  async test(@Req() req){
    return 'hi'
  }


  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req, @Res() res){
    console.log('로그인 작동함')
    let loginStatus = await this.authService.login(req.body)
    res.header({Authorization:'Bearer ' + loginStatus.access_token})
    // 헤더에 엑세스 토큰 보내주기
    res.cookie('__Secure_A1',loginStatus.__Secure_A1,{
      samesite:'None',
      secure:true,
      httpOnly:true,
      maxAge:86400000,
      domain:".bootview.info",
      path:'/'
    })
    return res.status(200).send('login success');
  }

  @Get('logout')  // 로그아웃 시 쿠키의 값을 알 수 없는 임의의 값으로 대체
  async logout(@Res() res){
    let __Secure_A1 = CryptoJS.SHA256('logout',this.configService.get('PATH_REFRESH_TOKEN'))
    res.cookie('__Secure_A1',__Secure_A1,{
      sameSite:'none',
      maxAge:86400000,
      httpOnly:true,
      secure:true
    })
    res.status(200).send('로그아웃 성공')
  }

  @Get('token')
  async ReissuanceAccessToken(@Req() req, @Res() res){
    let data = await this.authService.ReissuanceAccessToken(req)

    if(typeof(data) !== 'string'){  // 토큰이 아니라면 에러 전송 토큰 만료 에러 전송
      return res.status(401).send(data)
    }else{                          // 리턴 값이 토큰 이라면 토큰 전송
      res.header({Authorization:'Bearer ' + data})
      return res.status(200).send()
    }
  }
  @Post('signup')
  async signUp(@Req() req, @Res() res){
    let accountCheck = await this.authService.signUp(req.body)
    if(accountCheck === 1){
      res.status(200).send('success')
    }else{
      res.status(409).send('This email has already been signed up.')
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req){
    return this.authService.profile(req.headers.authorization);
  }
}
