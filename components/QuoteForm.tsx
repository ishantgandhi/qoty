'use client';

import { useRef, useState } from 'react';

type QuoteFormProps = {
  text: string;
  files: File[];
  loading: boolean;
  onTextChange: (text: string) => void;
  onFilesChange: (files: File[]) => void;
  onSubmit: () => void;
  onClear: () => void;
};

export function QuoteForm({
  text,
  files,
  loading,
  onTextChange,
  onFilesChange,
  onSubmit,
  onClear,
}: QuoteFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function addFiles(list: FileList | File[]) {
    onFilesChange([...files, ...Array.from(list)]);
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="font-semibold" htmlFor="quote-text">
          Enter Either Text or Upload Files
        </label>
        <button
          type="button"
          aria-label="Upload files"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-400 text-black hover:bg-amber-500"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".html,.htm,.pdf,.txt"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files ?? []);
            e.target.value = '';
          }}
        />
      </div>

      <div
        className={`rounded-xl border ${isDragging ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
          }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <textarea
          id="quote-text"
          className="h-48 w-full resize-none rounded-xl bg-transparent p-4 placeholder:text-gray-400 focus:outline-none"
          placeholder="Enter text, upload files or do both :)"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <span
              key={`${file.name}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-1 text-sm"
            >
              {file.name}
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                className="text-gray-600 hover:text-black"
                onClick={() => removeFile(index)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 rounded-xl bg-amber-400 py-3 font-semibold text-black hover:bg-amber-500 disabled:opacity-60"
        >
          {loading ? 'Running Qoty…' : 'Run Qoty'}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
