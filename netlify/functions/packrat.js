import { getStore } from "@netlify/blobs";

const STORE_NAME = "packrat-shared";
const STATE_KEY = "traverse-city-2026";
const TRIP_LABEL = "Traverse City • Aug 23–27";
const VALID_STATUSES = new Set(["not_packed", "staged", "packed"]);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8"
};

const item = (id, text, options = {}) => ({ id, text, status: "not_packed", checked: false, ...options });

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
      title: "Parker's Bag", shortTitle: "Parker", section: "people", kind: "packing", subtitle: "Clothes + personal bathroom / meds",
      items: [
        item("jen-tops", "6 tops / T-shirts"), item("jen-shorts", "2 pairs of shorts"), item("jen-pants", "2 pairs of pants / jeans"), item("jen-layer", "1 hoodie / sweatshirt"), item("jen-underwear", "6 underwear"), item("jen-socks", "5 pairs of socks"), item("jen-extra-socks", "2 extra pairs of socks for hiking / wet feet"), item("jen-pajamas", "Pajamas"), item("jen-swimsuits", "2 swimsuits → PUT IN SWIM BAG"), item("jen-rain", "Raincoat / light waterproof jacket → GIANT TOTE"), item("jen-walk", "Comfortable hiking shoes → GIANT TOTE"), item("jen-sandals", "Sandals"), item("jen-water-shoes", "Water shoes → PUT IN SWIM BAG"), item("jen-hat", "Sun hat / cap → PUT IN BEACH BAG"), item("jen-sunglasses", "Sunglasses"), item("jen-water-bottle", "Refillable water bottle → GIANT TOTE"), ...personalBathroom("jen"), item("jen-laundry", "Bag for dirty clothes")
      ]
    },
    blake: {
      title: "Blake's Bag", shortTitle: "Blake", section: "people", kind: "packing", subtitle: "Clothes + personal bathroom / meds",
      items: [
        item("blake-shirts", "6 shirts / T-shirts"), item("blake-shorts", "2 pairs of shorts"), item("blake-pants", "2 pairs of pants"), item("blake-layer", "1 hoodie / sweatshirt"), item("blake-underwear", "6 underwear"), item("blake-socks", "5 pairs of socks"), item("blake-extra-socks", "2 extra pairs of socks for hiking / wet feet"), item("blake-pajamas", "Pajamas"), item("blake-swimsuit", "Swimsuit → PUT IN SWIM BAG"), item("blake-rain", "Raincoat / light waterproof jacket → GIANT TOTE"), item("blake-walk", "Comfortable hiking shoes → GIANT TOTE"), item("blake-sandals", "Sandals"), item("blake-water-shoes", "Water shoes → PUT IN SWIM BAG"), item("blake-hat", "Sun hat / cap → PUT IN BEACH BAG"), item("blake-sunglasses", "Sunglasses"), item("blake-water-bottle", "Refillable water bottle → GIANT TOTE"), ...personalBathroom("blake"), item("blake-laundry", "Bag for dirty clothes")
      ]
    },
    porter: {
      title: "Porter's Bag", shortTitle: "Porter", section: "people", kind: "packing", subtitle: "Synced with Porter's Traverse City checklist",
      items: [
        item("porter-shirts", "6 T-Shirts (5 days + 1 spare)"), item("porter-shorts", "2 Pairs of Shorts"), item("porter-pants", "2 Pairs of Pants"), item("porter-long-sleeve", "1 Long-Sleeve Shirt"), item("porter-hoodie", "1 Hoodie / Sweatshirt"), item("porter-underwear", "6 Underwear (5 days + 1 spare)"), item("porter-socks", "5 Pairs of Socks"), item("porter-extra-socks", "2 Extra Pairs of Socks for Hiking / Wet Feet"), item("porter-pajamas", "Pajamas"), item("porter-swimsuits", "2 Swimsuits → PUT IN SWIM BAG"), item("porter-rain", "Raincoat / Light Waterproof Jacket → GIANT TOTE"), item("porter-shoes", "Comfortable Hiking Shoes → GIANT TOTE"), item("porter-sandals", "Sandals"), item("porter-water-shoes", "Water Shoes → PUT IN SWIM BAG"), item("porter-hat", "Sun Hat / Cap → PUT IN BEACH BAG"), item("porter-sunglasses", "Sunglasses"), item("porter-water", "Refillable Water Bottle → GIANT TOTE"), item("porter-teeth", "Toothbrush + Toothpaste"), item("porter-deodorant", "Deodorant"), item("porter-shampoo", "Shampoo + Conditioner"), item("porter-body-wash", "Body Wash / Soap"), item("porter-hairbrush", "Hairbrush / Comb"), item("porter-medications", "PILLS / Medications"), item("porter-stuffed", "Stuffed Animal: 1 Only!"), item("porter-laundry", "Bag for Dirty Clothes")
      ]
    },
    jenCar: { title: "Parker's Car Bag", shortTitle: "Parker Car Bag", section: "loadout", kind: "packing", subtitle: "Keep within reach during the drive", items: carBag("jen") },
    blakeCar: { title: "Blake's Car Bag", shortTitle: "Blake Car Bag", section: "loadout", kind: "packing", subtitle: "Keep within reach during the drive", items: carBag("blake") },
    porterCar: { title: "Porter's Car Bag", shortTitle: "Porter Car Bag", section: "loadout", kind: "packing", subtitle: "Books, gaming + chargers for the drive", items: carBag("porter") },
    truckBags: {
      title: "Bags to Add to the Truck", shortTitle: "Bags to Truck", section: "loadout", kind: "packing", subtitle: "Final loadout before departure",
      items: [
        item("truck-parker-luggage", "Parker Luggage"),
        item("truck-blake-luggage", "Blake Luggage"),
        item("truck-porter-luggage", "Porter Luggage"),
        item("truck-parker-car-tote", "Parker Car Tote"),
        item("truck-parker-laptop-tote", "Parker Laptop Tote"),
        item("truck-car-food-bag", "Car Food Bag"),
        item("truck-porter-backpack", "Porter backpack"),
        item("truck-blake-duffel", "Blake Duffel"),
        item("truck-giant-le-tote-food", "Giant LE Tote with house food"),
        item("truck-large-le-tote-games", "Large LE Tote with games and House things"),
        item("truck-white-lug-beverages", "Beverages in the White Lug"),
        item("truck-hiking-poles", "Hiking Poles"),
        item("truck-hiking-backpack", "Hiking backpack"),
        item("truck-beach-bag", "Beach Bag"),
        item("truck-tomatoes", "Tomatoes"),
        item("truck-dogs-harness", "Dogs and Harness")
      ]
    },
    hiking: {
      title: "Hiking + Outdoors", shortTitle: "Hiking", section: "shared", kind: "packing", subtitle: "Shared check that outdoor gear reached the right bag",
      items: [item("hiking-shoes", "Comfortable hiking shoes — Parker + Blake + Porter → GIANT TOTE"), item("hiking-socks", "Extra hiking socks — Parker + Blake + Porter → PERSONAL BAGS"), item("daypacks", "Day backpack"), item("water-bottles", "Refillable water bottles — Parker + Blake + Porter → GIANT TOTE"), item("hiking-poles", "Hiking poles"), item("rain-layers", "Raincoats — Parker + Blake + Porter → GIANT TOTE"), item("hats", "Sun hats / caps — Parker + Blake + Porter → BEACH BAG"), item("hiking-bug", "Bug spray"), item("trail-snacks", "Trail snacks"), item("offline-maps", "Download offline maps"), item("outdoor-first-aid", "Small first-aid kit")]
    },
    swim: {
      title: "Swim + Beach", shortTitle: "Swim + Beach", section: "shared", kind: "packing", subtitle: "Swim Bag + Beach Bag",
      items: [item("swimsuits", "Swimsuits — Parker + Blake + Porter → SWIM BAG"), item("towels", "3 Beach Towels"), item("water-shoes", "Water shoes — Parker + Blake + Porter → SWIM BAG"), item("beach-hats", "Sun hats / caps — Parker + Blake + Porter → BEACH BAG"), item("swim-sunscreen", "Sunscreen → BEACH BAG"), item("beach-bag", "Beach Bag"), item("wet-bag", "Wet swimsuit bag")]
    },
    entertainment: { title: "Games + Entertainment", shortTitle: "Games", section: "shared", kind: "packing", subtitle: "Actual games to play with family", items: [item("cards", "Playing Cards"), item("escape-room", "Escape-Room Game(s)")] },
    car: {
      title: "Car + Drive", shortTitle: "Car + Drive", section: "loadout", kind: "packing", subtitle: "Madison → Traverse City",
      items: [item("wallets", "Wallets / IDs"), item("reservation", "Hotel / lodging info saved"), item("phone-mount", "Phone mount"), item("drive-sunglasses", "Sunglasses"), item("napkins", "Napkins / wipes"), item("trash-bags", "Small trash bags"), item("roadside", "Roadside emergency kit"), item("gas", "Fill gas tank")]
    },
    food: { title: "Grocery List / Food to Pack", shortTitle: "Food to Pack", section: "supplies", kind: "packing", subtitle: "Buy it, then make sure it leaves with us", items: [item("trail-mix", "Trail Mix"), item("na-beer", "NA Beer"), item("thc-stuff", "THC Stuff"), item("jerky", "Jerky"), item("chocolate", "Chocolate")] },
    house: { title: "Stuff for the House", shortTitle: "House Stuff", section: "supplies", kind: "packing", subtitle: "Rental-house odds and ends", items: [item("kleenex", "Kleenex")] },
    store: { title: "Things to Get at the Store", shortTitle: "Store Run", section: "supplies", kind: "packing", subtitle: "Trip supplies we still need to buy", items: [item("store-bug-spray", "Bug Spray"), item("store-trail-snacks", "Trail Snacks")] },
    friday: {
      title: "Friday Evening Prep", shortTitle: "Friday Night", section: "departure", kind: "task", subtitle: "Quick decisions + setup • Friday, Aug 21",
      items: [item("fri-laundry", "Laundry"), item("fri-snacks", "Plan road + house snacks"), item("fri-games", "Choose games to bring"), item("fri-weather", "Check Traverse City weather")]
    },
    saturday: {
      title: "Saturday Before We Leave", shortTitle: "Saturday Prep", section: "departure", kind: "task", subtitle: "House + car reset • Saturday, Aug 22",
      items: [item("sat-mow", "Mow the Lawn", { assignee: "Porter" }), item("sat-weed", "Weed", { assignee: "Blake + Parker" }), item("sat-dog-poop", "Dog Poop", { assignee: "Porter" }), item("sat-guinea", "Guinea Pig Cleaning", { assignee: "Porter" }), item("sat-fridge", "Fridge", { assignee: "Parker" }), item("sat-car-wash", "Car Wash", { assignee: "Blake" }), item("sat-tire-pressure", "Tire Pressure", { assignee: "Blake" }), item("sat-trim-branch", "Trim Branch", { assignee: "Blake" }), item("sat-toilets", "Clean Toilets", { assignee: "Blake" }), item("sat-organize-packing", "Organize all Packing", { assignee: "Parker" }), item("sat-water-flowers", "Water Flowers", { assignee: "Parker" })]
    },
    lastMinute: {
      title: "Sunday Door Check", shortTitle: "Door Check", section: "departure", kind: "task", subtitle: "Do this before the car actually leaves",
      items: [item("phones", "Phones"), item("last-wallets", "Wallets / IDs"), item("last-meds", "Medications"), item("last-water", "Fill water bottles"), item("fridge", "Check fridge for trip food"), item("trash", "Take out trash"), item("doors", "Lock doors / windows"), item("thermostat", "Set thermostat"), item("final-bathroom", "Everyone use the bathroom before departure")]
    }
  };
}

