"""
Telegram MTProto client manager.

Uses Telethon with a user account session string for 2 GB upload limit.
Designed to work properly inside FastAPI's async context.
"""

from __future__ import annotations

import asyncio
import io
import logging
import threading
from typing import Any

from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import DocumentAttributeFilename

from app.core.config import settings

logger = logging.getLogger(__name__)


class TelegramClientManager:
    """Thread-safe singleton that manages a Telethon client."""

    def __init__(self) -> None:
        self._client: TelegramClient | None = None
        self._lock = threading.Lock()

    async def _connect(self) -> TelegramClient:
        if self._client is not None and self._client.is_connected():
            return self._client

        api_id = int(settings.telegram_api_id)
        api_hash = settings.telegram_api_hash

        self._client = TelegramClient(
            StringSession(settings.telegram_session_string),
            api_id,
            api_hash,
            request_retries=3,
            auto_reconnect=True,
        )
        await self._client.start()
        logger.info("[tg] Client connected")
        return self._client

    async def upload(self, file_bytes: bytes, filename: str, mime_type: str) -> dict:
        client = await self._connect()
        channel_id = int(settings.telegram_storage_channel_id)

        file_obj = io.BytesIO(file_bytes)
        file_obj.name = filename

        message = await client.send_file(
            entity=channel_id,
            file=file_obj,
            force_document=True,
            attributes=[DocumentAttributeFilename(file_name=filename)],
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

    @property
    def configured(self) -> bool:
        return bool(
            settings.telegram_api_id
            and settings.telegram_api_hash
            and settings.telegram_session_string
            and settings.telegram_storage_channel_id
        )


tg_client = TelegramClientManager()
