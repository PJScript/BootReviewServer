import { Injectable } from '@nestjs/common';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { PlatForm } from 'src/entity/platForm.entity';
import { Review } from 'src/entity/review.entity';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(PlatForm)
    private platformRepository: Repository<PlatForm>
  ) {}
  

  async getAllReview(id){
    let ptCode = await this.platformRepository.find({code:id});  //플랫폼 정보 이름, 코드 등
    return ptCode
  }

}
