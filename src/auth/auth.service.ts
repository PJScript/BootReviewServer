import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
    
    ){}

  async validateUser(account: string, pw:string):Promise<any>{
    const user = await this.userRepository.query(`SELECT * FROM USER WHERE account='${account}' AND pw='${pw}'`)

    if(user){
      return user
    }
  return null;
  }

  async login(user: any){
    const payload = {
      account:user.account,
      gender:user.gender,
      name:user.name
    };
    return {
      access_token: this.jwtService.sign(payload)
    }
  }

  async profile(token:any):Promise<any>{
    let verify = await this.jwtService.verify(token.split(' ')[1], {secret:'hello'})  
      return this.userRepository.query(`SELECT account,name,gender FROM USER WHERE account = '${verify.account}'`)
  }
}
