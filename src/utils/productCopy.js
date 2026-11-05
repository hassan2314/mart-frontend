const LOREM = /lorem\s+ipsum/i;

/**
 * Store-ready blurbs for catalog items whose API text is still placeholder copy.
 * Keyed by the live product name. Other descriptions are shown as returned.
 */
const CURATED_BY_NAME = {
  bakistry:
    "Flaky, golden pastry rounds from the M&M's mart bakery case. The layers bake up crisp at the edge and tender in the middle — warm them and serve with a dip for tea time or a shared platter.",
  deline:
    "Deline chicken seekh kebabs are seasoned, hand-shaped rolls with a juicy center. Sear, grill, or bake them, then slice into wraps, rice plates, or a simple weeknight dinner.",
};

function genericCopy(name) {
  const label = name?.trim() || "This item";
  return `${label} is part of the M&M's mart counter — ready to cook, share, and serve.`;
}

/** Drop drafting notes ("Here's a description…") so real sentences can show. */
function stripDraftNotes(text) {
  let cleaned = text.replace(/\r/g, "");
  cleaned = cleaned.replace(
    /^here(?:['’]s| is)\s+a\b[\s\S]*?(?:\n\s*---+\s*\n|\n\s*\n)\s*/i,
    ""
  );
  cleaned = cleaned.replace(/\*\*/g, "");
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}

export function polishProductDescription(name, description = "") {
  const raw = String(description ?? "").replace(/\r/g, "").trim();
  const key = String(name ?? "").trim().toLowerCase();

  if (LOREM.test(raw)) {
    return CURATED_BY_NAME[key] || genericCopy(name);
  }

  if (!raw) return "";

  const cleaned = stripDraftNotes(raw);
  if (cleaned && !LOREM.test(cleaned)) return cleaned;
  return CURATED_BY_NAME[key] || genericCopy(name);
}

export function withPolishedCopy(product) {
  if (!product || typeof product !== "object") return product;
  return {
    ...product,
    description: polishProductDescription(product.name, product.description),
  };
}

export function withPolishedCatalog(products) {
  if (!Array.isArray(products)) return [];
  return products.map(withPolishedCopy);
}
