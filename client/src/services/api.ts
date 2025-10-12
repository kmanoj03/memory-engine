// import axios from 'axios';
import type {
  Incident,
  IncidentDetail,
  SearchResult,
  Resolution,
  NewIncident,
  Filters,
  PatchDiff
} from './types';

// Mock data for development
const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    description: 'API returning 500 errors on production auth service',
    service: 'Auth Service',
    environment: 'production',
    version: 'v2.x',
    tags: ['api', 'auth', '500-error'],
    status: 'unresolved',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    priority: 'high'
  },
  {
    id: 'INC-002',
    description: 'Database connection timeout in payment processing',
    service: 'Payment API',
    environment: 'production',
    version: 'v2.x',
    tags: ['database', 'timeout', 'payment'],
    status: 'resolved',
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    priority: 'critical'
  },
  {
    id: 'INC-003',
    description: 'Memory leak in user service causing server crashes',
    service: 'User Service',
    environment: 'staging',
    version: 'v1.x',
    tags: ['memory-leak', 'crash', 'performance'],
    status: 'unresolved',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    priority: 'medium'
  },
  {
    id: 'INC-004',
    description: 'Notification service failing to send emails',
    service: 'Notification Service',
    environment: 'production',
    version: 'v2.x',
    tags: ['notification', 'email', 'service-down'],
    status: 'unresolved',
    createdAt: '2024-01-12T14:30:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
    priority: 'high'
  },
  {
    id: 'INC-005',
    description: 'Data pipeline stuck processing large files',
    service: 'Data Pipeline',
    environment: 'production',
    version: 'v2.x',
    tags: ['data-pipeline', 'performance', 'processing'],
    status: 'unresolved',
    createdAt: '2024-01-11T11:45:00Z',
    updatedAt: '2024-01-11T11:45:00Z',
    priority: 'medium'
  }
];

const mockResolutions: Resolution[] = [
  {
    id: 'RES-001',
    incidentId: 'INC-002',
    summary: 'Fixed database connection pool configuration',
    rootCause: 'Connection pool was not properly configured for high load scenarios',
    appliedFix: 'Updated connection pool settings and added retry logic',
    tags: ['database', 'connection-pool', 'retry-logic'],
    resolvedAt: '2024-01-14T16:45:00Z',
    resolvedBy: 'john.doe@company.com'
  }
];

