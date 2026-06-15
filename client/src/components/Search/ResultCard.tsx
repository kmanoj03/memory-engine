import React from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, Calendar, Server, Tag, Zap } from 'lucide-react';

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

interface ResultCardProps {
  result: SearchMatch;
  onViewPatchDiff: (patchDiff: string) => void;
  onViewDetails?: (incident: Incident) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onViewPatchDiff, onViewDetails }) => {
  const explainWhy = (whyMatched: string[]) => {
    const cosine = whyMatched.find(r => r.startsWith("cosine:"));
    const parts = whyMatched.filter(r => !r.startsWith("cosine:"))
      .map(r => r.replace("+", "").replace("tags:", "tag overlap ×"));
    return `Similarity ${cosine?.split(":")[1] ?? "?"}; matched on ${parts.join(", ")}`;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-medium text-gray-900">
              [{result.incident._id || result.incident.fingerprint}] {result.incident.error_message}
            </h4>
            {result.incident.resolved && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resolved
              </span>
            )}
          </div>
          {result.incident.fix_summary && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <h5 className="text-sm font-medium text-green-800 mb-1">Fix Summary:</h5>
              <p className="text-green-700 text-sm">{result.incident.fix_summary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <Server className="h-4 w-4 mr-1" />
          {result.incident.service}
        </div>
        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getEnvironmentColor(result.incident.env)}`}>
          {result.incident.env}
        </span>
        <span className="text-xs text-gray-400">{result.incident.version}</span>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(result.incident.created_at.toString())}
        </div>
        {result.incident.error_type && (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
            {result.incident.error_type}
          </span>
        )}
      </div>

      {/* Why Matched Explanation */}
      <div className="mb-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Why Matched:</h5>
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-start">
            <Zap className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-blue-800 font-medium">
              {explainWhy(result.why_matched)}
            </p>
          </div>
        </div>
        
        {/* Raw matching details */}
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            View raw matching details
          </summary>
          <div className="mt-2 flex flex-wrap gap-1">
            {result.why_matched.map((reason, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                <Tag className="h-3 w-3 mr-1" />
                {reason}
              </span>
            ))}
          </div>
        </details>
      </div>

      {/* Tags */}
      {result.incident.tags && result.incident.tags.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Tags:</h5>
          <div className="flex flex-wrap gap-2">
            {result.incident.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
        {result.incident.resolved && onViewDetails && (
          <button
            onClick={() => onViewDetails(result.incident)}
            className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </button>
        )}
        {result.incident.patch_diff && (
          <button
            onClick={() => onViewPatchDiff(result.incident.patch_diff!)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Patch Diff
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ResultCard;