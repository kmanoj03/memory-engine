import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Tag, AlertCircle, Code, Clock, Server, Package, Plus } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import PatchDiffModal from './PatchDiffModal';
import ResultCard from './ResultCard';

interface SearchFormData {
  error_message: string;
  stack_trace?: string;
  service?: string;
  env?: Env;
  version?: string;
  tags?: string[];
  topK?: number;
  limit?: number;
}

type Env = "dev" | "staging" | "prod";

interface Incident {
  _id?: string;
  fingerprint: string;
  service: string;
  env: Env;
  version: string;
  version_bucket?: string;
  error_type?: string;
  language?: string;
  file?: string;
  function?: string;
  error_message: string;
  stack_trace?: string;
  frame_tokens?: string[];
  message_tokens?: string[];
  tags?: string[];
  root_cause?: string;
  fix_summary?: string;
  patch_diff?: string;
  files_touched?: string[];
  commit_sha?: string;
  resolved: boolean;
  resolved_at?: Date | string;
  resolved_by_fix_id?: string;
  vector?: number[];
  source?: "manual" | "ci" | "runtime";
  ingest_notes?: string;
  created_at: Date | string;
}

interface SearchMatch {
  incident: Incident;
  final_score: number;
  why_matched: string[];
}

const SearchPage: React.FC = () => {
  const [formData, setFormData] = useState<SearchFormData>({
    error_message: '',
    stack_trace: '',
    service: '',
    env: undefined,
    version: '',
    tags: [],
    topK: 10,
    limit: 10
  });
  const [tagInput, setTagInput] = useState('');
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatchDiff, setSelectedPatchDiff] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();


  const serviceOptions = [
    { value: '', label: 'All Services' },
    { value: 'user-service', label: 'User Service' },
    { value: 'auth-service', label: 'Auth Service' },
    { value: 'payment-service', label: 'Payment Service' },
    { value: 'notification-service', label: 'Notification Service' },
    { value: 'api-gateway', label: 'API Gateway' },
    { value: 'frontend', label: 'Frontend' }
  ];

  const environmentOptions = [
    { value: '', label: 'All Environments' },
    { value: 'prod', label: 'Production' },
    { value: 'staging', label: 'Staging' },
    { value: 'dev', label: 'Development' }
  ];

  const versionOptions = [
    { value: '', label: 'All Versions' },
    { value: 'v2.1.0', label: 'v2.1.0' },
    { value: 'v2.0.1', label: 'v2.0.1' },
    { value: 'v1.5.0', label: 'v1.5.0' },
    { value: 'v1.3.0', label: 'v1.3.0' },
    { value: 'v1.2.3', label: 'v1.2.3' },
    { value: 'v1.1.0', label: 'v1.1.0' },
    { value: 'v1.0.5', label: 'v1.0.5' }
  ];

  const handleInputChange = (field: keyof SearchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
        tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSaveAsNewIncident = async () => {
    if (!formData.error_message.trim()) {
      showError('Please enter an error message to save as a new incident');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Replace with actual backend API call to /api/incidents
      // const response = await fetch('/api/incidents', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     error_message: formData.error_message,
          //     stack_trace: formData.stack_trace,
          //     service: formData.service,
          //     env: formData.env,
          //     version: formData.version,
          //     tags: formData.tags,
      //     fix_summary: '', // Empty for new incidents
      //     resolved: false
      //   })
      // });
      // const newIncident = await response.json();

      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
          // Create a mock incident ID
          // const mockIncidentId = `INC-${Date.now()}`;
      
      showSuccess('New incident saved successfully! You can now search for it or resolve it in the Resolve tab.');
      
      // Clear the form after successful save
      setFormData({
            error_message: '',
            stack_trace: '',
            service: '',
            env: undefined,
            version: '',
            tags: [],
            topK: 10,
            limit: 10
          });
      setResults([]);
      
    } catch (error) {
      showError('Failed to save new incident. Please try again.');
      console.error('Error saving new incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  const handleSearch = async () => {
        if (!formData.error_message.trim()) {
          showError('Please enter an error message to search for similar incidents');
          return;
        }

    setLoading(true);
    
    try {
      // TODO: Replace with actual backend API call
      // const response = await fetch('/api/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     error_message: formData.error_message,
          //     stack_trace: formData.stack_trace,
          //     service: formData.service,
          //     env: formData.env,
          //     version: formData.version,
          //     tags: formData.tags
      //   })
      // });
      // const data = await response.json();
      
      // Mock search results - simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock API response in the format you provided
      const mockApiResponse = {
        results: [
          {
            id: "68eac901a4222f329b65e358",
            score: 1.65,
            whyMatched: ["cosine:0.96","+service","+env","+version","+tags:2"],
            service: "payments-api",
            env: "prod",
            version: "v2.3.1",
            error_message: "TypeError: Cannot read properties of undefined (reading \"amount\")",
            resolved: true,
            fix_summary: "Add null check before reading amount",
            patch_diff: "diff --git a/src/routes/charges.ts ...",
            resolved_at: "2025-10-11T21:43:59.857Z"
          }
        ]
      };
      
      // Simple mock search logic - for demo purposes, only return results if error contains "TypeError"
          const errorLower = formData.error_message.toLowerCase();
      const hasTypeError = errorLower.includes('typeerror') || errorLower.includes('cannot read');
      
      if (hasTypeError) {
        // Convert API response to SearchMatch format
        const searchMatches: SearchMatch[] = mockApiResponse.results.map(result => ({
          incident: {
            _id: result.id,
            fingerprint: `sha1_${result.id}`,
            service: result.service,
            env: result.env as Env,
            version: result.version,
            error_type: 'TypeError',
            error_message: result.error_message,
            stack_trace: 'at PaymentHandler.processCharge (payments-api/src/routes/charges.ts:45:12)',
            tags: ['payment', 'typeerror', 'undefined'],
            fix_summary: result.fix_summary,
            patch_diff: result.patch_diff,
            resolved: result.resolved,
            created_at: '2024-01-15T10:30:00Z',
            resolved_at: result.resolved_at
          },
          final_score: result.score / 2, // Normalize score to 0-1 range
          why_matched: result.whyMatched
        }));
        
        setResults(searchMatches);
        showSuccess(`Found ${searchMatches.length} similar incidents`);
      } else {
        // No results found - this will trigger the "Save as New Incident" button
        setResults([]);
        showSuccess('No similar incidents found - you can save this as a new incident');
      }
      
    } catch (error) {
      showError('Search failed. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
            error_message: '',
            stack_trace: '',
            service: '',
            env: undefined,
            version: '',
            tags: [],
            topK: 10,
            limit: 10
          });
    setResults([]);
    setTagInput('');
  };

  const handleViewPatchDiff = (patchDiff: string) => {
    setSelectedPatchDiff(patchDiff);
  };

  const handleApplyFix = (incidentId: string) => {
    showSuccess(`Applied fix from incident ${incidentId}`);
    // TODO: Implement actual fix application logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔍 Search Incident Memories
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find similar incidents and their solutions using AI-powered search. 
          Describe your current incident to discover relevant fixes from past experiences.
        </p>
      </div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div className="space-y-6">
          {/* Error Textarea */}
          <div>
            <label htmlFor="error-text" className="block text-sm font-medium text-gray-700 mb-2">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Error Message *
            </label>
            <textarea
              id="error-text"
              value={formData.error_message}
              onChange={(e) => handleInputChange('error_message', e.target.value)}
              placeholder="e.g., TypeError: cannot read property 'userId' of undefined"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the raw error message or log snippet here
            </p>
          </div>

          {/* Trace Textarea */}
          <div>
            <label htmlFor="trace-text" className="block text-sm font-medium text-gray-700 mb-2">
              <Code className="inline h-4 w-4 mr-1" />
              Stack Trace (Optional)
            </label>
            <textarea
              id="trace-text"
              value={formData.stack_trace}
              onChange={(e) => handleInputChange('stack_trace', e.target.value)}
              placeholder="e.g., at LoginHandler.handleRequest (/app/src/controllers/auth.js:45:12)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Paste the call stack or trace information
            </p>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="service-select" className="block text-sm font-medium text-gray-700 mb-2">
                <Server className="inline h-4 w-4 mr-1" />
                Service
              </label>
              <select
                id="service-select"
                value={formData.service}
                onChange={(e) => handleInputChange('service', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {serviceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="environment-select" className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Environment
              </label>
              <select
                id="environment-select"
                value={formData.env}
                onChange={(e) => handleInputChange('env', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {environmentOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="version-select" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Version
              </label>
              <select
                id="version-select"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {versionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Input */}
          <div>
            <label htmlFor="tags-input" className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Custom Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="tags-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., database, login, timeout"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            
            {/* Tags Display */}
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={!formData.error_message.trim() || loading}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Search className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Searching...' : 'Search Memories'}
            </button>
            <button
              onClick={handleClearForm}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Found {results.length} similar incident{results.length !== 1 ? 's' : ''}
              </h3>
              <button
                onClick={() => setResults([])}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear results
              </button>
            </div>
            
            {results.map((result) => (
              <ResultCard
                key={result.incident._id || result.incident.fingerprint}
                result={result}
                onViewPatchDiff={handleViewPatchDiff}
                onApplyFix={handleApplyFix}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && results.length === 0 && formData.error_message && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No similar incidents found</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any similar incidents in our memory bank.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Try adjusting your search criteria or save this as a new incident for future reference.
          </p>
          
          {/* Save as New Incident Button */}
          <button
            onClick={handleSaveAsNewIncident}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save as New Incident'}
          </button>
          
          <p className="text-xs text-gray-400 mt-3">
            This will create a new incident entry that can be resolved later
          </p>
        </div>
      )}

     

      {/* Patch Diff Modal */}
      {selectedPatchDiff && (
        <PatchDiffModal
          patchDiff={selectedPatchDiff}
          onClose={() => setSelectedPatchDiff(null)}
        />
      )}
    </div>
  );
};

export default SearchPage;