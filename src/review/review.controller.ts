import { Controller, Get, Param, Req, Headers, Query, Delete } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('comment')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService){}
  

  @Get('platform')
  getReview(@Query() query: number){   
    return this.reviewService.getReview(query)  // go  review.service.ts
  }
  @Get()
  getAllUser(@Req() req: string){
    return this.reviewService.getAllUser();     // go  review.service.ts
  }

  @Delete('platform')
  removeReview(@Req() req: string){
    return this.reviewService.removeReview(req);
  }
}
