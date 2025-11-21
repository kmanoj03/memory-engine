import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { getIncidents, resolveIncident } from '../../services/api';

const ResolvePage: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resolutionForm, setResolutionForm] = useState({
    fix_summary: '',
    patch_diff: ''
  });
  const { showSuccess, showError, showLoading } = useToast();

  // Load incidents on component mount
  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    const loadingToast: (() => void) | undefined = showLoading('Loading incidents', 'Fetching incident data from the server...');
    
    try {
      // Load both resolved and unresolved incidents
      const [unresolvedResponse, resolvedResponse] = await Promise.all([
        getIncidents(false), // unresolved
        getIncidents(true)   // resolved
      ]);

      // Dismiss loading toast
      if (loadingToast) {
        loadingToast();
      }

      // Combine and format incidents
      const allIncidents = [
        ...unresolvedResponse.incidents.map(incident => ({
          id: incident.id,
          description: incident.error_message,
          service: incident.service,
          environment: incident.env,
          status: 'open',
          resolved: false,
          createdAt: incident.created_at,
          priority: 'medium' // Default priority
        })),
        ...resolvedResponse.incidents.map(incident => ({
          id: incident.id,
          description: incident.error_message,
          service: incident.service,
          environment: incident.env,
          status: 'resolved',
          resolved: true,
          createdAt: incident.created_at,
          priority: 'medium', // Default priority
          fix_summary: incident.fix_summary,
          patch_diff: incident.patch_diff,
          resolved_at: incident.resolved_at
        }))
      ];

      setIncidents(allIncidents);
    } catch (error) {
      // Dismiss loading toast
      if (loadingToast) {
        loadingToast();
      }
      
      console.error('Error loading incidents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Failed to load incidents', `Please try again. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshIncidents = async () => {
    await loadIncidents();
    showSuccess('Incidents refreshed successfully!', 'Latest incident data has been loaded.');
  };

  const handleFormChange = (field: string, value: string) => {
    setResolutionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMarkResolved = async () => {
    if (!resolutionForm.fix_summary.trim()) {
      showError('Please fill in the fix summary field');
      return;
    }

    setLoading(true);
    const loadingToast: (() => void) | undefined = showLoading('Resolving incident', 'Saving resolution details and updating incident status...');
    
    try {
      // Call the real resolve API
      await resolveIncident(selectedIncident.id, {
        fix_summary: resolutionForm.fix_summary,
        patch_diff: resolutionForm.patch_diff,
        resolved_by: 'current.user@company.com' // You might want to get this from auth context
      });
      
      // Dismiss loading toast
      if (loadingToast) {
        loadingToast();
      }
      
      // Update local state
      setIncidents(prev => prev.map(inc =>
        inc.id === selectedIncident.id ? {
          ...inc,
          status: 'resolved',
          resolved: true,
          fix_summary: resolutionForm.fix_summary,
          patch_diff: resolutionForm.patch_diff,
          resolved_at: new Date().toISOString()
        } : inc
      ));
      
      setSelectedIncident(null);
      setResolutionForm({ fix_summary: '', patch_diff: '' });
      showSuccess('Incident marked as resolved!', 'The incident has been successfully resolved and saved.');
      
    } catch (error) {
      // Dismiss loading toast
      if (loadingToast) {
        loadingToast();
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Failed to resolve incident', `Please try again. ${errorMessage}`);
      console.error('Error resolving incident:', error);
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-600 bg-red-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🛠️ Resolve Incidents
          </h1>
          <p className="text-gray-600">
            Manage and resolve active incidents. Track resolution progress and document solutions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefreshIncidents}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Open Incidents</p>
              <p className="text-2xl font-bold text-gray-900">
                {incidents.filter(i => i.status === 'open').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {incidents.filter(i => i.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Incidents</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incident ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {incident.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {incident.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {incident.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(incident.createdAt).toLocaleString()}
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedIncident(incident);
                            setResolutionForm({ fix_summary: '', patch_diff: '' });
                          }}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Details
                        </button>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Incident #{selectedIncident.id}
                  </h3>
                  {selectedIncident.resolved && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ✅ Resolved
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{selectedIncident.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                    <p className="text-gray-900">{selectedIncident.service}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                    <p className="text-gray-900">{selectedIncident.environment}</p>
                  </div>
                </div>
                
                {/* Fix Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fix Summary *
                  </label>
                  <textarea
                    value={resolutionForm.fix_summary}
                    onChange={(e) => handleFormChange('fix_summary', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder={selectedIncident.resolved ? "This incident has already been resolved." : "Describe how you resolved this incident..."}
                    disabled={loading || selectedIncident.resolved}
                  />
                </div>

                {/* Patch Diff */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patch Diff
                  </label>
                  <textarea
                    value={resolutionForm.patch_diff}
                    onChange={(e) => handleFormChange('patch_diff', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    rows={6}
                    placeholder={selectedIncident.resolved ? "This incident has already been resolved." : "Paste your patch diff here (optional)..."}
                    disabled={loading || selectedIncident.resolved}
                  />
                </div>

                {/* Show message for resolved incidents */}
                {selectedIncident.resolved && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-800">
                          This incident has already been resolved. You can view the details but cannot modify the resolution.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                
                  <div className="flex items-center justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setSelectedIncident(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    {!selectedIncident.resolved && (
                      <button
                        onClick={handleMarkResolved}
                        disabled={loading}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Resolving...' : 'Mark as Resolved'}
                      </button>
                    )}
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Instructions */}
      <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
        <p style={{ color: '#0369a1', margin: 0, fontWeight: '500' }}>
          🎯 <strong>Demo:</strong> Click "View Details" to see incident details and fill in the resolution form (fix_summary, patch_diff) to mark as resolved!
        </p>
      </div>
    </div>
  );
};

export default ResolvePage;