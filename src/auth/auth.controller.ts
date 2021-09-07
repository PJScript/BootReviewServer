import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport'
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService){}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req, @Res() res){
    let loginStatus = await this.authService.login(req.body)
    res.header.authorization = 'Bearer ' + loginStatus.access_token
    // 헤더에 엑세스 토큰 보내주기
    res.cookie('__Secure_A1',loginStatus.__Secure_A1)
    return res.status(200).send('login success');
  }
  
  @Post('signup')
  async signUp(@Req() req, @Res() res){
    this.authService.signUp(req.body)
    res.status(200).send(req.body)
  }


  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req){
    return this.authService.profile(req.headers.authorization);
  }
}
