const TIME_ZONE = "America/Chicago";
const API_URL = "/api/calendar";
const MIN_FREE_MINUTES = 15;

const PERIODS = [
  { id: "morning", label: "MORNING", subtitle: "6:00 AM to lunch", startHour: 6, endHour: 12 },
  { id: "afternoon", label: "AFTERNOON", subtitle: "Lunch to dinner", startHour: 12, endHour: 17 },
  { id: "evening", label: "EVENING", subtitle: "Dinner to 10:00 PM", startHour: 17, endHour: 22 }
];

const PACKING_DEFAULTS = {
  summer: [
    "2 T-Shirts",
    "2 Shorts",
    "1 Sweatshirt",
    "1 Pair of Pants",
    "3 Pairs of Socks",
    "3 Underwear",
    "Pajamas",
    "Toothbrush / Toothpaste",
    "PILLS",
    "Chargers",
    "Stuffed Animal ONLY!",
    "Book",
    "Raincoat",
    "Sandals",
    "Swimsuit",
    "Sunhat",
    "Sunglasses"
  ],
  winter: [
    "2 Shirts",
    "2 Sweatshirts",
    "2 Pairs of Pants",
    "3 Underwear",
    "3 Pairs of Socks",
    "Pajamas",
    "Toothbrush / Toothpaste",
    "PILLS",
    "Chargers",
    "Stuffed Animal",
    "Book",
    "Winter Coat",
    "Snow Pants",
    "Gloves",
    "Hat",
    "Boots"
  ]
};

const state = {
  selectedDate: dateKeyInTimeZone(new Date()),
  events: [],
  view: "daily",
  loading: false,
  lastSynced: null,
  packingSeason: safeStorageGet("porterPackingSeason") || "summer",
  packingLists: {}
};

state.packingLists.summer = loadPackingList("summer");
state.packingLists.winter = loadPackingList("winter");

const els = {
  status: document.querySelector("#statusMessage"),
  dailyView: document.querySelector("#dailyView"),
  weekView: document.querySelector("#weekView"),
  packingView: document.querySelector("#packingView"),
  dailyHeading: document.querySelector("#dailyHeading"),
  nowHeading: document.querySelector("#nowHeading"),
  nowDetails: document.querySelector("#nowDetails"),
  prepSection: document.querySelector("#prepSection"),
  prepHeading: document.querySelector("#prepHeading"),
  prepDetails: document.querySelector("#prepDetails"),
  prepChecklist: document.querySelector("#prepChecklist"),
  allDaySection: document.querySelector("#allDaySection"),
  allDayEvents: document.querySelector("#allDayEvents"),
  dailyTimeline: document.querySelector("#dailyTimeline"),
  weekRange: document.querySelector("#weekRange"),
  weekGrid: document.querySelector("#weekGrid"),
  lastSynced: document.querySelector("#lastSynced"),
  packingSeasonLabel: document.querySelector("#packingSeasonLabel"),
  packingProgress: document.querySelector("#packingProgress"),
  packingList: document.querySelector("#packingList"),
  addPackingForm: document.querySelector("#addPackingForm"),
  newPackingItem: document.querySelector("#newPackingItem")
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The dashboard still works if local storage is unavailable.
  }
}

