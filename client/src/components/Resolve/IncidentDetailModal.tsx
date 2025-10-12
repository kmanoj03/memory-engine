import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, MapPin, Tag, AlertTriangle, ChevronDown, ChevronUp, Link2 } from 'lucide-react';
import Button from '../shared/Button';
import LoadingSpinner from '../shared/LoadingSpinner';
import type { IncidentDetailModalProps } from '../../services/types';
import { getEnvironmentColor, getServiceColor, formatDateTime } from '../../utils/helpers';
import { getIncidentById } from '../../services/api';

const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incidentId,
  isOpen,
  onClose,
  onMarkResolved
}) => {
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['description', 'service']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  useEffect(() => {
    if (isOpen && incidentId) {
      loadIncident();
    } else {
      setIncident(null);
      setError(null);
    }
  }, [isOpen, incidentId]);

  const loadIncident = async () => {
    if (!incidentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const incidentData = await getIncidentById(incidentId);
      setIncident(incidentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load incident');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {incident?.id || 'Incident Details'}
                </h2>
                <p className="text-sm text-gray-600">
                  {incident ? formatDateTime(incident.createdAt) : 'Loading...'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner text="Loading incident details..." />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Error Loading Incident</h3>
                    <p className="mt-1 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {incident && !loading && (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {incident.status === 'resolved' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        <Clock className="w-4 h-4 mr-1" />
                        Open
                      </span>
                    )}
                    
                    {incident.priority && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        incident.priority === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                        incident.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        incident.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }`}>
                        {incident.priority}
                      </span>
                    )}
                  </div>
                  
                  {incident.status === 'open' && (
                    <Button
                      variant="primary"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => onMarkResolved(incident.id)}
                    >
                      Mark as Resolved
                    </Button>
                  )}
                </div>

                {/* Description Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <button
                    onClick={() => toggleSection('description')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-medium text-gray-900">Description</h3>
                    {expandedSections.has('description') ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections.has('description') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <p className="text-gray-700">{incident.description}</p>
                    </motion.div>
                  )}
                </div>

                {/* Service & Environment Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <button
                    onClick={() => toggleSection('service')}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-medium text-gray-900">Service & Environment</h3>
                    {expandedSections.has('service') ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections.has('service') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getServiceColor(incident.service)}`}>
                            <MapPin className="w-4 h-4 mr-1" />
                            {incident.service}
                          </span>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEnvironmentColor(incident.environment)}`}>
                            <Tag className="w-4 h-4 mr-1" />
                            {incident.environment}
                          </span>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                          <span className="text-sm text-gray-900">{incident.version}</span>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                          <div className="flex flex-wrap gap-1">
                            {incident.tags.map((tag: string) => (
                              <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Error Logs Section */}
                {incident.errorLogs && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <button
                      onClick={() => toggleSection('errorLogs')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-medium text-gray-900">Error Logs</h3>
                      {expandedSections.has('errorLogs') ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedSections.has('errorLogs') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3"
                      >
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                          {incident.errorLogs}
                        </pre>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Related Incidents Section */}
                {incident.relatedIncidents && incident.relatedIncidents.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <button
                      onClick={() => toggleSection('related')}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-medium text-gray-900">Related Incidents</h3>
                      {expandedSections.has('related') ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedSections.has('related') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3"
                      >
                        <div className="grid gap-3">
                          {incident.relatedIncidents.slice(0, 3).map((relatedId: string) => (
                            <div key={relatedId} className="bg-white p-3 rounded-md border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Link2 className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-mono text-primary-600">{relatedId}</span>
                                </div>
                                <button className="text-xs text-primary-600 hover:text-primary-700">
                                  View Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Resolution Section */}
                {incident.resolution && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h3 className="text-lg font-medium text-green-900 mb-3">Resolution</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Summary</label>
                        <p className="text-sm text-green-800">{incident.resolution.summary}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Root Cause</label>
                        <p className="text-sm text-green-800">{incident.resolution.rootCause}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Applied Fix</label>
                        <p className="text-sm text-green-800">{incident.resolution.appliedFix}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Patch Differences</label>
                        <p className="text-sm text-green-800">
                          {incident.resolution.patchDifferences || "Enter the commit message"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Resolved By</label>
                        <p className="text-sm text-green-800">
                          {incident.resolution.resolvedBy || "Enter the name"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncidentDetailModal;
