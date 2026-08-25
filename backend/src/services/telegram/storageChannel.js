import { env } from "../../config/env.js";
import { getTelegramClient, isTelegramConfigured } from "./telegramClient.js";

/**
 * Foundation for resolving the storage channel entity. Upload,
 * download, and chunking are deliberately NOT implemented here — this
 * phase only prepares the plumbing so that work can start cleanly.
 */

let storageChannelEntity = null;

export async function getStorageChannelId() {
  return env.TELEGRAM_STORAGE_CHANNEL_ID || null;
}

/**
 * Resolves and caches the storage channel entity via GramJS. Returns
 * null if Telegram isn't configured or the channel ID isn't set —
 * callers in this phase should treat that as "storage not available
 * yet", not as an error.
 */
export async function resolveStorageChannel() {
  if (!isTelegramConfigured() || !env.TELEGRAM_STORAGE_CHANNEL_ID) {
    return null;
  }

  if (storageChannelEntity) {
    return storageChannelEntity;
  }

  const client = await getTelegramClient();
  if (!client) return null;

  storageChannelEntity = await client.getEntity(env.TELEGRAM_STORAGE_CHANNEL_ID);
  return storageChannelEntity;
}

// Intentionally not exported/implemented yet:
//   uploadFileToChannel(...)
//   downloadFileFromChannel(...)
//   deleteFileFromChannel(...)
// These land in the storage-implementation phase, on top of the
// storage_objects table already created in the database migrations.