function readStoredJson(key, fallback) {
  const raw = safeStorageGet(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function createListId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function defaultPackingList(season) {
  return PACKING_DEFAULTS[season].map((text) => ({
    id: createListId(),
    text,
    checked: false
  }));
}

function loadPackingList(season) {
  const stored = readStoredJson(`porterPacking:${season}`, null);
  if (!Array.isArray(stored)) return defaultPackingList(season);
  return stored
    .filter((item) => item && typeof item.text === "string")
    .map((item) => ({
      id: item.id || createListId(),
      text: item.text.trim(),
      checked: Boolean(item.checked)
    }));
}

function savePackingList(season) {
  safeStorageSet(`porterPacking:${season}`, JSON.stringify(state.packingLists[season]));
}

function dateKeyInTimeZone(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function keyToNoonUtc(dateKey) {
  return new Date(`${dateKey}T12:00:00Z`);
}

function addDays(dateKey, amount) {
  const date = keyToNoonUtc(dateKey);
  date.setUTCDate(date.getUTCDate() + amount);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function startOfWeek(dateKey) {
  const date = keyToNoonUtc(dateKey);
  return addDays(dateKey, -date.getUTCDay());
}

function getTimeZoneOffset(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour) % 24,
    Number(values.minute),
    Number(values.second)
  );
  return asUtc - date.getTime();
}

function zonedDate(dateKey, hour = 0, minute = 0) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const guess = Date.UTC(year, month - 1, day, hour, minute, 0);
  let result = new Date(guess - getTimeZoneOffset(new Date(guess), TIME_ZONE));
  result = new Date(guess - getTimeZoneOffset(result, TIME_ZONE));
  return result;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDateHeading(dateKey) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(zonedDate(dateKey, 12));
}

function formatShortDate(dateKey) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric"
  }).format(zonedDate(dateKey, 12));
}

function formatTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatTimeRange(start, end) {
  return `${formatTime(start)}–${formatTime(end)}`;
}

