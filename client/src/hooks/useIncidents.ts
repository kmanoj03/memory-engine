import { useState, useCallback, useEffect } from 'react';
import { getUnresolvedIncidents, markResolved } from '../services/api';
import type { Incident, Resolution, UseIncidentsReturn } from '../services/types';

export const useIncidents = (): UseIncidentsReturn => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const unresolvedIncidents = await getUnresolvedIncidents();
      setIncidents(unresolvedIncidents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  const markResolvedIncident = useCallback(async (
    id: string, 
    resolution: Omit<Resolution, 'id' | 'incidentId' | 'resolvedAt' | 'resolvedBy'>
  ) => {
    try {
      await markResolved(id, resolution);
      // Update local state
      setIncidents(prev => prev.filter(incident => incident.id !== id));
    } catch (err) {
      throw err; // Re-throw to let the component handle the error
    }
  }, []);

  // Load incidents on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    incidents,
    loading,
    error,
    refresh,
    markResolved: markResolvedIncident
  };
};
