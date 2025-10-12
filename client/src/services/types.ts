// Core incident types
export interface Incident {
  id: string;
  description: string;
  service: string;
  environment: 'production' | 'staging' | 'development';
  version: string;
  tags: string[];
  status: 'unresolved' | 'resolved';
  createdAt: string;
  updatedAt: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface IncidentDetail extends Incident {
  errorLogs: string;
  relatedIncidents: string[];
  memoryEmbeddings?: number[];
  resolution?: Resolution;
}

export interface SearchResult {
  incident: Incident;
  similarityScore: number;
  whyMatched: WhyMatched[];
  fixSummary: string;
  patchDiff?: PatchDiff;
}

// Resolution types
export interface Resolution {
  id: string;
  incidentId: string;
  summary: string;
  rootCause: string;
  appliedFix: string;
  tags: string[];
  patchFile?: string;
  resolvedAt: string;
  resolvedBy: string;
}

export interface NewIncident {
  description: string;
  service: string;
  environment: 'production' | 'staging' | 'development';
  version: string;
  tags: string[];
  additionalContext?: string;
  errorLogs?: string;
}

// Search and filter types
export interface Filters {
  service: string;
  environment: string;
  version: string;
  tags: string[];
}

export interface WhyMatched {
  type: 'similar_error' | 'same_service' | 'matching_keywords' | 'recent_occurrence';
  description: string;
  keywords?: string[];
  confidence: number;
}

// Patch diff types
export interface PatchDiff {
  fileName: string;
  beforeContent: string;
  afterContent: string;
  addedLines: number[];
  removedLines: number[];
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Service options for dropdowns
export const SERVICE_OPTIONS = [
  'All Services',
  'Auth Service',
  'Payment API',
  'User Service',
  'Notification Service',
  'Data Pipeline'
] as const;

export const ENVIRONMENT_OPTIONS = [
  'All',
  'Production',
  'Staging',
  'Development'
] as const;

export const VERSION_OPTIONS = [
  'All',
  'v2.x',
  'v1.x',
  'v0.x'
] as const;

export const TAG_OPTIONS = [
  'database',
  'network',
  'memory-leak',
  'timeout',
  'crash',
  'deployment'
] as const;

// Component prop types
export interface SearchFormProps {
  onSubmit: (query: string) => void;
  loading?: boolean;
  initialQuery?: string;
}

export interface SearchFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearAll: () => void;
}

export interface ResultCardProps {
  result: SearchResult;
  onViewPatch: (incidentId: string) => void;
  onApplyFix: (incidentId: string) => void;
  index: number;
}

export interface WhyMatchedChipProps {
  match: WhyMatched;
  maxChips?: number;
}

export interface UnresolvedTableProps {
  incidents: Incident[];
  loading?: boolean;
  onViewIncident: (incidentId: string) => void;
  onSort?: (column: string) => void;
}

export interface IncidentDetailModalProps {
  incidentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkResolved: (incidentId: string) => void;
}

export interface MarkResolvedFormProps {
  incidentId: string;
  onSubmit: (resolution: Omit<Resolution, 'id' | 'incidentId' | 'resolvedAt' | 'resolvedBy'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Toast types
export interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Hook return types
export interface UseSearchReturn {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string, filters?: Filters) => Promise<void>;
  clearResults: () => void;
}

export interface UseIncidentsReturn {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markResolved: (id: string, resolution: Omit<Resolution, 'id' | 'incidentId' | 'resolvedAt' | 'resolvedBy'>) => Promise<void>;
}
