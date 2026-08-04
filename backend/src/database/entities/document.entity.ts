import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  original_name: string;

  @Column({ type: 'int' })
  file_size: number;

  @Column({ type: 'int', nullable: true })
  page_count: number;

  @Column({ default: 'pending' })
  processing_status: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @CreateDateColumn()
  upload_date: Date;

  @CreateDateColumn()
  created_at: Date;
}
