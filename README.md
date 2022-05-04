
# 사용 스택
- NestJs
- TypeScript
- TypeOrm
- Crypto-js
- PassPort
- aws EC2
- Docker
- Mysql
- Nginx


## Info
- NestJs 로 **획일화된 개발환경** 을 구성하였습니다.
- TypeScript 도입으로 기존 JavaScript의 골칫거리 undefined 에러를 사전차단했고, **type관련 에러** 를 효율적으로 관리했습니다.
- TypeOrm 으로 DB 조작을 편리하게 했습니다.
- Crypto-js 로 비밀번호를 **암호화** 했고, 유저정보를 암호화 했습니다.
- PassPort 로 특정 조건을 가진 요청만 api에 접근 할 수 있도록 **사전 차단**했습니다.
- EC2 로 **cloud computing** 환경을 구성했습니다.
- Mysql 관계형 데이터베이스로 **데이터 무결성**을 유지했습니다.
- Docker 컨테이너 단위로 **여러개의 서버를 컨트롤** 할 수 있습니다.
- Nginx 프록시 서버를 통해 무중단 배포, 다운데이트를 위한 **로드밸런싱 환경**을 구성해 두었습니다.


## NestJs, TypeScript, TypeOrm

> 획일화된 개발환경, 에러방지, DB 핸들링

파일 구조
**src** > **auth**,**chat**,**entity**,**review** > 각 폴더별 **controller**, **service**, **module** 파일

