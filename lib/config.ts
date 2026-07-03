/**
 * The timezone all app dates are computed in ("today", period boundaries, the
 * dashboard date). The server runs in UTC, so without this, dates would be a
 * day off near midnight local time. Override with the APP_TIMEZONE env var.
 */
export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? "Asia/Singapore";
