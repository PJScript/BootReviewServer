import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'



@Entity('CHART')
export class ChartData {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({type:'int'})
  code: number
  @Column({type:'int'})
  num1: number
  @Column({type:'int'})
  num2: number
  @Column({type:'int'})
  num3: number
  @Column({type:'int'})
  num4: number
  @Column({type:'int'})
  num5: number
}