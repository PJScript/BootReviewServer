import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { PlatForm } from 'src/entity/platForm.entity';
import { Review } from 'src/entity/review.entity';
import { Token } from 'src/entity/token.entity';
import { User } from 'src/entity/user.entity'
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [TypeOrmModule.forFeature([Review,PlatForm,User,Token]),
  ConfigService,
  JwtModule.register({
    secret: 'example',
    signOptions:{
      expiresIn:'60s'
    }
  }),
  ],
  controllers: [ReviewController],
  providers:[ReviewService, AuthService],
})
export class ReviewModule {}
