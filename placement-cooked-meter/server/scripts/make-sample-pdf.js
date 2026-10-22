// Generates samples/weak.pdf and samples/strong.pdf from the .txt fixtures (dev-only, uses pdfkit).
import { readFileSync, createWriteStream } from "node:fs";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const dir = fileURLToPath(new URL("../samples/", import.meta.url));
for (const name of ["weak", "strong"]) {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(createWriteStream(`${dir}${name}.pdf`));
  doc.fontSize(11).text(readFileSync(`${dir}${name}.txt`, "utf8"));
  doc.end();
  console.log(`wrote samples/${name}.pdf`);
}
