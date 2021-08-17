import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatForm } from 'src/entity/platForm.entity';
import { Review } from 'src/entity/review.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review,PlatForm])],
  controllers: [ReviewController],
  providers:[ReviewService],
})
export class ReviewModule {}
