import { Controller, Get, Param, Req, Headers, Query } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('comment')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService){}
  

  @Get('platform')
  getAll(@Query('c') id: string){
    
    // 데이터베이스 테이블 생성, 효율적인 조회 생각해보기 1. 테이블을 플랫폼 갯수만큼 만들기 2. 한군데 다 몰아넣고 가져오기 ( 비효율적 )
    return this.reviewService.getAllReview(id)
  }
  

}
