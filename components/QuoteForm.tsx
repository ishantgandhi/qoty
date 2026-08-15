'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { MODEL_OPTIONS, getCheapestModel, getMostExpensiveModel } from '@/lib/models';

type QuoteFormProps = {
  text: string;
  files: File[];
  loading: boolean;
  selectedModel: string;
  onTextChange: (text: string) => void;
  onFilesChange: (files: File[]) => void;
  onSubmit: () => void;
  onClear: () => void;
  onModelChange: (model: string) => void;
};

const cheapest = getCheapestModel();
const priciest = getMostExpensiveModel();

export function QuoteForm({
  text,
  files,
  loading,
  selectedModel,
  onTextChange,
  onFilesChange,
  onModelChange,
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
        <label className="type-label" htmlFor="quote-text">
          Add Quote
        </label>
        <motion.button
          type="button"
          aria-label="Upload files"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-400 text-black"
          whileHover={{ scale: 1.08, backgroundColor: '#f59e0b' }}
          whileTap={{ scale: 0.92 }}
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
        </motion.button>
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

      <motion.div
        className="rounded-xl border"
        animate={{
          scale: isDragging ? 1.01 : 1,
          borderColor: isDragging ? '#fbbf24' : '#d1d5db',
          backgroundColor: isDragging ? '#fffbeb' : 'rgba(255,255,255,0)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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
          className="type-body h-48 w-full resize-none rounded-xl bg-transparent p-4 placeholder:text-gray-400 focus:outline-none"
          placeholder="Enter text, upload files or do both :)"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />
      </motion.div>

      <motion.div layout className="mt-3 flex flex-wrap gap-2 empty:mt-0 empty:hidden">
        <AnimatePresence initial={false}>
          {files.map((file, index) => (
            <motion.span
              key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className="type-meta inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2.5 py-1"
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
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="mt-6 flex gap-3">
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="type-button flex-1 rounded-xl bg-amber-400 py-3 text-black disabled:opacity-60"
          whileHover={loading ? undefined : { scale: 1.015, backgroundColor: '#f59e0b' }}
          whileTap={loading ? undefined : { scale: 0.985 }}
          animate={loading ? { opacity: [1, 0.7, 1] } : { opacity: 1 }}
          transition={loading ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring', stiffness: 400, damping: 25 }}
        >
          {loading ? 'Running Qoty…' : 'Run Qoty'}
        </motion.button>

        <div className="relative">
          <motion.select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="type-button appearance-none rounded-xl border border-gray-300 py-3 pl-5 pr-10 text-gray-700 disabled:opacity-60"
          >
            {MODEL_OPTIONS.map((model) => (
              <option key={model.key} value={model.key}>
                {model.label}
                {model.key === cheapest.key ? ' (Cheapest)' : ''}
                {model.key === priciest.key ? ' (Most expensive)' : ''}
              </option>
            ))}
          </motion.select>
          <svg
            className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
            width="14"
            height="14"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <motion.button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="type-button rounded-xl border border-gray-300 px-5 py-3 text-gray-700 disabled:opacity-60"
          whileHover={loading ? undefined : { scale: 1.02, backgroundColor: '#f9fafb' }}
          whileTap={loading ? undefined : { scale: 0.97 }}
        >
          Clear
        </motion.button>
      </div>
    </div>
  );
}