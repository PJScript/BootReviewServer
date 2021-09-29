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
  getAllUser(@Req() req: string){
    return this.reviewService.getAllUser();     // go  review.service.ts
  }
  @Post('/delete/platform')
  removeReview(@Req() req: string){
    console.log('hi')
    return this.reviewService.removeReview(req);
  }

  @Post('platform')  
  insertReview(@Req() req: string, @Query() query: string){
    return this.reviewService.insertReview(req, query);
  }

  
}
