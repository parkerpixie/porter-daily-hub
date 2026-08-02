const SITE_URL = "https://porterdailyhub.netlify.app/";
const ICON_URL = "https://raw.githubusercontent.com/parkerpixie/porter-daily-hub/main/netlify/functions/porter-orangutan-mascot.png";
const DESCRIPTION = "Porter's visual daily hub for schedules, shared skills, preparation checklists, weekly planning, and packing.";

const MASCOT_MARKUP = `
      <div class="hero-mascot-card">
        <img
          src="${ICON_URL}"
          alt="Porter's orangutan mascot reaching through a leafy jungle"
          width="280"
          height="280"
        >
      </div>`;

const MASCOT_STYLES = `
  <style data-porter-mascot-styles>
    .hero-mascot-card {
      position: relative;
      width: 280px;
      aspect-ratio: 1;
      overflow: hidden;
      transform: rotate(2deg);
      border: 0;
      border-radius: 24%;
      background: transparent;
      box-shadow: 0 12px 28px rgba(24, 21, 29, 0.18);
    }

    .hero-mascot-card img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 24%;
    }

    @media (max-width: 900px) {
      .hero-mascot-card {
        width: 210px;
        margin: 12px auto 0;
      }
    }

    @media (max-width: 650px) {
      .hero-mascot-card {
        width: 160px;
        margin-top: 8px;
        box-shadow: 0 8px 18px rgba(24, 21, 29, 0.14);
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
  <link rel="icon" type="image/png" sizes="1024x1024" href="${ICON_URL}">
  <link rel="apple-touch-icon" sizes="1024x1024" href="${ICON_URL}">
  <link rel="manifest" href="/site.webmanifest">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Porter's Day Arc">
  <meta property="og:title" content="Porter's Day Arc">
  <meta property="og:description" content="${DESCRIPTION}">
  <meta property="og:url" content="${SITE_URL}">
  <meta property="og:image" content="${ICON_URL}">
  <meta property="og:image:secure_url" content="${ICON_URL}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1024">
  <meta property="og:image:height" content="1024">
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
