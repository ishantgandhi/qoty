export const MODEL_OPTIONS = [
    {
      key: "gpt-5.4-mini",
      label: "GPT-5.4 Mini",
      inputPrice: 0.75,
      outputPrice: 4.5,
    },
    {
      key: "gemini-3.7-flash",
      label: "Gemini 3.7 Flash",
      inputPrice: 0.75,
      outputPrice: 3.75,
    },
    {
      key: "claude-sonnet",
      label: "Claude Sonnet 5",
      inputPrice: 2,
      outputPrice: 10,
    },
  ] as const;
  
  export function getCheapestModel() {
    return MODEL_OPTIONS.reduce((cheapest, m) =>
      m.inputPrice < cheapest.inputPrice ? m : cheapest
    );
  }
  
  export function getMostExpensiveModel() {
    return MODEL_OPTIONS.reduce((priciest, m) =>
      m.inputPrice > priciest.inputPrice ? m : priciest
    );
  }