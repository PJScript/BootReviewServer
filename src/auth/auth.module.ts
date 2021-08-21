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

@Module({
  imports:[TypeOrmModule.forFeature([Review,PlatForm,User]),
  PassportModule,
  JwtModule.register({
    secret: 'hello',
    signOptions:{
      expiresIn:'60s'
    }
  })],
  controllers:[AuthController],
  providers:[AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
