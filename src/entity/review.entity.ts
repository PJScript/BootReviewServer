import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm"


@Entity('REVIEW')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;
  

  @Column({type:'text'})
  platFormCode: string;

  @Column({type:'text'})
  authorAccount: string;

  @Column({type:'text'})
  author: string;
  
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

  @CreateDateColumn({type:Date})
  createDate: Date;

  @UpdateDateColumn({type:Date})
  updateOn: Date;
  
  @DeleteDateColumn({type:Date})
  deleteDate: Date;
}