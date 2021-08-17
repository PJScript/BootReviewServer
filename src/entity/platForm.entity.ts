import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('PLATFORM')
export class PlatForm {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:'text'})
  code: string;

  @Column({type:'text'})
  name: string;
  desc: string;

  @Column({type:'text'})
  del_yn: string;
}