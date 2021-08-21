import { RemoteInfo } from 'dgram';
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Review } from './review.entity'

@Entity('PLATFORM')
export class PlatForm {

  @PrimaryGeneratedColumn('increment')
  id: number;
  
  
  @Column()
  code: string;

  @Column({type:'text'})
  name: string;
  @Column({type:'text'})
  desc: string;

  @Column({type:'text'})
  del_yn: string;

  @OneToMany(type => Review, review => review.platformId)
  reviews: Review[]
  
}