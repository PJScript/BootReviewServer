import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './review/review.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity'
import { ChartData } from './entity/chartData.entity'
import { Review } from './entity/review.entity'
import { PlatForm } from './entity/platForm.entity';
import { PlatReview } from './entity/plat_review.entity';
import { Token } from './entity/token.entity';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({   //
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      // production 환경일 때는 configModule이 환경변수 파일을 무시합니다.
      ignoreEnvFile: process.env.NODE_ENV === 'prod',    // NODE_ENV 는 package.json에서 가상 변수 확인 스크립트 start부분
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'bootreview.cq7ergkxjze4.ap-northeast-2.rds.amazonaws.com',
      port: parseInt(process.env.DB_PORT),
      timezone: "Asia/Seoul",
      username: 'admin',
      password: 'admin1346',
      database: 'BootReview',
      entities: [User, ChartData, Review, PlatForm, PlatReview, Token],
      synchronize: true,
    }),
    ReviewModule,
    AuthModule,
  ],
  
  controllers: [],
  providers: [],
})
export class AppModule {}
