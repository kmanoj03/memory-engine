import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Code, Server, Clock, Package, Tag, FileText, Save } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface NewIncidentData {
  error: string;
  trace: string;
  service: string;
  environment: string;
  version: string;
  tags: string;
  fixSummary: string;
}

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NewIncidentModal: React.FC<NewIncidentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<NewIncidentData>({
    error: '',
    trace: '',
    service: '',
    environment: '',
    version: '',
    tags: '',
    fixSummary: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<NewIncidentData>>({});
  const { showSuccess, showError } = useToast();

  const serviceOptions = [
    { value: '', label: 'Select Service' },
    { value: 'user-service', label: 'User Service' },
    { value: 'auth-service', label: 'Auth Service' },
    { value: 'payment-service', label: 'Payment Service' },
    { value: 'notification-service', label: 'Notification Service' },
    { value: 'api-gateway', label: 'API Gateway' },
    { value: 'frontend', label: 'Frontend' }
  ];

  const environmentOptions = [
    { value: '', label: 'Select Environment' },
    { value: 'prod', label: 'Production' },
    { value: 'staging', label: 'Staging' },
    { value: 'dev', label: 'Development' }
  ];

  const handleInputChange = (field: keyof NewIncidentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<NewIncidentData> = {};

    if (!formData.error.trim()) {
      newErrors.error = 'Error message is required';
    }

    if (!formData.service) {
      newErrors.service = 'Service is required';
    }

    if (!formData.environment) {
      newErrors.environment = 'Environment is required';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    }

    if (!formData.fixSummary.trim()) {
      newErrors.fixSummary = 'Fix summary is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fix the form errors before submitting');
      return;
    }

    setLoading(true);

    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // TODO: Replace with actual backend API call
      // const response = await fetch('/api/incidents', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     error: formData.error,
      //     trace: formData.trace,
      //     service: formData.service,
      //     env: formData.environment,
      //     version: formData.version,
      //     tags: tagsArray,
      //     fixSummary: formData.fixSummary
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to create incident');
      // }

      // const result = await response.json();

      // Mock API call for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful creation with realistic data
      const mockIncident = {
        id: `INC-${Date.now().toString().slice(-3)}`,
        error: formData.error,
        trace: formData.trace,
        service: formData.service,
        environment: formData.environment,
        version: formData.version,
        tags: tagsArray,
        fixSummary: formData.fixSummary,
        createdAt: new Date().toISOString(),
        embedding: `mock_embedding_${Date.now()}` // This would be a real vector in production
      };
      
      console.log('✅ Mock incident created successfully:', mockIncident);
      
      // Store in localStorage for demo purposes (so it appears in the list)
      const existingIncidents = JSON.parse(localStorage.getItem('mockIncidents') || '[]');
      existingIncidents.unshift(mockIncident);
      localStorage.setItem('mockIncidents', JSON.stringify(existingIncidents));

      showSuccess('Incident created successfully!');
      onSuccess();
      handleClose();

    } catch (error) {
      console.error('Error creating incident:', error);
      showError('Failed to create incident. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form data
    setFormData({
      error: '',
      trace: '',
      service: '',
      environment: '',
      version: '',
      tags: '',
      fixSummary: ''
    });
    setErrors({});
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Create New Incident
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Error Message */}
                  <div>
                    <label htmlFor="error" className="block text-sm font-medium text-gray-700 mb-2">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Error Message *
                    </label>
                    <textarea
                      id="error"
                      value={formData.error}
                      onChange={(e) => handleInputChange('error', e.target.value)}
                      placeholder="e.g., TypeError: cannot read property 'userId' of undefined"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${
                        errors.error ? 'border-red-300' : 'border-gray-300'
                      }`}
                      rows={3}
                    />
                    {errors.error && (
                      <p className="mt-1 text-sm text-red-600">{errors.error}</p>
                    )}
                  </div>

                  {/* Stack Trace */}
                  <div>
                    <label htmlFor="trace" className="block text-sm font-medium text-gray-700 mb-2">
                      <Code className="inline h-4 w-4 mr-1" />
                      Stack Trace
                    </label>
                    <textarea
                      id="trace"
                      value={formData.trace}
                      onChange={(e) => handleInputChange('trace', e.target.value)}
                      placeholder="e.g., at LoginHandler.handleRequest (/app/src/controllers/auth.js:45:12)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Fix Summary */}
                  <div>
                    <label htmlFor="fixSummary" className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
                      Fix Summary *
                    </label>
                    <textarea
                      id="fixSummary"
                      value={formData.fixSummary}
                      onChange={(e) => handleInputChange('fixSummary', e.target.value)}
                      placeholder="e.g., Added null check for user object before accessing userId property"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none ${
                        errors.fixSummary ? 'border-red-300' : 'border-gray-300'
                      }`}
                      rows={3}
                    />
                    {errors.fixSummary && (
                      <p className="mt-1 text-sm text-red-600">{errors.fixSummary}</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Service */}
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                      <Server className="inline h-4 w-4 mr-1" />
                      Service *
                    </label>
                    <select
                      id="service"
                      value={formData.service}
                      onChange={(e) => handleInputChange('service', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.service ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      {serviceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.service && (
                      <p className="mt-1 text-sm text-red-600">{errors.service}</p>
                    )}
                  </div>

                  {/* Environment */}
                  <div>
                    <label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Environment *
                    </label>
                    <select
                      id="environment"
                      value={formData.environment}
                      onChange={(e) => handleInputChange('environment', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.environment ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      {environmentOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.environment && (
                      <p className="mt-1 text-sm text-red-600">{errors.environment}</p>
                    )}
                  </div>

                  {/* Version */}
                  <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
                      <Package className="inline h-4 w-4 mr-1" />
                      Version *
                    </label>
                    <input
                      type="text"
                      id="version"
                      value={formData.version}
                      onChange={(e) => handleInputChange('version', e.target.value)}
                      placeholder="e.g., v2.1.0"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.version ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.version && (
                      <p className="mt-1 text-sm text-red-600">{errors.version}</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                      <Tag className="inline h-4 w-4 mr-1" />
                      Tags
                    </label>
                    <input
                      type="text"
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g., auth, login, timeout (comma-separated)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Separate multiple tags with commas
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Creating...' : 'Create Incident'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default NewIncidentModal;
