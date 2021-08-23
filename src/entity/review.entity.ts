import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, ManyToOne, JoinTable } from "typeorm"
import { PlatForm } from "./platForm.entity";
import { User } from "./user.entity";


@Entity('REVIEW')
export class Review {

  @PrimaryGeneratedColumn('increment')
  id: number;
  
  //CREATE INDEX platform_code ON REVIEW (platFormCode);
  @Column({type:'text'})
  title:string;
  
  @Column({type:'text'})
  content: string;

  @Column({type:'int'})
  accessCount: number;

  @Column({type:'text'})
  submitIp: string;
  @Column({type:'text'})
  submitDate: string;

  @Column({type:'text'})
  submitTime: string;

  @Column({type:'text'})
  del_yn: string// y = delete, n = not delete

  @CreateDateColumn({type:'timestamp'})
  createDate: Date;

  @UpdateDateColumn({type:'timestamp'})
  updateOn: Date;
  
  @Column()
  deleteDate: string;
  

  @Column()
  userId:number;  // User 테이블과 관계

  @Column()
  platformCode:string

  @ManyToOne(type => PlatForm, platform => platform.code)
  platform: PlatForm

  @ManyToOne(type => User, user => user.account)
  user:User
}