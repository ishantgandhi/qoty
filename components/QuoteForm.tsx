type QuoteFormProps = {
  text: string;
  onTextChange: (text: string) => void;
  onFilesChange: (files: File[]) => void;
  onSubmit: () => void;
};

export function QuoteForm({ text, onTextChange, onFilesChange, onSubmit }: QuoteFormProps) {
  return (
    <div>
      <textarea
        className="w-full h-48 p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Paste your hotel quote here..."
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
      />
      <input
        type="file"
        multiple
        accept=".html,.htm,.pdf,.txt"
        onChange={(e) => onFilesChange(Array.from(e.target.files ?? []))}
      />
      <button type="button" onClick={onSubmit}>
        Parse quote
      </button>
    </div>
  );
}
