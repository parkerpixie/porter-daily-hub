import { getStore } from "@netlify/blobs";

const STORE_NAME = "packrat-shared";
const STATE_KEY = "traverse-city-2026";
const TRIP_LABEL = "Traverse City • Aug 23–27";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8"
};

const item = (id, text) => ({ id, text, checked: false });

function personalBathroom(prefix, pillsText = "Medications") {
  return [
    item(`${prefix}-teeth`, "Toothbrush + toothpaste"),
    item(`${prefix}-deodorant`, "Deodorant"),
    item(`${prefix}-shampoo`, "Shampoo + conditioner"),
    item(`${prefix}-body-wash`, "Body wash / soap"),
    item(`${prefix}-hairbrush`, "Hairbrush / comb"),
    item(`${prefix}-medications`, pillsText)
  ];
}

function carBag(prefix) {
  return [
    item(`${prefix}-car-books`, "Books / Manga"),
    item(`${prefix}-car-gaming`, "Gaming Device"),
    item(`${prefix}-car-game-charger`, "Game Charger"),
    item(`${prefix}-car-phone-charger`, "Phone Charger"),
    item(`${prefix}-car-watch-charger`, "Watch Charger"),
    item(`${prefix}-car-other-chargers`, "Other Device Charger(s) / Cables"),
    item(`${prefix}-car-battery`, "External Battery Pack"),
    item(`${prefix}-car-headphones`, "Headphones / Earbuds")
  ];
}

