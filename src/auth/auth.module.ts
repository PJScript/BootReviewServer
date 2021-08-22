import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/entity/review.entity';
import { PlatForm } from 'src/entity/platForm.entity';
import { User } from 'src/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { Token } from 'src/entity/token.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Review,PlatForm,User,Token]),
  PassportModule,
  JwtModule.register({
    secret: 'example',
    signOptions:{
      expiresIn:'60s'
    }
  }),
  ConfigService
  ],
  controllers:[AuthController],
  providers:[AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
