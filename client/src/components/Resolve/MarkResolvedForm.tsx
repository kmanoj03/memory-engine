import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import Button from '../shared/Button';
import type { MarkResolvedFormProps } from '../../services/types';
import { TAG_OPTIONS } from '../../services/types';

const MarkResolvedForm: React.FC<MarkResolvedFormProps> = ({
  incidentId,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    summary: '',
    rootCause: '',
    appliedFix: '',
    patchDifferences: '',
    resolvedBy: '',
    tags: [] as string[],
    patchFile: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.summary.trim()) {
      newErrors.summary = 'Resolution summary is required';
    } else if (formData.summary.trim().length < 10) {
      newErrors.summary = 'Resolution summary must be at least 10 characters';
    }

    if (!formData.rootCause.trim()) {
      newErrors.rootCause = 'Root cause is required';
    } else if (formData.rootCause.trim().length < 10) {
      newErrors.rootCause = 'Root cause must be at least 10 characters';
    }

    if (!formData.appliedFix.trim()) {
      newErrors.appliedFix = 'Applied fix is required';
    } else if (formData.appliedFix.trim().length < 10) {
      newErrors.appliedFix = 'Applied fix must be at least 10 characters';
    }

    if (!formData.resolvedBy.trim()) {
      newErrors.resolvedBy = 'Resolved by field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        summary: formData.summary.trim(),
        rootCause: formData.rootCause.trim(),
        appliedFix: formData.appliedFix.trim(),
        // patchDifferences: formData.patchDifferences.trim(),
        // resolvedBy: formData.resolvedBy.trim(),
        tags: formData.tags,
        patchFile: formData.patchFile ? formData.patchFile.name : undefined
      });
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.patch', '.diff', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        setErrors(prev => ({
          ...prev,
          patchFile: 'Please upload a .patch, .diff, or .txt file'
        }));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          patchFile: 'File size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({ ...prev, patchFile: file }));
      setErrors(prev => ({ ...prev, patchFile: '' }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, patchFile: null }));
    setErrors(prev => ({ ...prev, patchFile: '' }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Mark Incident Resolved
              </h2>
              <p className="text-sm text-gray-600">
                {incidentId}
              </p>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Resolution Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Summary *
              </label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary of how the issue was resolved..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  errors.summary ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={3}
                disabled={loading}
              />
              {errors.summary && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.summary}
                </p>
              )}
            </div>

            {/* Root Cause */}
            <div>
              <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700 mb-2">
                Root Cause *
              </label>
              <textarea
                id="rootCause"
                value={formData.rootCause}
                onChange={(e) => setFormData(prev => ({ ...prev, rootCause: e.target.value }))}
                placeholder="What was the underlying cause of this incident?"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  errors.rootCause ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={3}
                disabled={loading}
              />
              {errors.rootCause && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.rootCause}
                </p>
              )}
            </div>

            {/* Applied Fix */}
            <div>
              <label htmlFor="appliedFix" className="block text-sm font-medium text-gray-700 mb-2">
                Applied Fix *
              </label>
              <textarea
                id="appliedFix"
                value={formData.appliedFix}
                onChange={(e) => setFormData(prev => ({ ...prev, appliedFix: e.target.value }))}
                placeholder="Describe the fix that was applied, including any code changes or configuration updates..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 font-mono text-sm ${
                  errors.appliedFix ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={4}
                disabled={loading}
              />
              {errors.appliedFix && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.appliedFix}
                </p>
              )}
            </div>

            {/* Patch Differences */}
            <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem', border: '2px solid #3b82f6' }}>
              <label htmlFor="patchDifferences" className="block text-sm font-medium text-blue-700 mb-2">
                🔧 Patch Differences
              </label>
              <textarea
                id="patchDifferences"
                value={formData.patchDifferences}
                onChange={(e) => setFormData(prev => ({ ...prev, patchDifferences: e.target.value }))}
                placeholder="Enter the commit message"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.patchDifferences ? 'border-red-300' : 'border-gray-300'
                }`}
                rows={3}
                disabled={loading}
              />
              {errors.patchDifferences && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.patchDifferences}
                </p>
              )}
            </div>

            {/* Resolved By */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem', border: '2px solid #22c55e' }}>
              <label htmlFor="resolvedBy" className="block text-sm font-medium text-green-700 mb-2">
                👤 Resolved By *
              </label>
              <input
                type="text"
                id="resolvedBy"
                value={formData.resolvedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, resolvedBy: e.target.value }))}
                placeholder="Enter the name"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 ${
                  errors.resolvedBy ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.resolvedBy && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.resolvedBy}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors duration-200 ${
                        formData.tags.includes(tag)
                          ? 'bg-primary-100 text-primary-800 border-primary-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Select relevant tags to help categorize this resolution
                </p>
              </div>
            </div>

            {/* Patch File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Patch File (Optional)
              </label>
              
              {!formData.patchFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a patch file (.patch, .diff, .txt)
                  </p>
                  <input
                    type="file"
                    accept=".patch,.diff,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                    id="patch-file"
                    disabled={loading}
                  />
                  <label
                    htmlFor="patch-file"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Max file size: 5MB
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {formData.patchFile.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({(formData.patchFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {errors.patchFile && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.patchFile}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save Resolution & Store in Memory
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default MarkResolvedForm;