function defaultLists() {
  return {
    jen: {
      title: "Jen's Bag",
      icon: "🧳",
      subtitle: "Clothes + personal bathroom / meds",
      items: [
        item("jen-tops", "6 tops / T-shirts"),
        item("jen-shorts", "2 pairs of shorts"),
        item("jen-pants", "2 pairs of pants / jeans"),
        item("jen-layer", "1 hoodie / sweatshirt"),
        item("jen-underwear", "6 underwear"),
        item("jen-socks", "5 pairs of socks"),
        item("jen-extra-socks", "2 extra pairs of socks for hiking / wet feet"),
        item("jen-pajamas", "Pajamas"),
        item("jen-swimsuits", "2 swimsuits → PUT IN SWIM BAG"),
        item("jen-rain", "Raincoat / light waterproof jacket → GIANT TOTE"),
        item("jen-walk", "Comfortable hiking shoes → GIANT TOTE"),
        item("jen-sandals", "Sandals"),
        item("jen-water-shoes", "Water shoes → PUT IN SWIM BAG"),
        item("jen-hat", "Sun hat / cap → PUT IN BEACH BAG"),
        item("jen-sunglasses", "Sunglasses"),
        item("jen-water-bottle", "Refillable water bottle → GIANT TOTE"),
        ...personalBathroom("jen"),
        item("jen-laundry", "Bag for dirty clothes")
      ]
    },
    blake: {
      title: "Blake's Bag",
      icon: "🎒",
      subtitle: "Clothes + personal bathroom / meds",
      items: [
        item("blake-shirts", "6 shirts / T-shirts"),
        item("blake-shorts", "2 pairs of shorts"),
        item("blake-pants", "2 pairs of pants"),
        item("blake-layer", "1 hoodie / sweatshirt"),
        item("blake-underwear", "6 underwear"),
        item("blake-socks", "5 pairs of socks"),
        item("blake-extra-socks", "2 extra pairs of socks for hiking / wet feet"),
        item("blake-pajamas", "Pajamas"),
        item("blake-swimsuit", "Swimsuit → PUT IN SWIM BAG"),
        item("blake-rain", "Raincoat / light waterproof jacket → GIANT TOTE"),
        item("blake-walk", "Comfortable hiking shoes → GIANT TOTE"),
        item("blake-sandals", "Sandals"),
        item("blake-water-shoes", "Water shoes → PUT IN SWIM BAG"),
        item("blake-hat", "Sun hat / cap → PUT IN BEACH BAG"),
        item("blake-sunglasses", "Sunglasses"),
        item("blake-water-bottle", "Refillable water bottle → GIANT TOTE"),
        ...personalBathroom("blake"),
        item("blake-laundry", "Bag for dirty clothes")
      ]
    },
    porter: {
      title: "Porter's Bag",
      icon: "🦧",
      subtitle: "Synced with Porter's Traverse City checklist",
      items: [
        item("porter-shirts", "6 T-Shirts (5 days + 1 spare)"),
        item("porter-shorts", "2 Pairs of Shorts"),
        item("porter-pants", "2 Pairs of Pants"),
        item("porter-long-sleeve", "1 Long-Sleeve Shirt"),
        item("porter-hoodie", "1 Hoodie / Sweatshirt"),
        item("porter-underwear", "6 Underwear (5 days + 1 spare)"),
        item("porter-socks", "5 Pairs of Socks"),
        item("porter-extra-socks", "2 Extra Pairs of Socks for Hiking / Wet Feet"),
        item("porter-pajamas", "Pajamas"),
        item("porter-swimsuits", "2 Swimsuits → PUT IN SWIM BAG"),
        item("porter-rain", "Raincoat / Light Waterproof Jacket → GIANT TOTE"),
        item("porter-shoes", "Comfortable Hiking Shoes → GIANT TOTE"),
        item("porter-sandals", "Sandals"),
        item("porter-water-shoes", "Water Shoes → PUT IN SWIM BAG"),
        item("porter-hat", "Sun Hat / Cap → PUT IN BEACH BAG"),
        item("porter-sunglasses", "Sunglasses"),
        item("porter-water", "Refillable Water Bottle → GIANT TOTE"),
        item("porter-teeth", "Toothbrush + Toothpaste"),
        item("porter-deodorant", "Deodorant"),
        item("porter-shampoo", "Shampoo + Conditioner"),
        item("porter-body-wash", "Body Wash / Soap"),
        item("porter-hairbrush", "Hairbrush / Comb"),
        item("porter-medications", "PILLS / Medications"),
        item("porter-stuffed", "Stuffed Animal: 1 Only!"),
        item("porter-laundry", "Bag for Dirty Clothes")
      ]
    },
    jenCar: {
      title: "Jen's Car Bag",
      icon: "🚗",
      subtitle: "Keep within reach during the drive",
      items: carBag("jen")
    },
    blakeCar: {
      title: "Blake's Car Bag",
      icon: "🚙",
      subtitle: "Keep within reach during the drive",
      items: carBag("blake")
    },
    porterCar: {
      title: "Porter's Car Bag",
      icon: "🦧",
      subtitle: "Books, gaming + chargers for the drive",
      items: carBag("porter")
    },
    hiking: {
      title: "Hiking + Outdoors",
      icon: "🥾",
      subtitle: "Shared check that the outdoor gear made it into the right place",
      items: [
        item("hiking-shoes", "Comfortable hiking shoes — Jen + Blake + Porter → GIANT TOTE"),
        item("hiking-socks", "Extra hiking socks — Jen + Blake + Porter → PERSONAL BAGS"),
        item("daypacks", "Day backpack"),
        item("water-bottles", "Refillable water bottles — Jen + Blake + Porter → GIANT TOTE"),
        item("hiking-poles", "Hiking poles"),
        item("rain-layers", "Raincoats — Jen + Blake + Porter → GIANT TOTE"),
        item("hats", "Sun hats / caps — Jen + Blake + Porter → BEACH BAG"),
        item("hiking-bug", "Bug spray"),
        item("trail-snacks", "Trail snacks"),
        item("offline-maps", "Download offline maps"),
        item("outdoor-first-aid", "Small first-aid kit")
      ]
    },
    swim: {
      title: "Swim + Beach",
      icon: "🏖️",
      subtitle: "Swim Bag + Beach Bag",
      items: [
        item("swimsuits", "Swimsuits — Jen + Blake + Porter → SWIM BAG"),
        item("towels", "3 Beach Towels"),
        item("water-shoes", "Water shoes — Jen + Blake + Porter → SWIM BAG"),
        item("beach-hats", "Sun hats / caps — Jen + Blake + Porter → BEACH BAG"),
        item("swim-sunscreen", "Sunscreen → BEACH BAG"),
        item("beach-bag", "Beach Bag"),
        item("wet-bag", "Wet swimsuit bag")
      ]
    },
    food: {
      title: "Grocery List / Food to Pack",
      icon: "🛒",
      subtitle: "Buy these, then make sure they leave with us",
      items: [
        item("trail-mix", "Trail Mix"),
        item("na-beer", "NA Beer"),
        item("thc-stuff", "THC Stuff"),
        item("jerky", "Jerky"),
        item("chocolate", "Chocolate")
      ]
    },
    house: {
      title: "Stuff for the House",
      icon: "🏠",
      subtitle: "Rental-house odds and ends",
      items: [
        item("kleenex", "Kleenex")
      ]
    },
    store: {
      title: "Things to Get at the Store",
      icon: "🛍️",
      subtitle: "Trip supplies we still need to buy",
      items: [
        item("store-bug-spray", "Bug Spray"),
        item("store-trail-snacks", "Trail Snacks")
      ]
    },
    entertainment: {
      title: "Games + Entertainment",
      icon: "🎲",
      subtitle: "Actual games to play with Blake's family",
      items: [
        item("cards", "Playing Cards"),
        item("escape-room", "Escape-Room Game(s)")
      ]
    },
    car: {
      title: "Car + Drive",
      icon: "🚙",
      subtitle: "Madison → Traverse City",
      items: [
        item("wallets", "Wallets / IDs"),
        item("reservation", "Hotel / lodging info saved"),
        item("phone-mount", "Phone mount"),
        item("drive-sunglasses", "Sunglasses"),
        item("napkins", "Napkins / wipes"),
        item("trash-bags", "Small trash bags"),
        item("roadside", "Roadside emergency kit"),
        item("gas", "Fill gas tank")
      ]
    },
    lastMinute: {
      title: "Last-Minute Grab",
      icon: "🚪",
      subtitle: "Do this before the car actually leaves",
      items: [
        item("phones", "Phones"),
        item("last-wallets", "Wallets / IDs"),
        item("last-meds", "Medications"),
        item("last-water", "Fill water bottles"),
        item("fridge", "Check fridge for trip food"),
        item("trash", "Take out trash"),
        item("doors", "Lock doors / windows"),
        item("thermostat", "Set thermostat"),
        item("final-bathroom", "Everyone use the bathroom before departure")
      ]
    }
  };
}

