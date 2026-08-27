"""
Telegram MTProto storage backend using Telethon.

Uses a user account session string (not a bot) to leverage the 2 GB upload
limit per file. Files are sent as documents to a private Telegram channel,
and a DB record is created to track metadata.
"""

from __future__ import annotations

import asyncio
import io
import logging
from typing import TYPE_CHECKING

from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.types import DocumentAttributeFilename, InputDocumentFileLocation

from dataclasses import dataclass

from app.core.config import settings

if TYPE_CHECKING:
    from telethon.tl.types import Message

logger = logging.getLogger(__name__)

_client: TelegramClient | None = None
_loop: asyncio.AbstractEventLoop | None = None


def _get_or_create_loop() -> asyncio.AbstractEventLoop:
    global _loop
    if _loop is None or _loop.is_closed():
        _loop = asyncio.new_event_loop()
    return _loop


async def _get_client() -> TelegramClient:
    global _client
    if _client is not None and _client.is_connected():
        return _client

    _client = TelegramClient(
        StringSession(settings.telegram_session_string),
        settings.telegram_api_id,
        settings.telegram_api_hash,
    )
    await _client.start()
    logger.info("[telegram] Client connected as user")
    return _client


def _run(coro):
    """Run an async coroutine from sync context, reusing or creating an event loop."""
    loop = _get_or_create_loop()
    try:
        running = loop.is_running()
    except RuntimeError:
        running = False

    if running:
        # We're already inside an async context (e.g. FastAPI).
        # Create a task and return its result via a future.
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            future = pool.submit(asyncio.run, coro)
            return future.result(timeout=300)
    else:
        return loop.run_until_complete(coro)


async def upload_file(
    file_bytes: bytes,
    filename: str,
    mime_type: str,
) -> dict:
    """Upload a file to the Telegram storage channel and return metadata."""
    client = await _get_client()
    channel_id = int(settings.telegram_storage_channel_id)

    file_obj = io.BytesIO(file_bytes)
    file_obj.name = filename

    message: Message = await client.send_file(
        entity=channel_id,
        file=file_obj,
        force_document=True,
        attributes=[DocumentAttributeFilename(filename=filename)],
        progress_callback=None,
    )

    doc = message.document
    storage_key = str(message.id)  # Use message ID as storage key
    size_bytes = doc.size if doc else len(file_bytes)

    logger.info(f"[telegram] Uploaded '{filename}' ({size_bytes} bytes) -> msg_id={storage_key}")

    return {
        "storage_key": storage_key,
        "filename": filename,
        "mime_type": mime_type,
        "size_bytes": size_bytes,
        "telegram_file_id": doc.id if doc else None,
    }


async def download_file(storage_key: str) -> bytes:
    """Download a file from the Telegram storage channel by message ID."""
    client = await _get_client()
    channel_id = int(settings.telegram_storage_channel_id)
    msg_id = int(storage_key)

    message: Message = await client.get_messages(entity=channel_id, ids=msg_id)
    if message is None or message.document is None:
        raise FileNotFoundError(f"File with storage_key={storage_key} not found in Telegram channel")

    buf = io.BytesIO()
    await client.download_media(message, file=buf)
    buf.seek(0)

    logger.info(f"[telegram] Downloaded msg_id={storage_key} ({buf.getbuffer().nbytes} bytes)")
    return buf.read()


async def delete_file(storage_key: str) -> bool:
    """Delete a file from the Telegram storage channel by message ID."""
    client = await _get_client()
    channel_id = int(settings.telegram_storage_channel_id)
    msg_id = int(storage_key)

    message: Message = await client.get_messages(entity=channel_id, ids=msg_id)
    if message is None:
        return False

    await client.delete_messages(entity=channel_id, messages=[message])
    logger.info(f"[telegram] Deleted msg_id={storage_key}")
    return True


async def get_channel_usage() -> int:
    """Get total storage used in the channel (sum of all document sizes)."""
    client = await _get_client()
    channel_id = int(settings.telegram_storage_channel_id)

    total = 0
    async for message in client.iter_messages(entity=channel_id):
        if message.document:
            total += message.document.size

    return total


# ---------------------------------------------------------------------------
# Legacy config class (used by main.py startup)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class TelegramStorageConfig:
    api_id: str
    api_hash: str
    session_string: str
    storage_channel_id: str


class TelegramStorageService:
    def __init__(self) -> None:
        self.config = TelegramStorageConfig(
            api_id=settings.telegram_api_id,
            api_hash=settings.telegram_api_hash,
            session_string=settings.telegram_session_string,
            storage_channel_id=settings.telegram_storage_channel_id,
        )

    @property
    def configured(self) -> bool:
        return all((
            self.config.api_id,
            self.config.api_hash,
            self.config.session_string,
            self.config.storage_channel_id,
        ))


# Sync wrappers for use in non-async FastAPI routes

def upload_file_sync(file_bytes: bytes, filename: str, mime_type: str) -> dict:
    return _run(upload_file(file_bytes, filename, mime_type))


def download_file_sync(storage_key: str) -> bytes:
    return _run(download_file(storage_key))


def delete_file_sync(storage_key: str) -> bool:
    return _run(delete_file(storage_key))


def get_channel_usage_sync() -> int:
    return _run(get_channel_usage())
