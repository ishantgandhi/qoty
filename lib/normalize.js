import * as cheerio from "cheerio";
import { getPath } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

PDFParse.setWorker(getPath()); // set the worker for the PDFParse library 

export async function normalizeToText(input, type) { //input is the input string, type is the type of the input (text, html, pdf)
  if (type === "text") { //if the input is text, we need to trim it
    return input.trim();
  }

  if (type === "html") { //if the input is html, we need to normalize it
    const $ = cheerio.load(input);
    const lines = [];
    $("tr").each((index, element) => {
      const $row = $(element);
      if ($row.find("table").length > 0) return; // Skip row if it contains a table within it
      const cellTexts = $row
        .children("td, th")
        .map((i, cell) => $(cell).text().trim())
        .get();
      const joinedText = cellTexts.filter(Boolean).join(" | "); // join in the format of " Label | Value"
      if (joinedText.length > 0) {
        lines.push(joinedText);
      }
    });
    if (lines.length === 0) {
      return $("body").text().trim();
    }
    return lines.join("\n");
  }

  if (type === "pdf") {
    const parser = new PDFParse({ data: input });
    const result = await parser.getText();
    await parser.destroy(); 
    return result.text.trim(); 
  }
}

export async function normalizeMultipleInputs(inputs) { // inputs is an array like: [{ input: htmlString, type: 'html', label: 'Pasted email' }, { input: pdfBuffer, type: 'pdf', label: 'proposal.pdf' }]
    const chunks = [];
    for (const input of inputs) {
      const normalized = await normalizeToText(input.input, input.type);
      chunks.push(`--- Source: ${input.label} ---\n${normalized}`);
    }
    return chunks.join("\n\n");
}