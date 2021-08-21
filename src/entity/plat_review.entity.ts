import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('PLAT_REVIEW')
export class PlatReview {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({type:'int'})
  PlatForm_id:number
  @Column({type:'int'})
  Review_id:number
}
