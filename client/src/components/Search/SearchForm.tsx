import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Button from '../shared/Button';
import type { SearchFormProps } from '../../services/types';

const SearchForm = forwardRef<HTMLTextAreaElement, SearchFormProps>(({
  onSubmit,
  loading = false,
  initialQuery = ''
}, ref) => {
  const [query, setQuery] = useState(initialQuery);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use forwarded ref or fallback to internal ref
  const inputRef = (ref as React.RefObject<HTMLTextAreaElement>) || textareaRef;

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [query, inputRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSubmit(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your incident
          </label>
          <div className="relative">
            <textarea
              ref={inputRef}
              id="search-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your incident... (e.g., 'API returning 500 errors on prod')"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 resize-none transition-colors duration-200"
              rows={4}
              maxLength={1000}
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {query.length}/1000
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘</kbd> + <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> to search
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={<Search className="w-5 h-5" />}
            disabled={!query.trim() || loading}
            className="min-w-[160px]"
          >
            {loading ? 'Searching...' : 'Search Memories'}
          </Button>
        </div>
      </form>

      {/* Quick example buttons */}
      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-4 pt-4 border-t border-gray-100"
        >
          <p className="text-sm text-gray-600 mb-3">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              'API returning 500 errors',
              'Database connection timeout',
              'Memory leak causing crashes',
              'Service not responding'
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="px-3 py-1.5 text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors duration-200"
              >
                {example}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
});

SearchForm.displayName = 'SearchForm';

export default SearchForm;
