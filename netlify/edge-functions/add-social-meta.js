const SITE_URL = "https://porterdailyhub.netlify.app/";
const ICON_URL = `${SITE_URL}porter-day-arc-icon.png?v=20260802`;
const DESCRIPTION = "Porter's visual daily hub for schedules, shared skills, preparation checklists, weekly planning, and packing.";

export default async (request, context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) return response;

  let html = await response.text();
  const socialTags = `
  <link rel="icon" type="image/png" sizes="192x192" href="/porter-day-arc-icon.png?v=20260802">
  <link rel="apple-touch-icon" sizes="192x192" href="/porter-day-arc-icon.png?v=20260802">
  <link rel="manifest" href="/site.webmanifest">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Porter's Day Arc">
  <meta property="og:title" content="Porter's Day Arc">
  <meta property="og:description" content="${DESCRIPTION}">
  <meta property="og:url" content="${SITE_URL}">
  <meta property="og:image" content="${ICON_URL}">
  <meta property="og:image:secure_url" content="${ICON_URL}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="192">
  <meta property="og:image:height" content="192">
  <meta property="og:image:alt" content="An orangutan reaching through a leafy jungle, the app icon for Porter's Day Arc.">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Porter's Day Arc">
  <meta name="twitter:description" content="${DESCRIPTION}">
  <meta name="twitter:image" content="${ICON_URL}">
  <meta name="twitter:image:alt" content="An orangutan reaching through a leafy jungle, the app icon for Porter's Day Arc.">
`;

  if (!html.includes('property="og:title"')) {
    html = html.replace("</head>", `${socialTags}</head>`);
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};
