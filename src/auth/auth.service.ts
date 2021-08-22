import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto'
import { ConfigService } from '@nestjs/config';
import { Token } from 'src/entity/token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private jwtService: JwtService,
    private configService: ConfigService
    
    ){}

  async validateUser(account: string, pw:string):Promise<any>{
    const user = await this.userRepository.query(`SELECT * FROM USER WHERE account='${account}' AND pw='${pw}'`)

    if(user){
      return user
    }
  return null;
  }   // first logic and go login function after done 

  async login(user: any){
    const payload = {
      account:user.account,
    };
    let due_date = new Date()
    due_date.setHours(due_date.getHours() + 9 + 24) //시차 9시간 + 토큰 유효기간 24
    
    // db에 유저정보 검색
    let userInfo = await this.userRepository.findOne({account:user.account}) //유저정보를 찾음
    let refresh_token = this.jwtService.sign(payload,{secret:this.configService.get('TOKEN_SECRET'),expiresIn:'24h'})
    
  
    
    // console.log(userInfo)

    

    return {
      access_token: this.jwtService.sign(payload,{secret:this.configService.get('TOKEN_SECRET'),expiresIn:'60s'}), // 해당 토큰이 만료되면 재 로그인 필요.
      refresh_token: refresh_token,
      token_due_date: due_date.toISOString()
    }
  }
  
  async profile(token:any):Promise<any>{
    let verify = await this.jwtService.verify(token.split(' ')[1], {secret:process.env.TOKEN_SECRET})  
      return this.userRepository.query(`SELECT account,name,gender FROM USER WHERE account = '${verify.account}'`)
  }
}


// 로그인 요청이 오면 User 테이블에서 비밀번호가 맞는지 확인. 비번은 hash값으로 암호화 되어있음
// 비밀번호가 맞다면 엑세스토큰, 리프레시 토큰 두가지를 발급한다. 리프레시 토큰은 TOKEN 테이블에 저장, 
// TOKEN 테이블에 저장 할 때에는 User 테이블에 있는 유저의 id를 함께 저장 ex  user_id = 17
// TOKEN 테이블에서 token_id 컬럼엔 리프레시 토큰이 저장됨
// 클라이언트에서 로그인 연장 요청을 보내면 엑세스 토큰을 확인함 해독 후 해당 email을 User 테이블에서 조회
// 조회 결과 회원이 맞다면 TOKEN 테이블에서 해당유저의 refreshtoken이 있는지 확인
// 만료기간이 아직 남아있다면 액세스 토큰 재발급 후 전송 
