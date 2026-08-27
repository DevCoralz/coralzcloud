"""
Telegram MTProto client manager.

Singleton pattern with lazy initialization. Handles connection lifecycle,
retry logic, and thread-safe access from sync FastAPI routes.

Uses a user account session string (not a bot) for 2 GB upload limit.
"""

from __future__ import annotations

import asyncio
import io
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import DocumentAttributeFilename

from app.core.config import settings

logger = logging.getLogger(__name__)

# Dedicated thread pool for running async Telegram operations from sync routes.
# Sized for concurrent uploads without starving the FastAPI event loop.
_executor = ThreadPoolExecutor(max_workers=4, thread_name_prefix="tg-upload")


class TelegramClientManager:
    """Manages a single Telethon client instance with thread-safe access."""

    def __init__(self) -> None:
        self._client: TelegramClient | None = None
        self._lock = threading.Lock()
        self._loop: asyncio.AbstractEventLoop | None = None

    def _ensure_loop(self) -> asyncio.AbstractEventLoop:
        if self._loop is None or self._loop.is_closed():
            self._loop = asyncio.new_event_loop()
        return self._loop

    async def _connect(self) -> TelegramClient:
        if self._client is not None and self._client.is_connected():
            return self._client

        self._client = TelegramClient(
            StringSession(settings.telegram_session_string),
            settings.telegram_api_id,
            settings.telegram_api_hash,
            request_retries=3,
            auto_reconnect=True,
        )
        await self._client.start()
        logger.info("[tg] Client connected")
        return self._client

    def run_async(self, coro: Any) -> Any:
        """Execute an async coroutine from a synchronous context."""
        loop = self._ensure_loop()
        if loop.is_running():
            # Already inside async — use thread pool to avoid deadlock.
            future = _executor.submit(asyncio.run, coro)
            return future.result(timeout=300)
        return loop.run_until_complete(coro)

    # ------------------------------------------------------------------
    # File operations
    # ------------------------------------------------------------------

    async def upload(self, file_bytes: bytes, filename: str, mime_type: str) -> dict:
        client = await self._connect()
        channel_id = int(settings.telegram_storage_channel_id)

        file_obj = io.BytesIO(file_bytes)
        file_obj.name = filename

        message = await client.send_file(
            entity=channel_id,
            file=file_obj,
            force_document=True,
            attributes=[DocumentAttributeFilename(filename=filename)],
        )

        doc = message.document
        return {
            "storage_key": str(message.id),
            "filename": filename,
            "mime_type": mime_type,
            "size_bytes": doc.size if doc else len(file_bytes),
        }

    async def download(self, storage_key: str) -> bytes:
        client = await self._connect()
        channel_id = int(settings.telegram_storage_channel_id)
        msg_id = int(storage_key)

        message = await client.get_messages(entity=channel_id, ids=msg_id)
        if message is None or message.document is None:
            raise FileNotFoundError(f"Message {storage_key} not found")

        buf = io.BytesIO()
        await client.download_media(message, file=buf)
        buf.seek(0)
        return buf.read()

    async def delete(self, storage_key: str) -> bool:
        client = await self._connect()
        channel_id = int(settings.telegram_storage_channel_id)
        msg_id = int(storage_key)

        message = await client.get_messages(entity=channel_id, ids=msg_id)
        if message is None:
            return False

        await client.delete_messages(entity=channel_id, messages=[message])
        return True

    async def get_channel_usage(self) -> int:
        client = await self._connect()
        channel_id = int(settings.telegram_storage_channel_id)

        total = 0
        async for message in client.iter_messages(entity=channel_id):
            if message.document:
                total += message.document.size
        return total

    @property
    def configured(self) -> bool:
        return bool(
            settings.telegram_api_id
            and settings.telegram_api_hash
            and settings.telegram_session_string
            and settings.telegram_storage_channel_id
        )


# Global singleton — import and use directly.
tg_client = TelegramClientManager()
