import { Injectable } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
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


  
  ) {}
  

  async getReview(query){// , ,   
    let page: number = Number(query.page)   //type 검사를 안함 **주의**
    let code: number = Number(query.code)   //type 검사를 안함 **주의**
    
    if(page != 1){  // 중복 컨텐츠 해결
      page = page + 1
    }else{
      page = 1
    }

    let reviewList = 
    await this.reviewRepository.query(`
    SELECT REVIEW.*,USER.account, USER.name, PLATFORM.name 
    from REVIEW LEFT JOIN USER on REVIEW.userId = USER.id LEFT JOIN PLATFORM on REVIEW.platformId = PLATFORM.id 
    where platformId='${code}' ORDER BY id DESC limit ${page},8;
    `)
    //   console.log(`작동됨${i}`)
    //     await this.userRepository
    //     .createQueryBuilder()
    //     .insert()
    //     .into(User)
    //     .values([
    //       {   //on row
    //         account:`test${i}@test.test`,
    //         gender:`male`,
    //         name:`example${i}`,
    //         sns:`none`,
    //         pw:`${i}${i+1}${i+2}`,
    //         del_yn:'n'
    //     }
    //     ])
    //     .execute();
    // }
    //클라이언트에서 1페이지 2페이지 페이지 정보를 보내줌.
    // DB에서 가져올 때 page 부터 n개 전송

    


    // // 데이터 자동 추가 필요하면 쓰기
    // for(let i=201; i<=250; i++){   
    //   console.log(`작동됨${i}`)
    //     await this.reviewRepository
    //     .createQueryBuilder()
    //     .insert()
    //     .into(Review)
    //     .values([
    //       {   //on row
    //       content:`${i} 그리고 ${i} 번`,
    //       accessCount:1,
    //       submitIp:'',
    //       submitDate:'',
    //       submitTime:'',
    //       del_yn:'n',
    //       createDate:Date(),
    //       updateOn:Date(),
    //       deleteDate:'',
    //       platformId:code,
    //       userId:i
    //     }
    //     ])
    //     .execute();
    // }
    return reviewList
  }

  async getAllUser(){
    let test = await this.userRepository.find()
    console.log(test,"여기")
    return test
  }

  async removeReview(req){
    if(!req.headers.access_token){
      return '권한이 없습니다'
    }else{
      let date = new Date();
      
      this.reviewRepository.query(`UPDATE REVIEW SET del_yn='y', deleteDate='${date}' WHERE REVIEW.id=${req.query.n}`)
      return this.reviewRepository.query(`
      select REVIEW.*, USER.name, USER.account, PLATFORM.name 
      FROM REVIEW LEFT JOIN USER on REVIEW.userId = USER.id LEFT JOIN PLATFORM on REVIEW.platformId = PLATFORM.id 
      WHERE REVIEW.id=${req.query.n};
      `)
    }
    // 1
    // 우선 헤더에 토큰이 있는지 확인한다.
    // 헤더에 토큰이 없다면 권한 없음 전송
    // 헤더에 토큰이 있다면 해독 후 해당하는 유저 정보 전송

    // 2
    // 
  }

}
