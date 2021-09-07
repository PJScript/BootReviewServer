import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as CryptoJS from 'crypto-js'
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
    let user = await this.userRepository.query(`SELECT * FROM USER WHERE account='${account}' AND pw='${pw}'`)
    if(user){
      return user
    }
  return {
    code:"C1000",
    msg:'not fount user Or password valid error'}
  }   // first logic and go login function after done 

  async validateToken(token:any,option?:number):Promise<any>{  // 선택 매개변수 option  0,blank or other number
    if(!option){  // option 0 or blank is get req.body
      try {
        return await this.jwtService.verify(token.split(' ')[1],{secret:this.configService.get('TOKEN_SECRET')})
      }catch(error){
        throw new HttpException({
          status: HttpStatus.UNAUTHORIZED,
          error: error,
        }, HttpStatus.UNAUTHORIZED);
      }
    }else{  // option other number is get DB userInfo
      try{
        let verify = this.jwtService.verify(token.split(' ')[1],{secret:this.configService.get('TOKEN_SECRET')})
        return this.userRepository.query(`SELECT id,account,gender,name,createDate,updateOn FROM USER WHERE account = '${verify.account}' AND del_yn = 'n'`)
      }catch(error){
        throw new HttpException({
          status: HttpStatus.UNAUTHORIZED,
          error: error,
        }, HttpStatus.UNAUTHORIZED);
      }
    }
  }

  async login(user: any){         ////////////////////// 로그인 함수
    
    const payload = {
      account:user.account
    };
    let __Secure_A1 = CryptoJS.AES.encrypt(user.account, this.configService.get('PATH_REFRESH_TOKEN')).toString()
    let decrypt = CryptoJS.AES.decrypt(__Secure_A1, this.configService.get('PATH_REFRESH_TOKEN'))
    let targetUser = decrypt.toString(CryptoJS.enc.Utf8);
 
    let access_token = this.jwtService.sign(payload,{secret:this.configService.get('TOKEN_SECRET'),expiresIn:'60s'}) // 해당 토큰이 만료되면 재 로그인 필요.
    let refreshToken
    
    let due_date = new Date()
    due_date.setHours(due_date.getHours() + 9 + 24) //시차 9시간 + 토큰 유효기간 24

    // 여기까지 왔으면 db 검증 완료된 상태 토큰 만들어줌
    
    let refreshCheck = await this.tokenRepository.findOne({ where : { key :user.account, expired : 'n' } })
    
    console.log(refreshCheck,'리프레시 체크')
    
    if(!refreshCheck){  // make refresh Token if login success after not found refresh Token in database 
      refreshToken = await this.jwtService.sign(payload,{secret:this.configService.get('TOKEN_SECRET'),expiresIn:'10s'})
      await this.tokenRepository.createQueryBuilder()
      .insert()
      .into(Token)
      .values({
        key:user.account,
        token_value:refreshToken,
        expired:'n',
        due_date: due_date
      }).execute()
    } else {  // login success but expired refresh Token
      let checkExpired = new Date()
      checkExpired.setHours(checkExpired.getHours() + 9)

      if (refreshCheck.due_date < checkExpired) {
        console.log("작동@@@@@@@@@@@@@@@@@@@@@@@@@@")
        refreshToken = await this.jwtService.sign(payload,{secret:this.configService.get('TOKEN_SECRET'),expiresIn:'24h'})
        await this.tokenRepository.createQueryBuilder()  // 토큰 만료 시키기
          .update('TOKEN')
          .set({ expired:'y' })
          .where({ expired:'n', key: user.account }) 
          .execute()
        await this.tokenRepository.createQueryBuilder()  // 새로운 리프레시 토큰 발급
          .insert()
          .into('TOKEN')
          .values({
            key: user.account,
            token_value: refreshToken,
            expired: 'n',
            due_date: due_date
          }).execute()
      }
    }
    // access_token을 http header authorization 에 저장해서 보내줌
    // cookie에 account를 암호화한 __Secure이름의 쿠키를 보내줌
    // 서버에서는 __Secure 쿠키를 해독 후 TOKEN 테이블 id로 조회 맨 마지막 값만 가져오면 됨 
    // refresh token의 due_date를 확인 후 만료되었다면 만료 알림
    // 만료되지 않았다면 새로운 엑세스 토큰 발급
    
    return {
      access_token: access_token,
      __Secure_A1:__Secure_A1
    }
  }
  
  async signUp ({account,pw,name,gender,sns}): Promise<any>{

    let hashedPw: string = CryptoJS.SHA256(pw,this.configService.get('TOKEN_SECRET')).toString()
    // 비번 sha256함수로 암호화
    this.userRepository.createQueryBuilder()
    .insert()
    .into('USER')
    .values({
      account:account,
      pw:hashedPw,
      name:name,
      gender:gender,
      sns:sns,
      del_yn:'n'
    }).execute();
  }

  async profile(token:any):Promise<any>{
    let getUserInfo = await this.validateToken(token,1)
      return getUserInfo
  }
}


// 로그인 요청이 오면 User 테이블에서 비밀번호가 맞는지 확인. 비번은 hash값으로 암호화 되어있음
// 비밀번호가 맞다면 엑세스토큰, 리프레시 토큰 두가지를 발급한다. 리프레시 토큰은 TOKEN 테이블에 저장, 
// TOKEN 테이블에 저장 할 때에는 User 테이블에 있는 유저의 id를 함께 저장 ex  user_id = 17
// TOKEN 테이블에서 token_id 컬럼엔 리프레시 토큰이 저장됨
// 클라이언트에서 로그인 연장 요청을 보내면 엑세스 토큰을 확인함 해독 후 해당 email을 User 테이블에서 조회
// 조회 결과 회원이 맞다면 TOKEN 테이블에서 해당유저의 refreshtoken이 있는지 확인
// 만료기간이 아직 남아있다면 액세스 토큰 재발급 후 전송 
