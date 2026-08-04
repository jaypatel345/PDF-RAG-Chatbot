import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from './redis/redis.module';
import { User } from './database/entities/user.entity';
import { Document } from './database/entities/document.entity';
import { Chat } from './database/entities/chat.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database: './database.sqlite',
        entities: [User, Document, Chat],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([User, Document, Chat]),
    AuthModule,
    DocumentsModule,
    ChatModule,
    RedisModule,
  ],
})
export class AppModule {}
