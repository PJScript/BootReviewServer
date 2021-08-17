import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'



@Entity('CHART')
export class ChartData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:'int'})
  code: number
  num1: number
  num2: number
  num3: number
  num4: number
  num5: number
}