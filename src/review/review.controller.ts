import { Controller, Get, Param, Req, Headers, Query, Delete, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ReviewService } from './review.service';

@Controller('comment')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService){}
  

  @Get('platform')
  getReview(@Query() query: string){   
    return this.reviewService.getReview(query)  // go  review.service.ts
  }
  @Get()
  getAllUser(@Req() req: string){
    return this.reviewService.getAllUser();     // go  review.service.ts
  }
  @Post('/delete/platform')
  removeReview(@Req() req: string){
    console.log('hi')
    return this.reviewService.removeReview(req);
  }

  @Post('platform')  
  insertReview(@Req() req: string){
    return this.reviewService.insertReview(req);
  }

  
}
