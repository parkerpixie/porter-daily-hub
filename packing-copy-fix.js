(() => {
  const TARGET_TEXT = "Stuffed Animal: 1 Only!";
  const STORAGE_KEYS = ["porterPacking:summer", "porterPacking:winter"];
  const TRIP_MIGRATION_KEY = "porterPackingTraverseCity2026:v1";

  const TRAVERSE_CITY_LIST = [
    "👕 5 T-Shirts + 1 Spare",
    "🩳 2 Pairs of Shorts",
    "👖 2 Pairs of Pants",
    "👚 1 Long-Sleeve Shirt",
    "🧥 1 Hoodie / Sweatshirt",
    "🩲 5 Underwear + 1 Spare",
    "🧦 5 Pairs of Socks + 2 Extra Pairs for Hiking / Wet Feet",
    "😴 Pajamas",
    "🏊 2 Swimsuits",
    "🌧 Raincoat / Light Waterproof Jacket",
    "🥾 Hiking / Walking Shoes",
    "🩴 Sandals",
    "🧢 Sun Hat / Baseball Cap",
    "🕶 Sunglasses",
    "🧴 Sunscreen",
    "🦟 Bug Spray",
    "🎒 Small Hiking / Day Backpack",
    "💧 Refillable Water Bottle",
    "🪥 Toothbrush / Toothpaste",
    "🧼 Deodorant + Shower Stuff",
    "💊 PILLS",
    "📱 Phone",
    "🔌 Chargers",
    "🎧 Headphones / Earbuds",
    "🧸 Stuffed Animal: 1 Only!",
    "📚 Book / Entertainment",
    "🧺 Bag for Dirty Clothes",
    "🎣 Fishing Gear ONLY if the family decides to fish"
  ];

  function createListId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function buildTraverseCityList() {
    return TRAVERSE_CITY_LIST.map((text) => ({
      id: createListId(),
      text,
      checked: false
    }));
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

  function isStuffedAnimal(text = "") {
    return /stuffed\s+animal/i.test(String(text));
  }

  function installTraverseCityList() {
    try {
      if (window.localStorage.getItem(TRIP_MIGRATION_KEY) === "done") return;
      window.localStorage.setItem("porterPacking:summer", JSON.stringify(buildTraverseCityList()));
      window.localStorage.setItem("porterPackingSeason", "summer");
      window.localStorage.setItem(TRIP_MIGRATION_KEY, "done");
    } catch {
      // The dashboard still works if browser storage is unavailable.
    }
  }

  function migrateStoredLists() {
    for (const key of STORAGE_KEYS) {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;

        const list = JSON.parse(raw);
        if (!Array.isArray(list)) continue;

        let changed = false;
        const updated = list.map((item) => {
          if (!item || !isStuffedAnimal(item.text) || item.text === TARGET_TEXT) return item;
          changed = true;
          return { ...item, text: TARGET_TEXT };
        });

        if (changed) window.localStorage.setItem(key, JSON.stringify(updated));
      } catch {
        // The visible list still works when browser storage is unavailable.
      }
    }
  }

  function updateTripLabels() {
    const packingView = document.querySelector("#packingView");
    if (!packingView) return;

    const kicker = packingView.querySelector(".packing-heading .scene-label");
    const heading = document.querySelector("#packingHeading");
    const intro = packingView.querySelector(".packing-heading p");
    const summerButton = document.querySelector('[data-season="summer"]');
    const seasonLabel = document.querySelector("#packingSeasonLabel");
    const printNote = packingView.querySelector(".print-note");

    if (kicker) kicker.textContent = "TRAVERSE CITY QUEST • AUG 23–27";
    if (heading) heading.textContent = "PACK FOR 5 DAYS!";
    if (intro) intro.textContent = "Weather-ready list for swimming, walking, hiking, cool evenings, and a little rain. Check each item only after it is physically in the bag.";
    if (summerButton) summerButton.textContent = "🏕 TRAVERSE CITY";
    if (seasonLabel && window.localStorage.getItem("porterPackingSeason") !== "winter") {
      seasonLabel.textContent = "TRAVERSE CITY • 5-DAY PACKING LIST";
    }
    if (printNote) printNote.textContent = "Porter's Traverse City packing list • Sunday Aug 23 through Thursday Aug 27";
  }

  function fixVisiblePackingCopy() {
    document.querySelectorAll("#packingList .packing-text").forEach((label) => {
      if (isStuffedAnimal(label.textContent) && label.textContent !== TARGET_TEXT) {
        label.textContent = TARGET_TEXT;
      }
    });
    migrateStoredLists();
    updateTripLabels();
  }

  function start() {
    loadFeelingsWheel();
    installTraverseCityList();
    migrateStoredLists();
    updateTripLabels();

    const list = document.querySelector("#packingList");
    if (!list) return;

    const observer = new MutationObserver(() => fixVisiblePackingCopy());
    observer.observe(list, { childList: true, subtree: true, characterData: true });

    fixVisiblePackingCopy();
    document.addEventListener("click", () => window.setTimeout(fixVisiblePackingCopy, 0));
    document.addEventListener("change", () => window.setTimeout(fixVisiblePackingCopy, 0));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(start, 0));
  } else {
    window.setTimeout(start, 0);
  }
})();
