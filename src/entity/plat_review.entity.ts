import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('PLAT_REVIEW')
export class PlatReview {
  @PrimaryGeneratedColumn()
  id: number

  @Column({type:'int'})
  PlatForm_id:number
  Review_id:number
}
