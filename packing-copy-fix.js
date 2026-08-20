(() => {
  const TARGET_TEXT = "Stuffed Animal: 1 Only!";
  const TRIP_KEY = "porterPacking:traversecity";
  const BAD_TRIP_MIGRATION_KEY = "porterPackingTraverseCity2026:v1";

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
    "6 T-Shirts (5 days + 1 spare)",
    "2 Pairs of Shorts",
    "2 Pairs of Pants",
    "1 Long-Sleeve Shirt",
    "1 Hoodie / Sweatshirt",
    "6 Underwear (5 days + 1 spare)",
    "7 Pairs of Socks (5 days + 2 extra for hiking / wet feet)",
    "Pajamas",
    "2 Swimsuits",
    "Raincoat / Light Waterproof Jacket",
    "Hiking / Walking Shoes",
    "Sandals",
    "Sun Hat / Baseball Cap",
    "Sunglasses",
    "Sunscreen",
    "Bug Spray",
    "Small Hiking / Day Backpack",
    "Refillable Water Bottle",
    "Toothbrush / Toothpaste",
    "Deodorant + Shower Stuff",
    "PILLS",
    "Phone",
    "Chargers",
    "Headphones / Earbuds",
    TARGET_TEXT,
    "Book / Entertainment",
    "Bag for Dirty Clothes"
  ];

  let tripMode = false;

  function id() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function build(items) {
    return items.map((text) => ({ id: id(), text, checked: false }));
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
    if (!read(TRIP_KEY)) save(TRIP_KEY, build(TRIP_DEFAULTS));
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
    view.querySelector(".packing-heading p").textContent = "Porter's own five-day list. Check each item only after it is physically in the bag.";
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
    const list = read(TRIP_KEY) || build(TRIP_DEFAULTS);
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
    }, true);

    listEl.addEventListener("click", (event) => {
      if (!tripMode) return;
      const button = event.target.closest(".delete-packing-item");
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const row = button.closest("[data-trip-packing-id]");
      save(TRIP_KEY, (read(TRIP_KEY) || []).filter((item) => item.id !== row?.dataset.tripPackingId));
      renderTrip();
    }, true);

    addForm.addEventListener("submit", (event) => {
      if (!tripMode) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const input = document.querySelector("#newPackingItem");
      const text = input?.value.trim();
      if (!text) return;
      const list = read(TRIP_KEY) || [];
      list.push({ id: id(), text, checked: false });
      save(TRIP_KEY, list);
      input.value = "";
      renderTrip();
      input.focus();
    }, true);

    resetButton.addEventListener("click", (event) => {
      if (!tripMode) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!window.confirm("Reset the Traverse City list to the original five-day items and uncheck everything?")) return;
      save(TRIP_KEY, build(TRIP_DEFAULTS));
      renderTrip();
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
