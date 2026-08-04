import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private publisher: Redis;
  private subscriber: Redis;
  private responseMap: Map<string, any>;

  constructor() {
    this.publisher = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6380,
    });

    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6380,
    });

    this.responseMap = new Map();

    this.subscriber.subscribe('chat_response');
    this.subscriber.on('message', (channel, message) => {
      if (channel === 'chat_response') {
        const data = JSON.parse(message);
        const { requestId, ...response } = data;
        if (this.responseMap.has(requestId)) {
          this.responseMap.set(requestId, response);
        }
      }
    });
  }

  async publish(channel: string, message: any) {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async publishAndWaitForResponse(
    requestChannel: string,
    message: any,
    requestId: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responseMap.delete(requestId);
        reject(new Error('Request timeout'));
      }, 30000); // 30 seconds timeout

      this.responseMap.set(requestId, null);

      // Check for response periodically
      const checkResponse = setInterval(() => {
        if (this.responseMap.get(requestId) !== null) {
          clearInterval(checkResponse);
          clearTimeout(timeout);
          const response = this.responseMap.get(requestId);
          this.responseMap.delete(requestId);
          resolve(response);
        }
      }, 100);

      // Publish the request
      this.publisher.publish(requestChannel, JSON.stringify({ ...message, requestId }));
    });
  }

  async onModuleDestroy() {
    await this.publisher.quit();
    await this.subscriber.quit();
  }
}