![스크린샷, 2021-11-03 14-50-53](https://user-images.githubusercontent.com/74460103/140015057-2d0e8441-a8f6-4547-b060-d89e03bc69c9.png)

- **module** : nestApp실행 및 controller 사용에 필요한 의존성 주입
- **controller** : client에서 보내온 요청 라우팅 및 1차 검증
- **service** : DB 조회, 알고리즘,실질적인 기능 로직


<br/>

## 주요 controller & service

<details> 

  <summary>
    <b>Controller</b>
  </summary> 

    
    
- **로그인 컨트롤러**
```
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
  ```
  
  <br/>
  
  - **토큰 재발급 컨트롤러**
  ```
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
  ```
  
  <br/>
  
  - **닉네임 변경 컨트롤러**

```
@UseGuards(JwtAuthGuard)
  @Post('valid')
  async checkName(@Req() req, @Res() res){
    let data = await this.authService.checkName(req)
    if(data){
      res.status(200).send("변경할 수 있습니다")
    }else{
      res.status(409).send({code:"L1003",msg:"exist nickname"})
    }
  }
```
  


</details>


<details> 

  <summary>
    <b>Service</b>
  </summary> 

  
  - **로그인 서비스**
> 요약: **로그인 시 passport 에서 먼저 비밀번호가 유효한지**, 아이디가 존재하는지 검증 후 login 컨트롤러로 요청을 보낸후 다시 컨트롤러에서는 서비스로 요청을 보냄
> login service 에서는 **jwt 토큰을 생성**하고, **DB에 RefreshToken이 존재하는지 확인, 삭제, 재발급**

```
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
```

- **토큰 재발급 서비스**
> 요약: **암호화 되어있는 쿠키를 해독**해서 요청을 보낸 유저가 **누구인지 특정**한다. 그 후 DB에 해당 유저의 RefreshToken이 있는지, 만료되지는 않았는지 검증한다.
> 검증 결과 토큰이 만료되었거나, 토큰이 없다면 사전 약속된 에러코드로 클라이언트에 해당 내용을 알려준다. 
```
  async ReissuanceAccessToken (req :Request){
    let a = this.configService.get('PATH_REFRESH_TOKEN')
    let decode = CryptoJS.AES.decrypt(req.cookies.__Secure_A1, this.configService.get('PATH_REFRESH_TOKEN'))
    let userAccount = await decode.toString(CryptoJS.enc.Utf8)
    let refreshCheck = await this.tokenRepository.findOne({key:userAccount, expired:'n'})

    if(!refreshCheck){
      return {code:'L1001',message:'token expired'}
    }else{
      let access_token = this.jwtService.sign({account:userAccount},{secret:this.configService.get('TOKEN_SECRET'),expiresIn:'60s'})
      return access_token
    }
  }
```

- **닉네임 변경 서비스**
  > 요약: **validateToken 이라는 커스텀 미들웨어**로 엑세스토큰의 유효성을 우선 검증한다. 인자를 2개를 받는데 두번째 인자로 request 자체를 리턴할지, DB조회 결과를 리턴할지 정한다.
  > 토큰 검증을 마치고 **토큰이 유효하다면 DB에 접근**해 해당 유저의 닉네임을 변경한다.
  > 클라이언트에서 중복체크 버튼을 누르지 않으면 해당 요청은 보낼 수 없다.
                                               
```
    async changeNickName(req :Request):Promise<any>{
    let userData = await this.validateToken(req.headers.authorization,1)
    // this.validateToken(req.header)
    if(!userData){
      return false
    }else{
      return await this.userRepository.query(`UPDATE USER SET name = '${req.body.nickname}' WHERE id='${userData[0].id}'`)
    }
  }
```
                                               
                                               
  </details>

  </br>
  </br>
  
## Socket 통신
  - 실시간 피드백 및 서비스 장애 대응을 위해 socket.io 양방향 통신을 구현 하였습니다.
  - 추후 확장을 고려해 채팅 서버는 저장소를 따로 분리해 두었습니다.
  ```
  @SubscribeMessage('connectChat')
  async openChat(@MessageBody() data: any): Promise<void>{
    let welcomeMsg = `누군가 입장했어요`
    await this.server.emit('connectChat',{"id":"system","innerText":welcomeMsg})
  }
  
  @SubscribeMessage('chat')
  async findAll(@MessageBody() data: any): Promise<void> {
    await this.server.emit('chat',{data})
  }
  ```
![plogSocket](https://user-images.githubusercontent.com/74460103/140017823-94cff05d-a19a-4104-92da-4b2b65297347.gif)

## Docker & Nginx
- Docker 와 Nginx 로 로드밸런싱
- Nginx 리버스 프록시 환경을 구현 했습니다.

<details> 

  <summary>
    <b>Docker</b>
  </summary> 

  
- 도커 컨테이너로 메인서버와 채팅서버를 분리하여 메인서버의 부하를 조금이나마 줄였습니다.
- 도커 이미지 태그에 버전 정보를 기입해 업데이트 및, 다운데이트 관리를 용이하게 했습니다.
- 필요한 기능만 사용해 불필요한 용량을 줄이기위해서 node-alpine 버전을 사용했습니다.

```
FROM node:12-alpine
WORKDIR /usr

COPY . .

RUN npm install
RUN npm run build

WORKDIR /usr

CMD ["npm", "run", "start"]
```

</details>

  ![스크린샷, 2021-11-03 15-43-49](https://user-images.githubusercontent.com/74460103/140018859-832702f2-a2e9-4a76-9f93-c0d3b7d342a1.png)



<details> 

  <summary>
    <b>Nginx</b>
  </summary> 

- **proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;**   client ip 식별을 위한 표준
- **proxy_set_header X-Real-IP $remote_addr;**   clinet ip 식별을 위한 옵션 변조가 불가능하다. proxy
- **proxy_pass http://127.0.0.1:8080/;**   포트 리다이렉트 옵션 location 으로 정의한 요청에 대해 명시한 포트로 리다이렉트 시켜준다.
- **proxy_set_header Host $http_host;**  http 요청의 host 헤더값을 프록시 서버의 헤더에 추가한다.
- **proxy_http_version 1.1;**   http/1.1로 통신함을 명시

  
  
- socket 으로 오는 요청은 모두 3000 포트 socket.io 서버로 전달된다.
  
```
server{
server_name bootview.info server.bootview.info
root src/index.html
listen 80;
location / {
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
proxy_pass http://127.0.0.1:8080/;
proxy_set_header Host $http_host;
}

location ^~ /socket {
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header Host $http_host;
proxy_pass http://127.0.0.1:3000/socket.io/;
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
}
```
</details>


## AWS
### EC2
- EC2 로 클라우드 컴퓨팅 환경을 구성했습니다.
- 탄력적ip 를 부여해 EC2 를 재부팅 했을 때 ip가 변경되는 현상을 방지했습니다.
- 용량 및 메모리 관리를 위해 도커 이미지 크기를 줄여서 최신 버전만 저장해두고 나머지는 도커 허브에 업로드 해두었습니다.
- 백업 및 복구를 위해 스냅샷을 생성 합니다.


## API

![스크린샷, 2021-11-18 17-57-22](https://user-images.githubusercontent.com/74460103/142383576-154c39a6-73c0-4999-9e89-984881b34ca8.png)



