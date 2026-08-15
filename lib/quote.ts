export type QuoteField = {
  value: number | null;
  basis: string;
  is_estimate: boolean;
};

export type QuoteResult = {
  total_quote: QuoteField;
  guestroom_total: QuoteField;
  meeting_room_total: QuoteField;
  fb_total: QuoteField;
  total_quote_check?: {
    computed_value: number | null;
    matches_extraction: boolean;
  };
  _metadata?: {
    sourceType: string;
    rawText: string;
  };
};

export type QuoteInput = {
  type: string;
  content: string;
  label: string;
};

export const BREAKDOWN_FIELDS = [
  { key: "guestroom_total", label: "Guestroom" },
  { key: "meeting_room_total", label: "Meeting Room" },
  { key: "fb_total", label: "Food and Beverage" },
] as const satisfies { key: keyof QuoteResult; label: string }[];

export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function looksLikeHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

function isPdfFile(file: File): boolean {
  return file.type.startsWith("application/pdf") || file.name.toLowerCase().endsWith(".pdf");
}

function readFileAs(file: File, mode: "text" | "dataUrl"): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(mode === "dataUrl" ? result.split(",")[1] : result); // is of format "data:image/png;base64,..."
    };
    reader.onerror = () => reject(reader.error);
    if (mode === "dataUrl") reader.readAsDataURL(file);
    else reader.readAsText(file);
  });
}

export async function buildQuoteInputs(text: string, files: File[]): Promise<QuoteInput[]> {
  const inputs: QuoteInput[] = [];

  if (text.trim()) {
    inputs.push({
      type: looksLikeHtml(text) ? "html" : "text", 
      content: text,
      label: "Pasted text",
    });
  }

  for (const file of files) {
    const isPdf = isPdfFile(file);
    inputs.push({
      type: isPdf ? "pdf" : "html",
      content: await readFileAs(file, isPdf ? "dataUrl" : "text"),
      label: file.name,
    });
  }

  return inputs;
}
