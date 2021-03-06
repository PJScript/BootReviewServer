import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('TOKEN')
export class Token {

  @PrimaryGeneratedColumn('increment')
  id:number

  @Column({type:'text'})
  key:string

  @Column({type:'text'})
  token_value:string;

  @Column({type:'text'})
  expired:string;
  
  @Column()
  due_date:Date
}
