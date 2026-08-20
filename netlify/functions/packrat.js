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

function defaultLists() {
  return {
    jen: {
      title: "Jen's Bag",
      icon: "🧳",
      subtitle: "Clothes + personal stuff",
      items: [
        item("jen-tops", "6 tops / T-shirts"),
        item("jen-shorts", "2 pairs of shorts"),
        item("jen-pants", "2 pairs of pants / jeans"),
        item("jen-layer", "1 hoodie / sweatshirt"),
        item("jen-underwear", "6 underwear"),
        item("jen-socks", "7 pairs of socks"),
        item("jen-pajamas", "Pajamas"),
        item("jen-swimsuits", "2 swimsuits"),
        item("jen-rain", "Raincoat / light waterproof jacket"),
        item("jen-walk", "Walking / hiking shoes"),
        item("jen-sandals", "Sandals"),
        item("jen-hat", "Hat"),
        item("jen-sunglasses", "Sunglasses"),
        item("jen-phone", "Phone"),
        item("jen-chargers", "Chargers"),
        item("jen-headphones", "Headphones / earbuds"),
        item("jen-book", "Book / entertainment"),
        item("jen-laundry", "Bag for dirty clothes")
      ]
    },
    blake: {
      title: "Blake's Bag",
      icon: "🎒",
      subtitle: "Clothes + personal stuff",
      items: [
        item("blake-shirts", "6 shirts / T-shirts"),
        item("blake-shorts", "2 pairs of shorts"),
        item("blake-pants", "2 pairs of pants"),
        item("blake-layer", "1 hoodie / sweatshirt"),
        item("blake-underwear", "6 underwear"),
        item("blake-socks", "7 pairs of socks"),
        item("blake-pajamas", "Pajamas"),
        item("blake-swimsuit", "Swimsuit"),
        item("blake-rain", "Raincoat / light waterproof jacket"),
        item("blake-walk", "Walking shoes"),
        item("blake-sandals", "Sandals"),
        item("blake-hat", "Hat"),
        item("blake-sunglasses", "Sunglasses"),
        item("blake-phone", "Phone"),
        item("blake-chargers", "Chargers"),
        item("blake-headphones", "Headphones / earbuds"),
        item("blake-book", "Book / entertainment"),
        item("blake-laundry", "Bag for dirty clothes")
      ]
    },
    porter: {
      title: "Porter's Bag",
      icon: "🦧",
      subtitle: "Synced with Porter's app",
      items: [
        item("porter-shirts", "6 T-Shirts (5 days + 1 spare)"),
        item("porter-shorts", "2 Pairs of Shorts"),
        item("porter-pants", "2 Pairs of Pants"),
        item("porter-long-sleeve", "1 Long-Sleeve Shirt"),
        item("porter-hoodie", "1 Hoodie / Sweatshirt"),
        item("porter-underwear", "6 Underwear (5 days + 1 spare)"),
        item("porter-socks", "7 Pairs of Socks (5 days + 2 extra for hiking / wet feet)"),
        item("porter-pajamas", "Pajamas"),
        item("porter-swimsuits", "2 Swimsuits"),
        item("porter-rain", "Raincoat / Light Waterproof Jacket"),
        item("porter-shoes", "Hiking / Walking Shoes"),
        item("porter-sandals", "Sandals"),
        item("porter-hat", "Sun Hat / Baseball Cap"),
        item("porter-sunglasses", "Sunglasses"),
        item("porter-sunscreen", "Sunscreen"),
        item("porter-bug-spray", "Bug Spray"),
        item("porter-daypack", "Small Hiking / Day Backpack"),
        item("porter-water", "Refillable Water Bottle"),
        item("porter-teeth", "Toothbrush / Toothpaste"),
        item("porter-shower", "Deodorant + Shower Stuff"),
        item("porter-pills", "PILLS"),
        item("porter-phone", "Phone"),
        item("porter-chargers", "Chargers"),
        item("porter-headphones", "Headphones / Earbuds"),
        item("porter-stuffed", "Stuffed Animal: 1 Only!"),
        item("porter-book", "Book / Entertainment"),
        item("porter-laundry", "Bag for Dirty Clothes")
      ]
    },
    toiletries: {
      title: "Bathroom + Meds",
      icon: "🪥",
      subtitle: "The things everyone assumes someone else packed",
      items: [
        item("toothbrushes", "Toothbrushes + toothpaste"),
        item("deodorant", "Deodorant"),
        item("shampoo", "Shampoo + conditioner"),
        item("body-wash", "Body wash / soap"),
        item("hairbrush", "Hairbrush / comb"),
        item("sunscreen", "Sunscreen"),
        item("bug-spray", "Bug spray"),
        item("medications", "All medications"),
        item("first-aid", "Small first-aid kit"),
        item("tissues", "Tissues"),
        item("sanitizer", "Hand sanitizer"),
        item("lip-balm", "Lip balm")
      ]
    },
    hiking: {
      title: "Hiking + Outdoors",
      icon: "🥾",
      subtitle: "Trails, weather, and not regretting our footwear",
      items: [
        item("hiking-shoes", "Comfortable hiking / walking shoes"),
        item("hiking-socks", "Extra socks for wet feet"),
        item("daypacks", "Day backpacks"),
        item("water-bottles", "Refillable water bottles"),
        item("hiking-poles", "Hiking poles"),
        item("rain-layers", "Light rain layers"),
        item("hats", "Sun hats / caps"),
        item("hiking-sunscreen", "Sunscreen"),
        item("hiking-bug", "Bug spray"),
        item("trail-snacks", "Trail snacks"),
        item("battery", "Portable battery pack"),
        item("offline-maps", "Download offline maps"),
        item("outdoor-first-aid", "Small first-aid kit")
      ]
    },
    swim: {
      title: "Swim + Beach",
      icon: "🏖️",
      subtitle: "Lake mode",
      items: [
        item("swimsuits", "Swimsuits"),
        item("towels", "Beach / swim towels"),
        item("water-shoes", "Water shoes / sandals"),
        item("swim-sunscreen", "Sunscreen"),
        item("beach-bag", "Beach bag"),
        item("wet-bag", "Wet swimsuit bag"),
        item("goggles", "Goggles"),
        item("beach-water", "Water bottles")
      ]
    },
    food: {
      title: "Snacks + Drinks",
      icon: "🥨",
      subtitle: "Road-trip civilization supplies",
      items: [
        item("water", "Water"),
        item("cold-drinks", "Favorite cold drinks"),
        item("granola", "Granola / protein bars"),
        item("trail-mix", "Trail mix / nuts"),
        item("fruit", "Fruit"),
        item("crackers", "Crackers / pretzels"),
        item("jerky", "Jerky / protein snack"),
        item("sweet", "Something sweet"),
        item("gum", "Gum / mints"),
        item("cooler", "Cooler"),
        item("ice-packs", "Ice packs")
      ]
    },
    entertainment: {
      title: "Games + Entertainment",
      icon: "🎲",
      subtitle: "For hotel / cabin downtime",
      items: [
        item("card-game", "Card game"),
        item("board-game", "One easy travel game"),
        item("books", "Books / manga"),
        item("switch", "Nintendo Switch"),
        item("switch-charger", "Switch charger"),
        item("controllers", "Extra controller(s)"),
        item("headphones", "Headphones / earbuds"),
        item("downloads", "Download shows / games before leaving"),
        item("chargers", "Device chargers")
      ]
    },
    fishing: {
      title: "Fishing?",
      icon: "🎣",
      subtitle: "Optional, but here if we decide yes",
      items: [
        item("rods", "Fishing rods + reels"),
        item("tackle", "Tackle box"),
        item("licenses", "Check fishing license requirements"),
        item("bait", "Bait / lures"),
        item("pliers", "Pliers / line cutter"),
        item("net", "Landing net"),
        item("fishing-hats", "Hats + sunglasses"),
        item("fishing-bug", "Bug spray"),
        item("fishing-sunscreen", "Sunscreen")
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
        item("car-chargers", "Car chargers / cables"),
        item("drive-sunglasses", "Sunglasses"),
        item("napkins", "Napkins / wipes"),
        item("trash-bags", "Small trash bags"),
        item("drive-cooler", "Cooler + ice packs"),
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
        item("last-chargers", "Chargers"),
        item("last-water", "Fill water bottles"),
        item("load-cooler", "Load cooler + cold food"),
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
    version: 1,
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
    ...saved,
    lists: { ...defaults.lists }
  };

  for (const [listId, defaultList] of Object.entries(defaults.lists)) {
    const existing = saved.lists?.[listId];
    if (!existing || !Array.isArray(existing.items)) continue;

    const savedById = new Map(existing.items.filter(Boolean).map((entry) => [entry.id, entry]));
    const knownIds = new Set(defaultList.items.map((entry) => entry.id));
    const items = defaultList.items.map((entry) => {
      const prior = savedById.get(entry.id);
      return prior ? { ...entry, ...prior, text: cleanText(prior.text || entry.text), checked: Boolean(prior.checked) } : entry;
    });

    for (const entry of existing.items) {
      if (!entry?.id || knownIds.has(entry.id) || !cleanText(entry.text)) continue;
      items.push({ id: entry.id, text: cleanText(entry.text), checked: Boolean(entry.checked), custom: true });
    }

    merged.lists[listId] = {
      ...defaultList,
      ...existing,
      title: existing.title || defaultList.title,
      icon: existing.icon || defaultList.icon,
      subtitle: existing.subtitle || defaultList.subtitle,
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