function formatDuration(milliseconds) {
  const totalMinutes = Math.max(0, Math.round(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} hr${hours === 1 ? "" : "s"}`;
  return `${hours} hr ${minutes} min`;
}

function eventDates(event) {
  return {
    start: new Date(event.start),
    end: new Date(event.end)
  };
}

function eventsForDay(dateKey) {
  const dayStart = zonedDate(dateKey, 0);
  const dayEnd = zonedDate(addDays(dateKey, 1), 0);
  return state.events.filter((event) => {
    const { start, end } = eventDates(event);
    return start < dayEnd && end > dayStart;
  });
}

function timedEventsForPeriod(dateKey, period) {
  const periodStart = zonedDate(dateKey, period.startHour);
  const periodEnd = zonedDate(dateKey, period.endHour);
  return eventsForDay(dateKey)
    .filter((event) => !event.allDay)
    .map((event) => ({ ...event, ...eventDates(event) }))
    .filter((event) => event.start < periodEnd && event.end > periodStart)
    .sort((a, b) => a.start - b.start);
}

function mergeBusyIntervals(events, rangeStart, rangeEnd) {
  const intervals = events
    .map((event) => ({
      start: new Date(Math.max(event.start.getTime(), rangeStart.getTime())),
      end: new Date(Math.min(event.end.getTime(), rangeEnd.getTime()))
    }))
    .filter((interval) => interval.end > interval.start)
    .sort((a, b) => a.start - b.start);

  const merged = [];
  for (const interval of intervals) {
    const previous = merged.at(-1);
    if (!previous || interval.start > previous.end) {
      merged.push({ ...interval });
    } else if (interval.end > previous.end) {
      previous.end = interval.end;
    }
  }
  return merged;
}

function freeBlocksForPeriod(dateKey, period) {
  const rangeStart = zonedDate(dateKey, period.startHour);
  const rangeEnd = zonedDate(dateKey, period.endHour);
  const busy = mergeBusyIntervals(timedEventsForPeriod(dateKey, period), rangeStart, rangeEnd);
  const free = [];
  let cursor = rangeStart;

  for (const interval of busy) {
    if ((interval.start - cursor) / 60000 >= MIN_FREE_MINUTES) {
      free.push({ start: cursor, end: interval.start });
    }
    if (interval.end > cursor) cursor = interval.end;
  }

  if ((rangeEnd - cursor) / 60000 >= MIN_FREE_MINUTES) {
    free.push({ start: cursor, end: rangeEnd });
  }
  return free;
}

function orderedItemsForPeriod(dateKey, period) {
  const events = timedEventsForPeriod(dateKey, period).map((event) => ({ type: "event", ...event }));
  const free = freeBlocksForPeriod(dateKey, period).map((block) => ({ type: "free", ...block }));
  return [...events, ...free].sort((a, b) => a.start - b.start || (a.type === "event" ? -1 : 1));
}

function renderEventCard(event) {
  const location = event.location
    ? `<span class="event-location">📍 ${escapeHtml(event.location)}</span>`
    : "";
  return `
    <article class="event-card">
      <span class="event-time">${escapeHtml(formatTimeRange(event.start, event.end))}</span>
      <strong class="event-title">${escapeHtml(event.title || "Untitled event")}</strong>
      ${location}
    </article>`;
}

function renderFreeCard(block) {
  return `
    <article class="free-card">
      <span class="free-time">${escapeHtml(formatTimeRange(block.start, block.end))}</span>
      <strong class="free-title">Available block</strong>
      <span class="free-duration">${escapeHtml(formatDuration(block.end - block.start))} open</span>
    </article>`;
}

function dayTimedEvents(dateKey) {
  return eventsForDay(dateKey)
    .filter((event) => !event.allDay)
    .map((event) => ({ ...event, ...eventDates(event) }))
    .sort((a, b) => a.start - b.start);
}

function focusEventForSelectedDay() {
  const events = dayTimedEvents(state.selectedDate);
  if (!events.length) return null;

  if (state.selectedDate !== dateKeyInTimeZone(new Date())) return events[0];

  const now = new Date();
  return events.find((event) => event.start <= now && event.end > now)
    || events.find((event) => event.start > now)
    || null;
}

function checklistForTitle(title = "") {
  const value = title.toLowerCase();

  if (/(tae\s*kwon\s*do|taekwondo|\btkd\b)/i.test(value)) {
    return {
      heading: "TAEKWONDO READY CHECK",
      items: [
        "Check today's class type",
        "Find the correct uniform",
        "Get shoes",
        "Find phone"
      ]
    };
  }

  if (/\bact\s+groups?\b/i.test(value) || value.includes("achieve collaborate treatment")) {
    return {
      heading: "ACT GROUP READY CHECK",
      items: [
        "Phone",
        "Wallet",
        "Weather-appropriate clothing",
        "Put on shoes",
        "Confirm shoes are good for walking"
      ]
    };
  }

  if (/\bwork\b/i.test(value) || value.includes("culver")) {
    return {
      heading: "WORK UNIFORM CHECK",
      items: [
        "Phone",
        "Wallet",
        "Uniform: Hat",
        "Uniform: Shirt",
        "Uniform: Pants",
        "Uniform: Belt",
        "🧦 Uniform: SOCKS",
        "Uniform: Shoes"
      ]
    };
  }

  return null;
}

function prepStorageKey(event) {
  return `porterPrep:${event.id}`;
}

function renderPrepPanel() {
  const event = focusEventForSelectedDay();
  const checklist = event ? checklistForTitle(event.title) : null;

  if (!event || !checklist) {
    els.prepSection.classList.add("is-hidden");
    els.prepChecklist.innerHTML = "";
    return;
  }

  const storageKey = prepStorageKey(event);
  const checkedIndexes = new Set(readStoredJson(storageKey, []));

  els.prepSection.classList.remove("is-hidden");
  els.prepHeading.textContent = checklist.heading;
  els.prepDetails.textContent = `${event.title} • ${formatTimeRange(event.start, event.end)}`;
  els.prepChecklist.innerHTML = checklist.items.map((item, index) => {
    const isChecked = checkedIndexes.has(index);
    const itemClass = item.includes("SOCKS") ? " is-socks" : "";
    return `
      <label class="prep-item${itemClass}${isChecked ? " is-checked" : ""}">
        <input type="checkbox" data-prep-key="${escapeHtml(storageKey)}" data-prep-index="${index}" ${isChecked ? "checked" : ""}>
        <span class="custom-check" aria-hidden="true"></span>
        <span>${escapeHtml(item)}</span>
      </label>`;
  }).join("");
}

function renderDailyView() {
  els.dailyHeading.textContent = formatDateHeading(state.selectedDate).toUpperCase();
  renderNowPanel();
  renderPrepPanel();
  renderAllDayEvents();

  els.dailyTimeline.innerHTML = PERIODS.map((period) => {
    const items = orderedItemsForPeriod(state.selectedDate, period);
    const content = items.length
      ? items.map((item) => item.type === "event" ? renderEventCard(item) : renderFreeCard(item)).join("")
      : `<div class="empty-card">No calendar blocks in this part of the day.</div>`;

    return `
      <section class="time-panel manga-panel" aria-labelledby="${period.id}Heading">
        <header class="time-panel-header">
          <h3 id="${period.id}Heading">${period.label}</h3>
          <p>${period.subtitle}</p>
        </header>
        <div class="panel-content">${content}</div>
      </section>`;
  }).join("");
}

function renderAllDayEvents() {
  const events = eventsForDay(state.selectedDate).filter((event) => event.allDay);
  els.allDaySection.classList.toggle("is-hidden", events.length === 0);
  els.allDayEvents.innerHTML = events
    .map((event) => `<div class="all-day-chip">${escapeHtml(event.title || "All-day event")}</div>`)
    .join("");
}

function renderNowPanel() {
  const today = dateKeyInTimeZone(new Date());
  const dayEvents = dayTimedEvents(state.selectedDate);

  if (state.selectedDate !== today) {
    if (!dayEvents.length) {
      els.nowHeading.textContent = "This day has no fixed appointments";
      els.nowDetails.textContent = "The three panels below show the open blocks available for planning.";
      return;
    }
    const first = dayEvents[0];
    els.nowHeading.textContent = `First up: ${first.title}`;
    els.nowDetails.textContent = `${formatTimeRange(first.start, first.end)}${first.location ? ` • ${first.location}` : ""}`;
    return;
  }

  const now = new Date();
  const ongoing = dayEvents.find((event) => event.start <= now && event.end > now);
  if (ongoing) {
    els.nowHeading.textContent = `Right now: ${ongoing.title}`;
    els.nowDetails.textContent = `Until ${formatTime(ongoing.end)}${ongoing.location ? ` • ${ongoing.location}` : ""}`;
    return;
  }

  const next = dayEvents.find((event) => event.start > now);
  if (next) {
    els.nowHeading.textContent = `Next: ${next.title}`;
    els.nowDetails.textContent = `${formatTimeRange(next.start, next.end)} • ${formatDuration(next.start - now)} from now${next.location ? ` • ${next.location}` : ""}`;
    return;
  }

  els.nowHeading.textContent = "No more fixed appointments today";
  els.nowDetails.textContent = "The rest of today's visible blocks are available unless you choose to plan something there.";
}

function miniItem(item) {
  if (item.type === "event") {
    return `
      <div class="mini-item">
        <span class="mini-time">${escapeHtml(formatTime(item.start))}</span>
        <span>${escapeHtml(item.title || "Untitled event")}</span>
      </div>`;
  }
  return `
    <div class="mini-item is-free">
      <span class="mini-time">${escapeHtml(formatTimeRange(item.start, item.end))}</span>
      <span>OPEN • ${escapeHtml(formatDuration(item.end - item.start))}</span>
    </div>`;
}

function renderWeekView() {
  const weekStart = startOfWeek(state.selectedDate);
  const weekEnd = addDays(weekStart, 6);
  els.weekRange.textContent = `${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)}`;
  const today = dateKeyInTimeZone(new Date());

  els.weekGrid.innerHTML = Array.from({ length: 7 }, (_, index) => {
    const dateKey = addDays(weekStart, index);
    const date = zonedDate(dateKey, 12);
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, weekday: "long" }).format(date);
    const allDay = eventsForDay(dateKey).filter((event) => event.allDay);
    const allDayHtml = allDay.length
      ? `<div class="mini-item"><span class="mini-time">ALL DAY</span><span>${allDay.map((event) => escapeHtml(event.title)).join(" • ")}</span></div>`
      : "";

    const periodsHtml = PERIODS.map((period, periodIndex) => {
      const items = orderedItemsForPeriod(dateKey, period);
      const visibleItems = items.slice(0, 7);
      const overflow = items.length > visibleItems.length
        ? `<div class="mini-item"><span></span><span>+${items.length - visibleItems.length} more</span></div>`
        : "";
      return `
        <section class="week-period">
          <h4>${period.label}</h4>
          ${periodIndex === 0 ? allDayHtml : ""}
          ${visibleItems.length ? visibleItems.map(miniItem).join("") : `<div class="mini-item is-free"><span></span><span>OPEN</span></div>`}
          ${overflow}
        </section>`;
    }).join("");

    return `
      <article class="week-day${dateKey === today ? " is-today" : ""}">
        <header class="week-date">
          <strong>${escapeHtml(weekday.toUpperCase())}</strong>
          <span>${escapeHtml(formatShortDate(dateKey).toUpperCase())}</span>
        </header>
        ${periodsHtml}
      </article>`;
  }).join("");
}

function packingItemClass(text) {
  const value = text.toUpperCase();
  if (value.includes("PILLS")) return " is-pills";
  if (value.includes("STUFFED ANIMAL")) return " is-stuffed";
  if (value.includes("SOCK")) return " is-socks";
  return "";
}

function renderPackingView() {
  const season = state.packingSeason;
  const list = state.packingLists[season];
  const checkedCount = list.filter((item) => item.checked).length;

  document.querySelectorAll("[data-season]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.season === season);
  });

  els.packingSeasonLabel.textContent = `${season.toUpperCase()} PACKING LIST`;
  els.packingProgress.textContent = `${checkedCount} / ${list.length} PACKED`;
  els.packingList.innerHTML = list.map((item) => `
    <div class="packing-item${packingItemClass(item.text)}${item.checked ? " is-checked" : ""}" data-packing-id="${escapeHtml(item.id)}">
      <label>
        <input type="checkbox" ${item.checked ? "checked" : ""}>
        <span class="custom-check" aria-hidden="true"></span>
        <span class="packing-text">${escapeHtml(item.text)}</span>
      </label>
      <button type="button" class="delete-packing-item" aria-label="Remove ${escapeHtml(item.text)}">×</button>
    </div>`).join("");
}

function render() {
  renderDailyView();
  renderWeekView();
  renderPackingView();
}

function setStatus(message, type = "loading") {
  els.status.textContent = message;
  els.status.classList.toggle("is-error", type === "error");
  els.status.classList.toggle("is-ready", type === "ready");
}

async function loadCalendar({ quiet = false } = {}) {
  if (state.loading) return;
  state.loading = true;
  if (!quiet) setStatus("Connecting to Porter's calendar…");

  const rangeStart = addDays(startOfWeek(state.selectedDate), -1);
  const rangeEnd = addDays(rangeStart, 10);

  try {
    const response = await fetch(`${API_URL}?start=${encodeURIComponent(rangeStart)}&end=${encodeURIComponent(rangeEnd)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "The calendar connection did not respond.");

    state.events = Array.isArray(payload.events) ? payload.events : [];
    state.lastSynced = payload.fetchedAt ? new Date(payload.fetchedAt) : new Date();
    els.lastSynced.textContent = `Calendar refreshed ${formatTime(state.lastSynced)}`;
    setStatus("Calendar ready", "ready");
    render();
  } catch (error) {
    console.error(error);
    setStatus(`Calendar snag: ${error.message} Try refreshing in a minute.`, "error");
    render();
  } finally {
    state.loading = false;
  }
}

