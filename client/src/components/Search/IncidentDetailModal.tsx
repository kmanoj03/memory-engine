import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Calendar, Server, Tag, CheckCircle, Code, FileText } from 'lucide-react';

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

interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ incident, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'patch'>('summary');

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'prod': return 'bg-red-100 text-red-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      case 'dev': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPatchDiff = (diff: string) => {
    return diff.split('\n').map((line, index) => {
      const isAddition = line.startsWith('+');
      const isDeletion = line.startsWith('-');
      const isContext = line.startsWith(' ');
      
      return (
        <div
          key={index}
          className={`font-mono text-sm px-2 py-1 ${
            isAddition 
              ? 'bg-green-50 text-green-800 border-l-2 border-green-500' 
              : isDeletion 
              ? 'bg-red-50 text-red-800 border-l-2 border-red-500'
              : isContext
              ? 'bg-gray-50 text-gray-700'
              : 'text-gray-600'
          }`}
        >
          {line}
        </div>
      );
    });
  };

  if (!incident) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Incident Details
                    </h3>
                    {incident.resolved && (
                      <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    ID: {incident._id || incident.fingerprint}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Incident Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Error Message</h4>
                    <p className="text-gray-900 font-mono text-sm bg-white p-3 rounded border">
                      {incident.error_message}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Service:</span>
                      <span className="text-sm font-medium">{incident.service}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Environment:</span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getEnvironmentColor(incident.env)}`}>
                        {incident.env}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Version:</span>
                      <span className="text-sm font-medium">{incident.version}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm font-medium">{formatDate(incident.created_at.toString())}</span>
                    </div>
                    {incident.resolved_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Resolved:</span>
                        <span className="text-sm font-medium">{formatDate(incident.resolved_at.toString())}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {incident.tags && incident.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {incident.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'summary'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="h-4 w-4 inline mr-2" />
                    Fix Summary
                  </button>
                  {incident.patch_diff && (
                    <button
                      onClick={() => setActiveTab('patch')}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'patch'
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Code className="h-4 w-4 inline mr-2" />
                      Patch Diff
                    </button>
                  )}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-96">
                {activeTab === 'summary' && (
                  <div className="space-y-4">
                    {incident.fix_summary ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-green-800">Fix Summary</h4>
                          <button
                            onClick={() => handleCopy(incident.fix_summary!)}
                            className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-md hover:bg-green-200 transition-colors"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-green-700 whitespace-pre-wrap">{incident.fix_summary}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Fix Summary Available</h4>
                        <p className="text-gray-600">This incident doesn't have a fix summary yet.</p>
                      </div>
                    )}

                    {incident.root_cause && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-blue-800 mb-2">Root Cause</h4>
                        <p className="text-blue-700 whitespace-pre-wrap">{incident.root_cause}</p>
                      </div>
                    )}

                    {incident.stack_trace && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium text-gray-800">Stack Trace</h4>
                          <button
                            onClick={() => handleCopy(incident.stack_trace!)}
                            className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="text-gray-700 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                          {incident.stack_trace}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'patch' && incident.patch_diff && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-gray-800">Patch Diff</h4>
                        <button
                          onClick={() => handleCopy(incident.patch_diff!)}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Patch
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="max-h-96 overflow-y-auto">
                          {formatPatchDiff(incident.patch_diff)}
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IncidentDetailModal;