function defaultState() {
  return {
    version: 2,
    trip: TRIP_LABEL,
    updatedAt: new Date().toISOString(),
    lists: defaultLists()
  };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: CORS_HEADERS });
}

function cleanText(value) {
  return String(value || "").trim().slice(0, 120);
}

function uid() {
  return globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mergeDefaults(saved) {
  const defaults = defaultState();
  if (!saved || typeof saved !== "object") return defaults;

  const merged = {
    ...defaults,
    updatedAt: saved.updatedAt || defaults.updatedAt,
    lists: { ...defaults.lists }
  };

  for (const [listId, defaultList] of Object.entries(defaults.lists)) {
    const existing = saved.lists?.[listId];
    if (!existing || !Array.isArray(existing.items)) continue;

    const savedById = new Map(existing.items.filter(Boolean).map((entry) => [entry.id, entry]));
    const knownIds = new Set(defaultList.items.map((entry) => entry.id));
    const items = defaultList.items.map((entry) => {
      const prior = savedById.get(entry.id);
      return prior ? { ...entry, checked: Boolean(prior.checked) } : entry;
    });

    for (const entry of existing.items) {
      if (!entry?.custom || !entry.id || knownIds.has(entry.id) || !cleanText(entry.text)) continue;
      items.push({ id: entry.id, text: cleanText(entry.text), checked: Boolean(entry.checked), custom: true });
    }

    merged.lists[listId] = {
      ...defaultList,
      items
    };
  }

  return merged;
}

async function readState(store) {
  const saved = await store.get(STATE_KEY, { type: "json", consistency: "strong" });
  if (!saved) {
    const initial = defaultState();
    await store.setJSON(STATE_KEY, initial);
    return initial;
  }
  return mergeDefaults(saved);
}

async function writeState(store, state) {
  state.version = 2;
  state.trip = TRIP_LABEL;
  state.updatedAt = new Date().toISOString();
  await store.setJSON(STATE_KEY, state);
  return state;
}

function getList(state, listId) {
  if (!listId || !state.lists?.[listId]) return null;
  return state.lists[listId];
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const store = getStore({ name: STORE_NAME, consistency: "strong" });

  try {
    if (request.method === "GET") {
      return json(await readState(store));
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action;
    const state = await readState(store);

    if (action === "toggle") {
      const list = getList(state, body.listId);
      const target = list?.items.find((entry) => entry.id === body.itemId);
      if (!list || !target) return json({ error: "List item not found" }, 404);
      target.checked = Boolean(body.checked);
    } else if (action === "bootstrapPorter") {
      const list = getList(state, "porter");
      if (!list) return json({ error: "Porter list not found" }, 404);
      const incoming = Array.isArray(body.items) ? body.items : [];
      const byId = new Map(list.items.map((entry) => [entry.id, entry]));
      const existingText = new Set(list.items.map((entry) => cleanText(entry.text).toLowerCase()));

      for (const entry of incoming) {
        const text = cleanText(entry?.text);
        if (!text) continue;
        const known = byId.get(entry.id);
        if (known) {
          if (entry.checked) known.checked = true;
          continue;
        }
        if (!entry?.custom) continue;
        const normalized = text.toLowerCase();
        if (existingText.has(normalized)) continue;
        list.items.push({ id: entry.id || uid(), text, checked: Boolean(entry.checked), custom: true });
        existingText.add(normalized);
      }
    } else if (action === "add") {
      const list = getList(state, body.listId);
      const text = cleanText(body.text);
      if (!list) return json({ error: "List not found" }, 404);
      if (!text) return json({ error: "Item text is required" }, 400);
      list.items.push({ id: uid(), text, checked: false, custom: true });
    } else if (action === "delete") {
      const list = getList(state, body.listId);
      if (!list) return json({ error: "List not found" }, 404);
      const before = list.items.length;
      list.items = list.items.filter((entry) => entry.id !== body.itemId);
      if (list.items.length === before) return json({ error: "List item not found" }, 404);
    } else if (action === "resetList") {
      const defaults = defaultLists();
      if (!defaults[body.listId]) return json({ error: "List not found" }, 404);
      state.lists[body.listId] = defaults[body.listId];
    } else if (action === "resetAll") {
      return json(await writeState(store, defaultState()));
    } else {
      return json({ error: "Unknown action" }, 400);
    }

    return json(await writeState(store, state));
  } catch (error) {
    console.error("PackRat API error", error);
    return json({ error: "PackRat could not sync right now." }, 500);
  }
};
