import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface DatedEntry {
  pubDatetime: ContentDatetime;
  modDatetime?: ContentDatetime | null;
  timezone?: string;
}

/**
 * Resolves the display date of a post: the modified date when it is later
 * than the publish date, otherwise the publish date, in the post's timezone
 * (falling back to the site timezone).
 */
export function resolvePostDate(entry: DatedEntry) {
  const isModified =
    !!entry.modDatetime && toDate(entry.modDatetime) > toDate(entry.pubDatetime);

  const datetime = dayjs(
    toDate(isModified && entry.modDatetime ? entry.modDatetime : entry.pubDatetime)
  ).tz(entry.timezone ?? SITE.timezone);

  return { datetime, isModified };
}
