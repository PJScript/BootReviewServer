import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './review/review.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity'
import { ChartData } from './entity/chartData.entity'
import { Review } from './entity/review.entity'
import { PlatForm } from './entity/platForm.entity';
import { PlatReview } from './entity/plat_review.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
      TypeOrmModule.forRoot({
      type:'mysql',
      host: 'bootreview.cq7ergkxjze4.ap-northeast-2.rds.amazonaws.com',
      port: 3306,
      timezone: "Asia/Seoul",
      username: 'admin',
      password: 'admin1346',
      database: 'BootReview',
      entities:[User, ChartData, Review, PlatForm, PlatReview],
      synchronize: true,
    }),
    ReviewModule,
    AuthModule
  ],
  
  controllers: [],
  providers: [],
})
export class AppModule {}
