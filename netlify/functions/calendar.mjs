import ical from "node-ical";

const CALENDAR_ID = "b22dcfe5357f18c66403ad323482075d2de77d009f86a8d9019be271eacee078@group.calendar.google.com";
const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`;
const DEFAULT_DAYS = 10;

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60, s-maxage=180, stale-while-revalidate=300",
      ...extraHeaders
    }
  });
}

function validDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "");
}

function paddedRange(startKey, endKey) {
  const start = validDateKey(startKey) ? new Date(`${startKey}T00:00:00Z`) : new Date();
  const end = validDateKey(endKey)
    ? new Date(`${endKey}T23:59:59Z`)
    : new Date(start.getTime() + DEFAULT_DAYS * 86400000);
  start.setUTCDate(start.getUTCDate() - 1);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function isAllDay(event) {
  return Boolean(
    event.isFullDay ||
    event.datetype === "date" ||
    event.start?.dateOnly ||
    event.end?.dateOnly
  );
}

function normalizedEvent(event, fallbackUid = "event") {
  if (!event?.start) return null;
  const start = event.start instanceof Date ? event.start : new Date(event.start);
  const endValue = event.end || new Date(start.getTime() + 60 * 60 * 1000);
  const end = endValue instanceof Date ? endValue : new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const uid = event.uid || fallbackUid;
  return {
    id: `${uid}:${start.toISOString()}`,
    uid,
    title: typeof event.summary === "string" ? event.summary.trim() : "Untitled event",
    location: typeof event.location === "string" ? event.location.trim() : "",
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: isAllDay(event)
  };
}

function overlaps(event, start, end) {
  return new Date(event.start) < end && new Date(event.end) > start;
}

export default async (request) => {
  if (request.method !== "GET") {
    return json({ error: "Only GET requests are supported." }, 405, { allow: "GET" });
  }

  const requestUrl = new URL(request.url);
  const { start, end } = paddedRange(
    requestUrl.searchParams.get("start"),
    requestUrl.searchParams.get("end")
  );

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    const calendarResponse = await fetch(ICS_URL, {
      headers: {
        accept: "text/calendar, text/plain;q=0.9, */*;q=0.8",
        "user-agent": "PorterDailyHub/1.0"
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeout));

    if (!calendarResponse.ok) {
      throw new Error(`Google Calendar returned ${calendarResponse.status}. Confirm the Porter calendar is public.`);
    }

    const icsText = await calendarResponse.text();
    const parsed = await ical.async.parseICS(icsText);
    const results = [];

    for (const [key, item] of Object.entries(parsed)) {
      if (!item || item.type !== "VEVENT" || item.status === "CANCELLED") continue;

      if (item.rrule) {
        const instances = ical.expandRecurringEvent(item, {
          from: start,
          to: end,
          includeOverrides: true,
          excludeExdates: true,
          expandOngoing: true
        });
        for (const instance of instances) {
          const normalized = normalizedEvent(instance, key);
          if (normalized && overlaps(normalized, start, end)) results.push(normalized);
        }
        continue;
      }

      if (item.recurrenceid) continue;
      const normalized = normalizedEvent(item, key);
      if (normalized && overlaps(normalized, start, end)) results.push(normalized);
    }

    const uniqueEvents = [...new Map(results.map((event) => [event.id, event])).values()]
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    return json({
      calendarId: CALENDAR_ID,
      timeZone: "America/Chicago",
      fetchedAt: new Date().toISOString(),
      events: uniqueEvents
    });
  } catch (error) {
    console.error("Calendar function failed", error);
    const message = error?.name === "AbortError"
      ? "Google Calendar took too long to respond."
      : error?.message || "Unable to read the Porter calendar.";
    return json({ error: message }, 502, { "cache-control": "no-store" });
  }
};