const mockPatchDiffs: Record<string, PatchDiff> = {
  'INC-002': {
    fileName: 'src/database/connection.js',
    beforeContent: `const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'payment_db',
  max: 10,
  idleTimeoutMillis: 30000
});`,
    afterContent: `const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'payment_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  retryDelayMs: 2000,
  maxRetries: 3
});`,
    addedLines: [6, 7, 8],
    removedLines: []
  }
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const searchIncidents = async (query: string, filters: Filters): Promise<SearchResult[]> => {
  await delay(800); // Simulate network delay
  
  // Simple mock search logic
  const filteredIncidents = mockIncidents.filter(incident => {
    if (filters.service !== 'All Services' && incident.service !== filters.service) return false;
    if (filters.environment !== 'All' && incident.environment !== filters.environment.toLowerCase()) return false;
    if (filters.version !== 'All' && incident.version !== filters.version) return false;
    if (filters.tags.length > 0 && !filters.tags.some(tag => incident.tags.includes(tag))) return false;
    return true;
  });

  // Mock similarity scoring based on keyword matching
  const results: SearchResult[] = filteredIncidents.map(incident => {
    const queryWords = query.toLowerCase().split(' ');
    const incidentWords = incident.description.toLowerCase().split(' ');
    const matchingWords = queryWords.filter(word => incidentWords.some(iw => iw.includes(word) || word.includes(iw)));
    const similarityScore = Math.min(0.95, 0.3 + (matchingWords.length / queryWords.length) * 0.6);

    const whyMatched = [];
    if (similarityScore > 0.7) whyMatched.push({
      type: 'similar_error' as const,
      description: 'Similar error pattern',
      confidence: 0.9
    });
    if (query.toLowerCase().includes(incident.service.toLowerCase())) whyMatched.push({
      type: 'same_service' as const,
      description: 'Same service',
      confidence: 0.8
    });
    if (matchingWords.length > 0) whyMatched.push({
      type: 'matching_keywords' as const,
      description: `Matching keywords: ${matchingWords.join(', ')}`,
      keywords: matchingWords,
      confidence: 0.7
    });
    if (new Date(incident.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) whyMatched.push({
      type: 'recent_occurrence' as const,
      description: 'Recent occurrence',
      confidence: 0.6
    });

    return {
      incident,
      similarityScore,
      whyMatched,
      fixSummary: incident.status === 'resolved' 
        ? mockResolutions.find(r => r.incidentId === incident.id)?.summary || 'Issue was resolved'
        : 'No fix available yet',
      patchDiff: mockPatchDiffs[incident.id]
    };
  });

  // Sort by similarity score
  return results.sort((a, b) => b.similarityScore - a.similarityScore);
};

export const getUnresolvedIncidents = async (): Promise<Incident[]> => {
  await delay(600);
  return mockIncidents.filter(incident => incident.status === 'unresolved');
};

export const getIncidentById = async (id: string): Promise<IncidentDetail> => {
  await delay(400);
  const incident = mockIncidents.find(i => i.id === id);
  if (!incident) {
    throw new Error('Incident not found');
  }

  const resolution = mockResolutions.find(r => r.incidentId === id);
  const relatedIncidents = mockIncidents
    .filter(i => i.id !== id && i.service === incident.service)
    .slice(0, 3)
    .map(i => i.id);

  return {
    ...incident,
    errorLogs: `Error: ${incident.description}\nTimestamp: ${incident.createdAt}\nStack trace: [Stack trace would be here]\nEnvironment: ${incident.environment}`,
    relatedIncidents,
    resolution
  };
};

export const markResolved = async (id: string, resolution: Omit<Resolution, 'id' | 'incidentId' | 'resolvedAt' | 'resolvedBy'>): Promise<void> => {
  await delay(1000);
  
  const newResolution: Resolution = {
    id: `RES-${Date.now()}`,
    incidentId: id,
    ...resolution,
    resolvedAt: new Date().toISOString(),
    resolvedBy: 'current.user@company.com'
  };

  mockResolutions.push(newResolution);
  
  // Update incident status
  const incident = mockIncidents.find(i => i.id === id);
  if (incident) {
    incident.status = 'resolved';
    incident.updatedAt = new Date().toISOString();
  }
};

export const saveNewIncident = async (incident: NewIncident): Promise<Incident> => {
  await delay(800);
  
  const newIncident: Incident = {
    id: `INC-${String(mockIncidents.length + 1).padStart(3, '0')}`,
    ...incident,
    status: 'unresolved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priority: 'medium'
  };

  mockIncidents.push(newIncident);
  return newIncident;
};

export const getPatchDiff = async (incidentId: string): Promise<PatchDiff> => {
  await delay(300);
  const patchDiff = mockPatchDiffs[incidentId];
  if (!patchDiff) {
    throw new Error('Patch diff not found');
  }
  return patchDiff;
};

// Utility function to generate sample data for demo
export const generateSampleData = () => {
  const sampleQueries = [
    'API returning 500 errors',
    'Database connection timeout',
    'Memory leak causing crashes',
    'Service not responding',
    'Email notifications failing'
  ];
  
  const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
  return randomQuery;
};

// Function to add sample incidents for demo
export const addSampleIncidents = () => {
  const sampleIncidents: NewIncident[] = [
    {
      description: 'User authentication failing intermittently with 401 errors',
      service: 'Auth Service',
      environment: 'production',
      version: 'v2.x',
      tags: ['auth', '401-error', 'intermittent'],
      additionalContext: 'Users are getting randomly logged out during normal usage.'
    },
    {
      description: 'Payment processing timeout causing failed transactions',
      service: 'Payment API',
      environment: 'production',
      version: 'v2.x',
      tags: ['payment', 'timeout', 'transaction-failure'],
      additionalContext: 'Transactions are timing out after 30 seconds, causing payment failures.'
    },
    {
      description: 'Memory usage increasing steadily causing performance degradation',
      service: 'User Service',
      environment: 'staging',
      version: 'v1.x',
      tags: ['memory-leak', 'performance', 'degradation'],
      additionalContext: 'Memory usage grows from 500MB to 2GB over 24 hours without any user activity.'
    },
    {
      description: 'Email delivery service returning 422 validation errors',
      service: 'Notification Service',
      environment: 'production',
      version: 'v2.x',
      tags: ['email', '422-error', 'validation'],
      additionalContext: 'Email service is rejecting valid email addresses with validation errors.'
    },
    {
      description: 'Data pipeline stuck processing large CSV files',
      service: 'Data Pipeline',
      environment: 'production',
      version: 'v2.x',
      tags: ['data-pipeline', 'csv-processing', 'stuck'],
      additionalContext: 'Pipeline has been processing the same 100MB CSV file for 6 hours.'
    }
  ];

  return sampleIncidents;
};

// API error handling wrapper
export const handleApiError = (error: any): string => {
  if (error.response) {
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    return 'Network error - please check your connection';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};
