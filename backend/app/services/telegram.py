from dataclasses import dataclass

from app.core.config import settings


@dataclass(frozen=True)
class TelegramStorageConfig:
    api_id: str
    api_hash: str
    session_string: str
    storage_channel_id: str


class TelegramStorageService:
    """Foundation only. File transfer is intentionally not implemented in this phase.

    The backend is Python, so the eventual GramJS MTProto worker should live as a
    separate Node service/process. This service keeps the configuration boundary
    stable without connecting to Telegram or uploading files yet.
    """

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
