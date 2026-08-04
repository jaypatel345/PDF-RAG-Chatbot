import asyncio
import json
import os
import redis.asyncio as redis
from typing import Callable, Optional

class RedisService:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.pubsub: Optional[redis.client.PubSub] = None
        self.host = os.getenv("REDIS_HOST", "localhost")
        self.port = int(os.getenv("REDIS_PORT", "6380"))

    async def connect(self):
        self.redis_client = redis.Redis(
            host=self.host,
            port=self.port,
            decode_responses=True
        )
        self.pubsub = self.redis_client.pubsub()
        await self.pubsub.subscribe("pdf_upload", "pdf_delete", "chat_request")

    async def disconnect(self):
        if self.pubsub:
            await self.pubsub.unsubscribe("pdf_upload", "pdf_delete", "chat_request")
            await self.pubsub.close()
        if self.redis_client:
            await self.redis_client.close()

    async def publish(self, channel: str, message: dict):
        await self.redis_client.publish(channel, json.dumps(message))

    async def listen(self, handler: Callable):
        while True:
            try:
                message = await self.pubsub.get_message(timeout=1.0)
                if message and message["type"] == "message":
                    data = json.loads(message["data"])
                    await handler(message["channel"], data)
            except Exception as e:
                print(f"Error in Redis listener: {e}")
                await asyncio.sleep(1)

redis_service = RedisService()
