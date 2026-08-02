import iconPart1 from "../functions/porter-icon-part-1.js";
import iconPart2 from "../functions/porter-icon-part-2.js";
import iconPart3 from "../functions/porter-icon-part-3.js";

const SITE_URL = "https://porterdailyhub.netlify.app/";
const ICON_URL = `${SITE_URL}porter-day-arc-icon.png?v=20260802`;
const INLINE_ICON_URL = `data:image/png;base64,${iconPart1}${iconPart2}${iconPart3}`;
const DESCRIPTION = "Porter's visual daily hub for schedules, shared skills, preparation checklists, weekly planning, and packing.";

const MASCOT_MARKUP = `
      <div class="hero-mascot-card">
        <img
          src="${INLINE_ICON_URL}"
          alt="Porter's orangutan mascot reaching through a leafy jungle"
          width="192"
          height="192"
        >
      </div>`;

const MASCOT_STYLES = `
  <style data-porter-mascot-styles>
    .hero-mascot-card {
      position: relative;
      width: 190px;
      aspect-ratio: 1;
      overflow: hidden;
      transform: rotate(3deg);
      border: var(--line);
      border-radius: 28%;
      background: #5f8f27;
      box-shadow: var(--shadow);
    }

    .hero-mascot-card img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @media (max-width: 900px) {
      .hero-mascot-card {
        width: 144px;
        margin: 12px auto 0;
      }
    }

    @media (max-width: 650px) {
      .hero-mascot-card {
        width: 118px;
        margin-top: 8px;
        border-width: 3px;
        box-shadow: 4px 4px 0 var(--ink);
      }
    }

    @media print {
      .hero-mascot-card {
        display: none !important;
      }
    }
  </style>
`;

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

  if (!html.includes("data-porter-mascot-styles")) {
    html = html.replace("</head>", `${MASCOT_STYLES}</head>`);
  }

  html = html.replace(
    /\s*<div class="speech-bubble" aria-hidden="true">[\s\S]*?<\/div>/,
    `\n${MASCOT_MARKUP}`
  );

  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};
