import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('TOKEN')
export class Token {

  @PrimaryGeneratedColumn('increment')
  id:number;

  @Column()
  user_id:number;

  @Column({type:'text'})
  token_value:string;

  @Column({type:'text'})
  expire:string;

  @Column({type:'text'})
  due_date:Date;

  @OneToMany(type => User, user => user.account)
  user:User
}
