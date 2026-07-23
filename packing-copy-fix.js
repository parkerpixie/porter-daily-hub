(() => {
  const TARGET_TEXT = "Stuffed Animal: 1 Only!";
  const STORAGE_KEYS = ["porterPacking:summer", "porterPacking:winter"];

  function isStuffedAnimal(text = "") {
    return /stuffed\s+animal/i.test(String(text));
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

  function fixVisiblePackingCopy() {
    document.querySelectorAll("#packingList .packing-text").forEach((label) => {
      if (isStuffedAnimal(label.textContent) && label.textContent !== TARGET_TEXT) {
        label.textContent = TARGET_TEXT;
      }
    });
    migrateStoredLists();
  }

  function start() {
    migrateStoredLists();

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
