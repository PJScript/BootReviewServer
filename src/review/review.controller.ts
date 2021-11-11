import { Controller, Get, Param, Req, Headers, Query, Delete, Post, UseGuards, Res } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ReviewService } from './review.service';
import { Request, Response } from 'express'
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService){}
  
  // @Get('platform')
  // getPlatform(@Req() req){
  //   return 'hello'
  // }

  @Get('platform')
  async getReview(@Query() query: string, @Res() res:Response, @Req() req:Request){   
    console.log(req.headers)
    let allReview = await this.reviewService.getReview(query)  // go  review.service.ts
    res.status(200).send(allReview)
  }
  @Get()
  getAllUser(@Req() req: Request){
    return this.reviewService.getAllUser();     // go  review.service.ts
  }
  
  @UseGuards(JwtAuthGuard)
  @Post('/delete/platform')
  removeReview(@Req() req: Request){
    console.log('hi')
    return this.reviewService.removeReview(req);
  }
  @UseGuards(JwtAuthGuard)
  @Post('patch')
  patchReview(@Req() req: Request){
    console.log('게시물 수정')
    return this.reviewService.patchReview(req)
  }
  
  @Get('reviews')
  getReviews(@Req() req: Request, @Query() query){
    console.log('모든 리뷰')
    return this.reviewService.getReviews(req.headers.authorization, query)
  }
  @Post('platform')  
  insertReview(@Req() req: Request, @Query() query: string){
    return this.reviewService.insertReview(req, query);
  }
}
