import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/**
 * Creates a valid multi-page PDF brochure using pdf-lib
 */
export async function createHyundaiSamplePdf(outputPath, title, vehicleModel, contentPages) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let i = 0; i < contentPages.length; i++) {
    const page = pdfDoc.addPage([595, 842]); // A4 dimensions
    const { width, height } = page.getSize();

    // Blue header bar
    page.drawRectangle({
      x: 0,
      y: height - 60,
      width: width,
      height: 60,
      color: rgb(0, 0.17, 0.42) // Hyundai Navy
    });

    // Title
    page.drawText(title, {
      x: 40,
      y: height - 40,
      size: 16,
      font: fontBold,
      color: rgb(1, 1, 1)
    });

    // Subtitle
    page.drawText(`Official Hyundai Brochure - ${vehicleModel} (Page ${i + 1})`, {
      x: 40,
      y: height - 90,
      size: 11,
      font: fontBold,
      color: rgb(0, 0.45, 0.81) // Hyundai Blue
    });

    // Body Text Lines
    const lines = contentPages[i].split('\n');
    let currentY = height - 120;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        currentY -= 14;
        continue;
      }

      const isHeading = line.toUpperCase() === line && line.length < 50;
      page.drawText(line, {
        x: 40,
        y: currentY,
        size: isHeading ? 10.5 : 9.5,
        font: isHeading ? fontBold : fontRegular,
        color: isHeading ? rgb(0, 0.17, 0.42) : rgb(0.2, 0.2, 0.2)
      });
      currentY -= 18;
      if (currentY < 60) break;
    }

    // Footer
    page.drawText(`Hyundai Motor India Limited - Official Specification Guide`, {
      x: 40,
      y: 30,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    });

    page.drawText(`Page ${i + 1} of ${contentPages.length}`, {
      x: width - 90,
      y: 30,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5)
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, Buffer.from(pdfBytes));
  return outputPath;
}
