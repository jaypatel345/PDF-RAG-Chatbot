import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  session_id: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ nullable: true })
  source_document: string;

  @Column({ type: 'int', nullable: true })
  page_number: number;

  @Column({ type: 'json', nullable: true })
  suggested_questions: string[];

  @CreateDateColumn()
  created_at: Date;
}
