import { Injectable } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { PlatForm } from 'src/entity/platForm.entity';
import { Review } from 'src/entity/review.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ReviewService {
  constructor(

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(PlatForm)
    private platformRepository: Repository<PlatForm>,  /// table 1

    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,   /// table 2

    private authService: AuthService,

  ) {}
  

  async getReview(query){// , ,   
    let page: number = Number(query.page)   //type 검사를 안함 **주의**
    let code: string = query.code   //type 검사를 안함 **주의**
    code = JSON.stringify(code)  // JSON으로 오기때문에 변환필요함
    if(page != 1){  // 중복 컨텐츠 해결
      page = page + 1
    }else{
      page = 1
    }
    console.log(typeof(code))
    console.log(code)

    let reviewList = await this.reviewRepository.query(`SELECT REVIEW.id,REVIEW.title,REVIEW.content,REVIEW.createDate,USER.name FROM REVIEW LEFT JOIN USER on REVIEW.userId = USER.id  WHERE platformCode=${code} AND REVIEW.del_yn="n" ORDER BY REVIEW.id DESC`)
    //클라이언트에서 1페이지 2페이지 페이지 정보를 보내줌.
    // DB에서 가져올 때 page 부터 n개 전송
    console.log(reviewList)
    return reviewList
  }

  async getAllUser(){
    let test = await this.userRepository.find()
    return test
  }

  async insertReview(req, query){
    console.log(query,"쿼리")
    console.log(req.body,"바디")

    let userInfo = await this.authService.validateToken(req.headers.authorization,1)
    console.log(userInfo[0].id,"유저인포")
    if(!userInfo){
      return '잘못된 접근'
    }else{
      await this.reviewRepository.createQueryBuilder()
      .insert()
      .into('REVIEW')
      .values({
        title:req.body.title,
        content:req.body.content,
        accessCount:0,
        userId:userInfo[0].id,
        del_yn:'n',
        platformCode:query.code
      }).execute()
      return 0;
  }
}
async patchReview(req){
  if(!req.headers.authorization){
    return '토큰이 없습니다'
  }else{
    let userInfo = await this.authService.validateToken(req.headers.authorization,1)
    console.log(userInfo,"토큰 해독 후 유저정보")
    if(!userInfo){
      return '토큰이 만료되었습니다'
    }else{ // 요청보낸 유저가 삭제할 글의 소유자라면
      await this.reviewRepository.query(`UPDATE REVIEW SET title='${req.body.title}', content='${req.body.content}' WHERE id=${req.body.id} AND userId=${userInfo[0].id}`)
      return 'good'
    }
  }
}


  async removeReview (req){
    if(!req.headers.authorization){
      return '토큰이 없습니다'
    }else{
      let date = new Date() // 삭제시간 한국기준
      console.log(date,"날짜")
  
      date.setHours(date.getHours() + 9)
      console.log(date,"수정된 날짜")
      let userInfo = await this.authService.validateToken(req.headers.authorization,1)
      console.log(userInfo,"토큰 해독 후 유저정보")
      if(!userInfo){
        return '토큰이 만료되었습니다'
      }else if(userInfo[0].account === req.body.account){ // 요청보낸 유저가 삭제할 글의 소유자라면
        await this.reviewRepository.query(`UPDATE REVIEW SET del_yn="y", deleteDate="${date.toISOString()}" WHERE id=${req.body.id} AND userId=${userInfo[0].id} AND title='${req.body.title}'`)
        return 'good'
      }
    }
  }

}
