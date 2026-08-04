import asyncio
import json
import os
import redis
import redis.exceptions
from typing import Callable, Optional

class RedisService:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.pubsub: Optional[redis.client.PubSub] = None
        self.host = os.getenv("REDIS_HOST", "localhost")
        self.port = int(os.getenv("REDIS_PORT", "6380"))

    async def connect(self):
        print(f"Connecting to Redis at {self.host}:{self.port}")
        self.redis_client = redis.Redis(
            host=self.host,
            port=self.port,
            decode_responses=True
        )
        self.pubsub = self.redis_client.pubsub()
        # Subscribe is synchronous
        self.pubsub.subscribe("pdf_upload", "pdf_delete", "chat_request")
        print(f"Subscribed to channels: pdf_upload, pdf_delete, chat_request")
        return self.redis_client

    async def disconnect(self):
        print("Disconnecting from Redis...")
        if self.pubsub:
            try:
                self.pubsub.unsubscribe("pdf_upload", "pdf_delete", "chat_request")
                self.pubsub.close()
            except Exception as e:
                print(f"Error closing pubsub: {e}")
        if self.redis_client:
            try:
                self.redis_client.close()
            except Exception as e:
                print(f"Error closing redis client: {e}")
        print("Redis disconnected")

    async def publish(self, channel: str, message: dict):
        # Run sync publish in thread pool
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: self.redis_client.publish(channel, json.dumps(message)))

    async def listen(self, handler: Callable):
        print(f"Starting Redis listener on {self.host}:{self.port}")
        
        while True:
            try:
                message = self.pubsub.get_message(timeout=1.0)
                if message:
                    print(f"Received Redis message: {message}")
                    if message["type"] == "message":
                        data = json.loads(message["data"])
                        print(f"Calling handler for channel: {message['channel']}")
                        await handler(message["channel"], data)
                await asyncio.sleep(0.1)  # Small sleep to prevent busy loop
            except (ConnectionError, redis.exceptions.ConnectionError) as e:
                print(f"Redis connection error: {e}, attempting to reconnect...")
                await asyncio.sleep(2)
                try:
                    await self.connect()
                    print("Reconnected to Redis")
                except Exception as reconnect_error:
                    print(f"Failed to reconnect: {reconnect_error}")
                    await asyncio.sleep(5)
            except Exception as e:
                print(f"Error in Redis listener: {e}")
                import traceback
                traceback.print_exc()
                await asyncio.sleep(1)

redis_service = RedisService()