function normalizeStatus(entry = {}) {
  if (VALID_STATUSES.has(entry.status)) return entry.status;
  return entry.checked ? "packed" : "not_packed";
}

function cleanText(value) {
  return String(value || "").trim().slice(0, 120);
}

function normalizeItem(entry, fallback = {}) {
  const status = normalizeStatus(entry);
  return { ...fallback, ...entry, text: cleanText(entry.text || fallback.text), status, checked: status === "packed" };
}

function defaultState() {
  return { version: 5, trip: TRIP_LABEL, updatedAt: new Date().toISOString(), archived: [], lists: defaultLists() };
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: CORS_HEADERS });
}

function uid() {
  return globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeArchive(savedArchive) {
  if (!Array.isArray(savedArchive)) return [];
  return savedArchive.filter((entry) => entry && entry.item?.id && entry.listId).map((entry) => ({ ...entry, item: normalizeItem(entry.item), archivedAt: entry.archivedAt || new Date().toISOString() }));
}

function mergeDefaults(saved) {
  const defaults = defaultState();
  if (!saved || typeof saved !== "object") return defaults;

  const archived = normalizeArchive(saved.archived);
  const archivedIds = new Set(archived.map((entry) => `${entry.listId}:${entry.item.id}`));
  const merged = { ...defaults, updatedAt: saved.updatedAt || defaults.updatedAt, archived, lists: { ...defaults.lists } };

  for (const [listId, defaultList] of Object.entries(defaults.lists)) {
    const existing = saved.lists?.[listId];
    const existingItems = Array.isArray(existing?.items) ? existing.items : [];
    const savedById = new Map(existingItems.filter(Boolean).map((entry) => [entry.id, entry]));
    const knownIds = new Set(defaultList.items.map((entry) => entry.id));
    const items = defaultList.items.filter((entry) => !archivedIds.has(`${listId}:${entry.id}`)).map((entry) => {
      const prior = savedById.get(entry.id);
      return prior ? normalizeItem(prior, entry) : entry;
    });
    for (const entry of existingItems) {
      if (!entry?.custom || !entry.id || knownIds.has(entry.id) || !cleanText(entry.text)) continue;
      if (archivedIds.has(`${listId}:${entry.id}`)) continue;
      items.push(normalizeItem(entry, { custom: true }));
    }
    merged.lists[listId] = { ...defaultList, items };
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
  state.version = 5;
  state.trip = TRIP_LABEL;
  state.updatedAt = new Date().toISOString();
  await store.setJSON(STATE_KEY, state);
  return state;
}

function getList(state, listId) {
  if (!listId || !state.lists?.[listId]) return null;
  return state.lists[listId];
}

function archiveItem(state, listId, itemId) {
  const list = getList(state, listId);
  if (!list) return false;
  const index = list.items.findIndex((entry) => entry.id === itemId);
  if (index < 0) return false;
  const [removed] = list.items.splice(index, 1);
  state.archived = Array.isArray(state.archived) ? state.archived : [];
  state.archived = state.archived.filter((entry) => !(entry.listId === listId && entry.item?.id === itemId));
  state.archived.unshift({ id: uid(), listId, listTitle: list.title, item: removed, archivedAt: new Date().toISOString() });
  return true;
}

function restoreArchived(state, archiveId) {
  const index = state.archived?.findIndex((entry) => entry.id === archiveId) ?? -1;
  if (index < 0) return false;
  const [entry] = state.archived.splice(index, 1);
  const list = getList(state, entry.listId);
  if (!list) return false;
  if (!list.items.some((itemEntry) => itemEntry.id === entry.item.id)) list.items.push(normalizeItem(entry.item));
  return true;
}

export default async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  try {
    if (request.method === "GET") return json(await readState(store));
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const body = await request.json().catch(() => ({}));
    const action = body.action;
    const state = await readState(store);

    if (action === "status") {
      const list = getList(state, body.listId);
      const target = list?.items.find((entry) => entry.id === body.itemId);
      if (!list || !target) return json({ error: "List item not found" }, 404);
      const status = VALID_STATUSES.has(body.status) ? body.status : "not_packed";
      target.status = status;
      target.checked = status === "packed";
    } else if (action === "edit") {
      const list = getList(state, body.listId);
      const target = list?.items.find((entry) => entry.id === body.itemId);
      const text = cleanText(body.text);
      if (!list || !target) return json({ error: "List item not found" }, 404);
      if (!text) return json({ error: "Item text is required" }, 400);
      target.text = text;
    } else if (action === "toggle") {
      const list = getList(state, body.listId);
      const target = list?.items.find((entry) => entry.id === body.itemId);
      if (!list || !target) return json({ error: "List item not found" }, 404);
      target.status = Boolean(body.checked) ? "packed" : "not_packed";
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
          if (entry.checked) { known.status = "packed"; known.checked = true; }
          continue;
        }
        if (!entry?.custom) continue;
        const normalized = text.toLowerCase();
        if (existingText.has(normalized)) continue;
        list.items.push({ id: entry.id || uid(), text, status: entry.checked ? "packed" : "not_packed", checked: Boolean(entry.checked), custom: true });
        existingText.add(normalized);
      }
    } else if (action === "add") {
      const list = getList(state, body.listId);
      const text = cleanText(body.text);
      if (!list) return json({ error: "List not found" }, 404);
      if (!text) return json({ error: "Item text is required" }, 400);
      list.items.push({ id: uid(), text, status: "not_packed", checked: false, custom: true, ...(cleanText(body.assignee) ? { assignee: cleanText(body.assignee) } : {}) });
    } else if (action === "delete" || action === "archive") {
      if (!archiveItem(state, body.listId, body.itemId)) return json({ error: "List item not found" }, 404);
    } else if (action === "restore") {
      if (!restoreArchived(state, body.archiveId)) return json({ error: "Archived item not found" }, 404);
    } else if (action === "resetList") {
      const defaults = defaultLists();
      if (!defaults[body.listId]) return json({ error: "List not found" }, 404);
      state.lists[body.listId] = defaults[body.listId];
      state.archived = (state.archived || []).filter((entry) => entry.listId !== body.listId);
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