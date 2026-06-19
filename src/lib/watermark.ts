import { MaterialFileType } from "@/generated/prisma/client";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import sharp from "sharp";

function escapeXml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function watermarkPdf(
  pdfBytes: Buffer,
  watermarkText: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();

    for (let y = 40; y < height; y += 110) {
      for (let x = -40; x < width; x += 220) {
        page.drawText(watermarkText, {
          x,
          y,
          size: 11,
          font,
          color: rgb(0.55, 0.55, 0.55),
          opacity: 0.28,
          rotate: degrees(-28),
        });
      }
    }
  }

  return pdfDoc.save();
}

export async function watermarkImage(
  imageBytes: Buffer,
  watermarkText: string
): Promise<Buffer> {
  const image = sharp(imageBytes);
  const metadata = await image.metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 600;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wm" width="300" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
          <text x="10" y="80" font-size="18" font-family="Arial, sans-serif" fill="rgba(80,80,80,0.32)">
            ${escapeXml(watermarkText)}
          </text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)" />
    </svg>
  `;

  return image
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toBuffer();
}

export async function watermarkMaterialFile(
  fileType: MaterialFileType,
  fileBytes: Buffer,
  watermarkText: string
): Promise<Uint8Array | Buffer> {
  if (fileType === MaterialFileType.PDF) {
    return watermarkPdf(fileBytes, watermarkText);
  }
  return watermarkImage(fileBytes, watermarkText);
}

export function watermarkedFileName(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) return `${fileName}-watermarked`;
  return `${fileName.slice(0, dot)}-watermarked${fileName.slice(dot)}`;
}