function setView(view) {
  state.view = view;
  els.dailyView.classList.toggle("is-hidden", view !== "daily");
  els.weekView.classList.toggle("is-hidden", view !== "week");
  els.packingView.classList.toggle("is-hidden", view !== "packing");
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
}

function printWeek() {
  setView("week");
  renderWeekView();
  document.body.classList.add("print-week");
  window.setTimeout(() => window.print(), 120);
}

function printPacking() {
  setView("packing");
  renderPackingView();
  document.body.classList.add("print-packing");
  window.setTimeout(() => window.print(), 120);
}

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#previousDay").addEventListener("click", async () => {
  state.selectedDate = addDays(state.selectedDate, -1);
  await loadCalendar();
});

document.querySelector("#nextDay").addEventListener("click", async () => {
  state.selectedDate = addDays(state.selectedDate, 1);
  await loadCalendar();
});

document.querySelector("#goToday").addEventListener("click", async () => {
  state.selectedDate = dateKeyInTimeZone(new Date());
  await loadCalendar();
});

document.querySelector("#printWeek").addEventListener("click", printWeek);
document.querySelector("#printFromWeek").addEventListener("click", printWeek);
document.querySelector("#printPacking").addEventListener("click", printPacking);

els.prepChecklist.addEventListener("change", (event) => {
  const input = event.target.closest("input[type='checkbox'][data-prep-key]");
  if (!input) return;
  const key = input.dataset.prepKey;
  const index = Number(input.dataset.prepIndex);
  const checked = new Set(readStoredJson(key, []));
  if (input.checked) checked.add(index);
  else checked.delete(index);
  safeStorageSet(key, JSON.stringify([...checked]));
  input.closest(".prep-item")?.classList.toggle("is-checked", input.checked);
});

