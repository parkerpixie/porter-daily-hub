import iconPart1 from "./porter-icon-part-1.js";
import iconPart2 from "./porter-icon-part-2.js";
import iconPart3 from "./porter-icon-part-3.js";

const ICON = `${iconPart1}${iconPart2}${iconPart3}`;

export const handler = async () => ({
  statusCode: 200,
  headers: {
    "Content-Type": "image/png",
    "Content-Disposition": "inline; filename=porter-day-arc-icon.png",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Access-Control-Allow-Origin": "*"
  },
  isBase64Encoded: true,
  body: ICON
});
