export function formatPriceBdt(price: number) {
  return `৳${price.toLocaleString("en-BD")}`;
}

export const MAX_CATALOG_IMAGE_BYTES = 2 * 1024 * 1024;

export function isAllowedCatalogImage(mimeType: string, fileName: string) {
  const lower = fileName.toLowerCase();
  return (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp" ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp")
  );
}
