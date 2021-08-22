import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { Review } from './review.entity'
import { Token } from './token.entity';

@Entity('USER')
export class User {
  @PrimaryGeneratedColumn('increment')
  id :string;

  @Column({type:'text'})
  account: string;
  @Column({type:'text'})
  gender: string;
  @Column({type:'text'})
  name: string;
  @Column({type:'text'})
  sns: string; // null or kakao or google or facebook
  @Column({type:'text'})
  pw: string;
  @Column({type:'text'})
  ip: string;
  @Column({type:'text'})
  ipLst: string;

  
  @Column({type:'text'})
  del_yn: string; // y = delete  n = not delete

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateOn: Date;

  @DeleteDateColumn()
  deleteDate: Date;

  @OneToMany(type => Review, review => review.userId)
  review: Review

  @OneToMany(type => Token, token => token.userId)
  token:Token[]
}