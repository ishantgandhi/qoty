import * as cheerio from "cheerio";
import { PDFParse } from 'pdf-parse';


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
      const joinedText = cellTexts.filter(Boolean).join(" | ");
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
    // step 1: call pdfParse(input) — input must be a Buffer, not a string
    // step 2: await the result — it's a Promise
    // step 3: the result object has a `.text` property — that's your extracted text
    // step 4: trim it and return it
  }
}

