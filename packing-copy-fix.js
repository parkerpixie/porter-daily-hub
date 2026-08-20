(() => {
  const TARGET_TEXT = "Stuffed Animal: 1 Only!";
  const TRIP_KEY = "porterPacking:traversecity";
  const BAD_TRIP_MIGRATION_KEY = "porterPackingTraverseCity2026:v1";
  const CLOUD_BOOTSTRAP_KEY = "porterPackingCloudBootstrap:v1";
  const API_URL = "/api/packrat";
  const POLL_MS = 4000;

  const SUMMER_DEFAULTS = [
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
    TARGET_TEXT,
    "Book",
    "Raincoat",
    "Sandals",
    "Swimsuit",
    "Sunhat",
    "Sunglasses"
  ];

  const TRIP_DEFAULTS = [
    ["porter-shirts", "6 T-Shirts (5 days + 1 spare)"],
    ["porter-shorts", "2 Pairs of Shorts"],
    ["porter-pants", "2 Pairs of Pants"],
    ["porter-long-sleeve", "1 Long-Sleeve Shirt"],
    ["porter-hoodie", "1 Hoodie / Sweatshirt"],
    ["porter-underwear", "6 Underwear (5 days + 1 spare)"],
    ["porter-socks", "5 Pairs of Socks"],
    ["porter-extra-socks", "2 Extra Pairs of Socks for Hiking / Wet Feet"],
    ["porter-pajamas", "Pajamas"],
    ["porter-swimsuits", "2 Swimsuits → PUT IN SWIM BAG"],
    ["porter-rain", "Raincoat / Light Waterproof Jacket → GIANT TOTE"],
    ["porter-shoes", "Comfortable Hiking Shoes → GIANT TOTE"],
    ["porter-sandals", "Sandals"],
    ["porter-water-shoes", "Water Shoes → PUT IN SWIM BAG"],
    ["porter-hat", "Sun Hat / Cap → PUT IN BEACH BAG"],
    ["porter-sunglasses", "Sunglasses"],
    ["porter-water", "Refillable Water Bottle → GIANT TOTE"],
    ["porter-teeth", "Toothbrush + Toothpaste"],
    ["porter-deodorant", "Deodorant"],
    ["porter-shampoo", "Shampoo + Conditioner"],
    ["porter-body-wash", "Body Wash / Soap"],
    ["porter-hairbrush", "Hairbrush / Comb"],
    ["porter-medications", "PILLS / Medications"],
    ["porter-stuffed", TARGET_TEXT],
    ["porter-laundry", "Bag for Dirty Clothes"]
  ];

  let tripMode = false;
  let syncing = false;

  function id() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function build(items) {
    return items.map((text) => ({ id: id(), text, checked: false }));
  }

  function canonicalTripList(existing = []) {
    const byId = new Map(
      existing
        .filter((entry) => entry && entry.id)
        .map((entry) => [entry.id, entry])
    );
    const canonicalIds = new Set(TRIP_DEFAULTS.map(([canonicalId]) => canonicalId));

    const list = TRIP_DEFAULTS.map(([canonicalId, text]) => {
      const prior = byId.get(canonicalId);
      return { id: canonicalId, text, checked: Boolean(prior?.checked) };
    });

    for (const entry of existing) {
      const text = String(entry?.text || "").trim();
      if (!entry?.custom || !text || canonicalIds.has(entry.id)) continue;
      list.push({ id: entry.id || id(), text, checked: Boolean(entry.checked), custom: true });
    }

    return list;
  }

  function read(key) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  function save(key, list) {
    try {
      window.localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // Keep the visible app usable even if storage is unavailable.
    }
  }

  function readFlag(key) {
    try { return window.localStorage.getItem(key) === "true"; } catch { return false; }
  }

  function writeFlag(key) {
    try { window.localStorage.setItem(key, "true"); } catch {}
  }

  function esc(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function repairSummerIfNeeded() {
    const summer = read("porterPacking:summer");
    if (!summer) return;
    const texts = summer.map((item) => String(item?.text || ""));
    const wasReplacedByMyBadTripPatch =
      texts.some((text) => text.includes("5 T-Shirts + 1 Spare")) &&
      texts.some((text) => /Small Hiking \/ Day Backpack/i.test(text));

    if (wasReplacedByMyBadTripPatch) {
      save("porterPacking:summer", build(SUMMER_DEFAULTS));
    }

    try {
      window.localStorage.removeItem(BAD_TRIP_MIGRATION_KEY);
    } catch {}
  }

  function ensureTripList() {
    save(TRIP_KEY, canonicalTripList(read(TRIP_KEY) || []));
  }

  function normalizeStuffedAnimalCopy() {
    ["porterPacking:summer", "porterPacking:winter", TRIP_KEY].forEach((key) => {
      const list = read(key);
      if (!list) return;
      let changed = false;
      const updated = list.map((item) => {
        if (!item || !/stuffed\s+animal/i.test(String(item.text)) || item.text === TARGET_TEXT) return item;
        changed = true;
        return { ...item, text: TARGET_TEXT };
      });
      if (changed) save(key, updated);
    });
  }

  function setCloudStatus(message, isError = false) {
    if (!tripMode) return;
    const status = document.querySelector("#packingEmailStatus");
    if (!status) return;
    status.textContent = message;
    status.style.color = isError ? "#9b2f2f" : "";
  }

  function applyCloudState(data) {
    const cloudItems = data?.lists?.porter?.items;
    if (!Array.isArray(cloudItems)) return false;
    save(TRIP_KEY, canonicalTripList(cloudItems.map((entry) => ({
      id: entry.id || id(),
      text: String(entry.text || "").trim(),
      checked: Boolean(entry.checked),
      custom: Boolean(entry.custom)
    })).filter((entry) => entry.text)));
    if (tripMode) renderTrip();
    return true;
  }

  async function bootstrapCloudOnce() {
    if (readFlag(CLOUD_BOOTSTRAP_KEY)) return;
    const localItems = canonicalTripList(read(TRIP_KEY) || []);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bootstrapPorter", items: localItems })
      });
      if (!response.ok) throw new Error(`Bootstrap returned ${response.status}`);
      const data = await response.json();
      applyCloudState(data);
      writeFlag(CLOUD_BOOTSTRAP_KEY);
    } catch (error) {
      console.error("Porter PackRat bootstrap failed", error);
    }
  }

  async function syncFromCloud({ quiet = true } = {}) {
    if (syncing) return;
    syncing = true;
    if (!quiet) setCloudStatus("Syncing with PackRat…");
    try {
      const response = await fetch(API_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`Sync returned ${response.status}`);
      const data = await response.json();
      if (applyCloudState(data)) {
        setCloudStatus("Synced with PackRat • changes update across the family phones ✓");
      }
    } catch (error) {
      console.error("Porter PackRat sync failed", error);
      setCloudStatus("PackRat sync is offline right now. This phone still has the last saved copy.", true);
    } finally {
      syncing = false;
    }
  }

  async function cloudMutate(payload) {
    setCloudStatus("Saving to PackRat…");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Save returned ${response.status}`);
      const data = await response.json();
      applyCloudState(data);
      setCloudStatus("Saved in PackRat for everybody ✓");
      return true;
    } catch (error) {
      console.error("Porter PackRat save failed", error);
      setCloudStatus("Could not save to PackRat. Try again when the connection is back.", true);
      return false;
    }
  }

  function loadFeelingsWheel() {
    if (!document.querySelector('link[href="feelings-wheel.css"]')) {
      const stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.href = "feelings-wheel.css";
      document.head.appendChild(stylesheet);
    }
    if (!document.querySelector('script[src="feelings-wheel.js"]')) {
      const script = document.createElement("script");
      script.src = "feelings-wheel.js";
      script.defer = true;
      document.body.appendChild(script);
    }
  }

  function addTripButton() {
    const toggle = document.querySelector(".season-toggle");
    if (!toggle || toggle.querySelector("[data-trip-list='traversecity']")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "season-button";
    button.dataset.tripList = "traversecity";
    button.textContent = "🚗 TRAVERSE CITY";
    toggle.appendChild(button);
  }

  function itemClass(text) {
    const value = String(text).toUpperCase();
    if (value.includes("PILLS")) return " is-pills";
    if (value.includes("STUFFED ANIMAL")) return " is-stuffed";
    if (value.includes("SOCK")) return " is-socks";
    return "";
  }

  function setTripLabels() {
    const view = document.querySelector("#packingView");
    if (!view) return;
    view.querySelector(".packing-heading .scene-label").textContent = "TRAVERSE CITY • AUG 23–27";
    document.querySelector("#packingHeading").textContent = "PACK FOR 5 DAYS!";
    view.querySelector(".packing-heading p").textContent = "Porter's own five-day list. Items marked for the Giant Tote, Swim Bag, or Beach Bag are not done until they are physically in that bag.";
    document.querySelector("#resetPacking").textContent = "RESET TRIP LIST";
    view.querySelector(".print-note").textContent = "Porter's Traverse City packing list • Aug 23–27";
  }

  function restoreStandardLabels() {
    const view = document.querySelector("#packingView");
    if (!view) return;
    view.querySelector(".packing-heading .scene-label").textContent = "WEEKEND QUEST";
    document.querySelector("#packingHeading").textContent = "PACK THE BAG!";
    view.querySelector(".packing-heading p").textContent = "Check things off as they go into the bag. Added items stay on this device.";
    document.querySelector("#resetPacking").textContent = "RESET SEASON";
    view.querySelector(".print-note").textContent = "Porter's weekend packing list • Check every box before leaving";
  }

  function renderTrip() {
    const list = canonicalTripList(read(TRIP_KEY) || []);
    save(TRIP_KEY, list);
    const container = document.querySelector("#packingList");
    if (!container) return;

    tripMode = true;
    document.querySelectorAll("[data-season]").forEach((button) => button.classList.remove("is-active"));
    document.querySelector("[data-trip-list='traversecity']")?.classList.add("is-active");
    setTripLabels();

    document.querySelector("#packingSeasonLabel").textContent = "TRAVERSE CITY • 5-DAY PACKING LIST";
    document.querySelector("#packingProgress").textContent = `${list.filter((item) => item.checked).length} / ${list.length} PACKED`;

    container.innerHTML = list.map((item) => `
      <div class="packing-item${itemClass(item.text)}${item.checked ? " is-checked" : ""}" data-trip-packing-id="${esc(item.id)}">
        <label>
          <input type="checkbox" ${item.checked ? "checked" : ""}>
          <span class="custom-check" aria-hidden="true"></span>
          <span class="packing-text">${esc(item.text)}</span>
        </label>
        <button type="button" class="delete-packing-item" aria-label="Remove ${esc(item.text)}">×</button>
      </div>`).join("");

    setCloudStatus("Synced with PackRat • changes update across the family phones ✓");
  }

  function leaveTrip() {
    tripMode = false;
    document.querySelector("[data-trip-list='traversecity']")?.classList.remove("is-active");
    restoreStandardLabels();
  }

  function bindTripControls() {
    const listEl = document.querySelector("#packingList");
    const addForm = document.querySelector("#addPackingForm");
    const resetButton = document.querySelector("#resetPacking");
    const printButton = document.querySelector("#printPacking");
    const tripButton = document.querySelector("[data-trip-list='traversecity']");
    if (!listEl || !addForm || !resetButton || !printButton || !tripButton) return;

    tripButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      renderTrip();
      syncFromCloud({ quiet: false });
    }, true);

    document.querySelectorAll("[data-season]").forEach((button) => {
      button.addEventListener("click", () => {
        leaveTrip();
        window.setTimeout(restoreStandardLabels, 0);
      }, true);
    });

    listEl.addEventListener("change", (event) => {
      if (!tripMode) return;
      const input = event.target.closest("input[type='checkbox']");
      if (!input) return;
      event.stopImmediatePropagation();
      const row = input.closest("[data-trip-packing-id]");
      const list = read(TRIP_KEY) || [];
      const item = list.find((entry) => entry.id === row?.dataset.tripPackingId);
      if (!item) return;
      item.checked = input.checked;
      save(TRIP_KEY, list);
      renderTrip();
      cloudMutate({ action: "toggle", listId: "porter", itemId: item.id, checked: item.checked });
    }, true);

    listEl.addEventListener("click", (event) => {
      if (!tripMode) return;
      const button = event.target.closest(".delete-packing-item");
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const row = button.closest("[data-trip-packing-id]");
      const itemId = row?.dataset.tripPackingId;
      save(TRIP_KEY, (read(TRIP_KEY) || []).filter((item) => item.id !== itemId));
      renderTrip();
      cloudMutate({ action: "delete", listId: "porter", itemId });
    }, true);

    addForm.addEventListener("submit", (event) => {
      if (!tripMode) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const input = document.querySelector("#newPackingItem");
      const text = input?.value.trim();
      if (!text) return;
      input.value = "";
      cloudMutate({ action: "add", listId: "porter", text }).then(() => input.focus());
    }, true);

    resetButton.addEventListener("click", (event) => {
      if (!tripMode) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!window.confirm("Reset the Traverse City list to the original five-day items and uncheck everything?")) return;
      cloudMutate({ action: "resetList", listId: "porter" });
    }, true);

    printButton.addEventListener("click", (event) => {
      if (!tripMode) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      renderTrip();
      document.body.classList.add("print-packing");
      window.setTimeout(() => window.print(), 120);
    }, true);
  }

  function start() {
    loadFeelingsWheel();
    addTripButton();
    bindTripControls();
    normalizeStuffedAnimalCopy();

    bootstrapCloudOnce().then(() => syncFromCloud({ quiet: true }));
    window.setInterval(() => syncFromCloud({ quiet: true }), POLL_MS);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) syncFromCloud({ quiet: true });
    });

    const listEl = document.querySelector("#packingList");
    if (listEl) {
      const observer = new MutationObserver(() => {
        if (tripMode && !listEl.querySelector("[data-trip-packing-id]")) {
          window.setTimeout(renderTrip, 0);
        }
      });
      observer.observe(listEl, { childList: true, subtree: true });
    }
  }

  // This script runs before app.js. Repair Summer before app.js reads localStorage.
  repairSummerIfNeeded();
  ensureTripList();
  normalizeStuffedAnimalCopy();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(start, 0));
  } else {
    window.setTimeout(start, 0);
  }
})();
