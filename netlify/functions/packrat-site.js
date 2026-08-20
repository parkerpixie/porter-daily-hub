const SOURCE_URL = "https://raw.githubusercontent.com/parkerpixie/PackRat/main/index.html";

export default async () => {
  try {
    const response = await fetch(SOURCE_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`PackRat source returned ${response.status}`);

    const html = await response.text();
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("PackRat page proxy failed", error);
    return new Response(
      "<!doctype html><meta name=viewport content='width=device-width,initial-scale=1'><title>PackRat</title><main style='font-family:system-ui;padding:2rem'><h1>PackRat is temporarily unavailable.</h1><p>The shared checklist data is safe. Refresh in a moment.</p></main>",
      { status: 502, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
};
