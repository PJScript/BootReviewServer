import { Column, Entity, Index, JoinColumn, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { Review } from './review.entity'

@Entity('PLATFORM')
export class PlatForm {

  @Column({primary:true,unique:true})
  code:string;

  @Column({type:'text'})
  name: string;
  @Column({type:'text'})
  desc: string;

  @Column({type:'text'})
  del_yn: string;

  @OneToMany(type => Review, review => review.platformCode)
  reviews: Review
  
}
