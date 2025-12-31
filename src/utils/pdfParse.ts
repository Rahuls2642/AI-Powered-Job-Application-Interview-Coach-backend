import { PDFParse } from 'pdf-parse';

export default async function parsePdf(buffer:Buffer){
  try {
    const parser = new PDFParse({ data: buffer }); 
    const result = await parser.getText();         
    return { text: result.text };                  
  } catch (error: any) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}


