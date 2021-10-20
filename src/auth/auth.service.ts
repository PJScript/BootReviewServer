import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Review } from 'src/entity/review.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as CryptoJS from 'crypto-js'
import { ConfigService } from '@nestjs/config';
import { Token } from 'src/entity/token.entity';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,

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

  // 토큰 확인 후 req를 그대로 반환 or 토큰 확인 후 DB 조회 값 반환
  async validateToken(token:any,option?:number):Promise<any>{  // 선택 매개변수 option  0,blank or other number
    console.log()
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
        return this.userRepository.query(`SELECT id,pw,account,gender,name,createDate,updateOn FROM USER WHERE account = '${verify.account}' AND del_yn = 'n'`)
      }catch(error){
        throw new HttpException({
          status: HttpStatus.UNAUTHORIZED,
          error: error,
        }, HttpStatus.UNAUTHORIZED);
      }
    }
  }

  async login(user: any){         ////////////////////// 로그인 함수
    
    let payload
    
    if(user.account === 'admin@admin.admin'){  // 관리자 인지 사용자인지 구분
      payload = {
        account:user.account,
        role:['admin']
      };
    }else{
      payload = {
        account:user.account,
        role:['user']
      };
    }
    
    let __Secure_A1 = CryptoJS.AES.encrypt(user.account, this.configService.get('PATH_REFRESH_TOKEN')).toString()

    let access_token = this.jwtService.sign(payload,{secret:this.configService.get('TOKEN_SECRET'),expiresIn:'60s'}) // 해당 토큰이 만료되면 재 로그인 필요.
    let refreshToken
    
    let due_date = new Date()
    due_date.setHours(due_date.getHours() + 9 + 24) //시차 9시간 + 토큰 유효기간 24

    // 여기까지 왔으면 db 검증 완료된 상태 토큰 만들어줌
    
    let refreshCheck = await this.tokenRepository.findOne({ where : { key :user.account, expired : 'n' } })
    
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
    return {
      access_token: access_token,
      account:payload.account,
      __Secure_A1:__Secure_A1
    }
  }
  async ReissuanceAccessToken (req :Request){
    console.log(req.cookies.__Secure_A1,"시큐어 쿠키")
    let a = this.configService.get('PATH_REFRESH_TOKEN')
    console.log(a,"솔트", typeof(a),"타입")
    let decode = CryptoJS.AES.decrypt(req.cookies.__Secure_A1, this.configService.get('PATH_REFRESH_TOKEN'))
    console.log(decode,"디코드")
    let userAccount = await decode.toString(CryptoJS.enc.Utf8)
    console.log(userAccount,"유저어카운트")
    let refreshCheck = await this.tokenRepository.findOne({key:userAccount, expired:'n'})
    console.log(refreshCheck)

    if(!refreshCheck){
      return {code:'L1001',message:'token expired'}
    }else{
      let access_token = this.jwtService.sign({account:userAccount},{secret:this.configService.get('TOKEN_SECRET'),expiresIn:'60s'})
      return access_token
    }
  }
  async signUp ({account,pw,name,gender,sns}): Promise<any>{
    let userAccount = await this.userRepository.findOne({account:account})
    if(!userAccount){
      let hashedPw: string = CryptoJS.SHA256(pw,this.configService.get('TOKEN_SECRET')).toString()
      // 비번 sha256함수로 암호화
      await this.userRepository.createQueryBuilder()
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

      return 1
    }else{
      return 0
    }

  }
  
  async checkName(req :Request):Promise<any>{
    console.log(req.headers)
    let tokenValid = await this.validateToken(req.headers.authorization,1)
    console.log(tokenValid,"토큰발리드")
    let userNameValid = await this.userRepository.findOne({name:req.body.name})

    console.log(userNameValid)
    if(!userNameValid){
      return true    // 닉네임이 없으면
    }else{
      return false  // 닉네임이 존재한다면
    }
  }

  async profile(token:any, query:{p :string}) :Promise<any>{
    console.log(query.p,"쿼리")
    let p = parseInt(query.p)
    let min
    let max
    if(p === 1){
      min = 0
      max = 8
    }else{      
      max = p * 8 
      min = max - 8 + 1
    }
    console.log(max,"맥스", min,"민")
    // console.log(query.p,"쿼리")
    console.log('ㅁ')
    let getUserInfo = await this.validateToken(token,1)
      console.log(getUserInfo)
      console.log(getUserInfo[0].id,"유저아디")
      let userId = getUserInfo[0].id
      
      if(userId === 2054){
        return 'welcome admin'
      }else{
        let getUserReview = await this.reviewRepository.query(`SELECT id,title, content,createDate, platformCode FROM REVIEW WHERE userId = ${userId} AND REVIEW.del_yn='n' ORDER BY REVIEW.id DESC limit ${min}, ${max}`)
        let pageCount = await this.reviewRepository.query(`SELECT count(*) as cnt FROM REVIEW WHERE userId = ${userId} AND del_yn = 'n'`)
        console.log(getUserReview,p,"유저리뷰")
        return {Reviews:getUserReview,Count:pageCount[0]}
      }
  }

  async changeNickName(req :Request):Promise<any>{
    console.log(req.headers.authorization)
    console.log(req.body,"바디")
    let userData = await this.validateToken(req.headers.authorization,1)
    console.log(userData,"유저데이터")
    // this.validateToken(req.header)

    if(!userData){
      return false
    }else{
      return await this.userRepository.query(`UPDATE USER SET name = '${req.body.nickname}' WHERE id='${userData[0].id}'`)
    }
  }

  async changePassword(req :Request):Promise<any>{
    let userData = await this.validateToken(req.headers.authorization,1)
    let userPw = userData[0].pw
    let inputPrevPw :string = CryptoJS.SHA256(req.body.prevPw,this.configService.get('TOKEN_SECRET')).toString()
    let hashedPw :string = CryptoJS.SHA256(req.body.newPw, this.configService.get('TOKEN_SECRET')).toString()
    if(userPw.toString() !== inputPrevPw.toString()){
      return false
    }else{
      await this.userRepository.query(`UPDATE USER SET pw='${hashedPw}' WHERE id=${userData[0].id}`)
      return true
    }
  }

  async getAdminPage(req: Request):Promise<any>{
    console.log(req.headers,"헤더스")
    return 'good'
  }
}


// 로그인 요청이 오면 User 테이블에서 비밀번호가 맞는지 확인. 비번은 hash값으로 암호화 되어있음
// 비밀번호가 맞다면 엑세스토큰, 리프레시 토큰 두가지를 발급한다. 리프레시 토큰은 TOKEN 테이블에 저장, 
// TOKEN 테이블에 저장 할 때에는 User 테이블에 있는 유저의 id를 함께 저장 ex  user_id = 17
// TOKEN 테이블에서 token_id 컬럼엔 리프레시 토큰이 저장됨
// 클라이언트에서 로그인 연장 요청을 보내면 엑세스 토큰을 확인함 해독 후 해당 email을 User 테이블에서 조회
// 조회 결과 회원이 맞다면 TOKEN 테이블에서 해당유저의 refreshtoken이 있는지 확인
// 만료기간이 아직 남아있다면 액세스 토큰 재발급 후 전송 
