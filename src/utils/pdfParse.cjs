// src/utils/pdfParse.cjs
const { PDFParse } = require('pdf-parse'); // ← named import for v2+

async function parsePdf(buffer) {
  try {
    const parser = new PDFParse({ data: buffer }); // or just buffer if it accepts it
    const result = await parser.getText();         // new method
    return { text: result.text };                  // match old shape
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

module.exports = parsePdf;