document.querySelectorAll("[data-season]").forEach((button) => {
  button.addEventListener("click", () => {
    state.packingSeason = button.dataset.season;
    safeStorageSet("porterPackingSeason", state.packingSeason);
    renderPackingView();
  });
});

els.packingList.addEventListener("change", (event) => {
  const input = event.target.closest("input[type='checkbox']");
  if (!input) return;
  const row = input.closest("[data-packing-id]");
  const item = state.packingLists[state.packingSeason].find((entry) => entry.id === row?.dataset.packingId);
  if (!item) return;
  item.checked = input.checked;
  savePackingList(state.packingSeason);
  renderPackingView();
});

els.packingList.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-packing-item");
  if (!button) return;
  const row = button.closest("[data-packing-id]");
  state.packingLists[state.packingSeason] = state.packingLists[state.packingSeason]
    .filter((item) => item.id !== row?.dataset.packingId);
  savePackingList(state.packingSeason);
  renderPackingView();
});

els.addPackingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = els.newPackingItem.value.trim();
  if (!text) return;
  state.packingLists[state.packingSeason].push({
    id: createListId(),
    text,
    checked: false
  });
  savePackingList(state.packingSeason);
  els.newPackingItem.value = "";
  renderPackingView();
  els.newPackingItem.focus();
});

document.querySelector("#resetPacking").addEventListener("click", () => {
  const seasonName = state.packingSeason === "summer" ? "summer" : "winter";
  const okay = window.confirm(`Reset the ${seasonName} list to the original items and uncheck everything?`);
  if (!okay) return;
  state.packingLists[state.packingSeason] = defaultPackingList(state.packingSeason);
  savePackingList(state.packingSeason);
  renderPackingView();
});

window.addEventListener("afterprint", () => {
  document.body.classList.remove("print-week", "print-packing");
});

window.addEventListener("focus", () => loadCalendar({ quiet: true }));
setInterval(() => loadCalendar({ quiet: true }), 5 * 60_000);

renderPackingView();
loadCalendar();