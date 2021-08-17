import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('USER')
export class User {
  @PrimaryGeneratedColumn()
  id :string;

  @Column({type:'text'})
  account: string;
  gender: string;
  name: string;
  sns: string; // null or kakao or google or facebook
  pw: string;
  ip: string;
  ipLst: string;
  
  @Column({type:'text'})
  del_yn: string; // y = delete  n = not delete

  @CreateDateColumn({type:Date})
  createDate: Date;

  @UpdateDateColumn({type:Date})
  updateOn: Date;

  @DeleteDateColumn({type:Date})
  deletionDate: Date;
}