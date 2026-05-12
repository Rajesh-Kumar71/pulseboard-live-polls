import crypto from "crypto";

export function createSlug(title) {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  const randomPart = crypto.randomBytes(4).toString("hex");

  return `${cleanTitle || "poll"}-${randomPart}`;
}