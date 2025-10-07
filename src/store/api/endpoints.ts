// API endpoints configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/admin/auth/login',
    LOGOUT: '/auth/logout',
  },
  
  // Admin Management
  SEP_ADMIN: {
    BASE: '/sep-admin',
    BOOTSTRAP: '/sep-admin/bootstrap',
    GET_ALL: '/sep-admin',
    GET_BY_ID: (id: number) => `/sep-admin/${id}`,
    UPDATE: (id: number) => `/sep-admin/${id}`,
    DELETE: (id: number) => `/sep-admin/${id}`,
    UPDATE_STATUS: (id: number) => `/sep-admin/${id}/status`,
    CHANGE_PASSWORD: (id: number) => `/sep-admin/${id}/password`,
    
    // Filters
    FILTER_ACTIVE: '/sep-admin/filter/active',
    FILTER_INACTIVE: '/sep-admin/filter/inactive',
    FILTER_BY_STATUS: (status: number) => `/sep-admin/filter/status/${status}`,
    
    // Search
    SEARCH_BY_NAME: (term: string) => `/sep-admin/search/name/${term}`,
    SEARCH_BY_USERNAME: (term: string) => `/sep-admin/search/username/${term}`,
    SEARCH_BY_EMAIL: (term: string) => `/sep-admin/search/email/${term}`,
    
    // Stats
    STATS: '/sep-admin/stats',
  },
  
  // Tenders
  TENDERS: {
    BASE: '/tenders',
    GET_ALL: '/tenders',
    GET_BY_ID: (id: number) => `/tenders/${id}`,
    CREATE: '/tenders',
    UPDATE: (id: number) => `/tenders/${id}`,
    DELETE: (id: number) => `/tenders/${id}`,
    DOWNLOAD_FILE: (id: number, filename: string) => `/tenders/${id}/download/${filename}`,
  },
  
  // Categories
  CATEGORIES: {
    BASE: '/categories',
    GET_ALL: '/categories',
    GET_BY_ID: (id: number) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id: number) => `/categories/${id}`,
    DELETE: (id: number) => `/categories/${id}`,
  },
  
  // Contracting Authorities
  CONTRACTING_AUTHORITIES: {
    BASE: '/contracting-authorities',
    GET_ALL: '/contracting-authorities',
    GET_BY_ID: (id: number) => `/contracting-authorities/${id}`,
    CREATE: '/contracting-authorities',
    UPDATE: (id: number) => `/contracting-authorities/${id}`,
    DELETE: (id: number) => `/contracting-authorities/${id}`,
    SEARCH_BY_NAME: '/contracting-authorities/search',
    GET_RECENTLY_CREATED: '/contracting-authorities/recent/created',
    GET_RECENTLY_UPDATED: '/contracting-authorities/recent/updated',
    GET_STATS: '/contracting-authorities/stats',
    GET_BY_CREATED_BY: (createdBy: string) => `/contracting-authorities/created-by/${createdBy}`,
    GET_BY_NAME: (name: string) => `/contracting-authorities/name/${name}`,
  },
  
  // Regions
  REGIONS: {
    BASE: '/states',
    GET_ALL: '/states',
    GET_BY_ID: (id: number) => `/states/${id}`,
    CREATE: '/states',
    UPDATE: (id: number) => `/states/${id}`,
    DELETE: (id: number) => `/states/${id}`,
  },
  
  // States
  STATES: {
    BASE: '/states',
    GET_ALL: '/states',
    GET_BY_ID: (id: number) => `/states/${id}`,
    CREATE: '/states',
    UPDATE: (id: number) => `/states/${id}`,
    DELETE: (id: number) => `/states/${id}`,
  },
  
  // Procedures
  PROCEDURES: {
    BASE: '/procedures',
    GET_ALL: '/procedures',
    GET_BY_ID: (id: number) => `/procedures/${id}`,
    CREATE: '/procedures',
    UPDATE: (id: number) => `/procedures/${id}`,
    DELETE: (id: number) => `/procedures/${id}`,
  },
  
  // Contract Types
  CONTRACT_TYPES: {
    BASE: '/contract-types',
    GET_ALL: '/contract-types',
    GET_BY_ID: (id: number) => `/contract-types/${id}`,
    CREATE: '/contract-types',
    UPDATE: (id: number) => `/contract-types/${id}`,
    DELETE: (id: number) => `/contract-types/${id}`,
  },
  
  // Notice Types
  NOTICE_TYPES: {
    BASE: '/notice-types',
    GET_ALL: '/notice-types',
    GET_BY_ID: (id: number) => `/notice-types/${id}`,
    CREATE: '/notice-types',
    UPDATE: (id: number) => `/notice-types/${id}`,
    DELETE: (id: number) => `/notice-types/${id}`,
  },
  
  // SEP Users (Subscribers)
  SEP_USERS: {
    BASE: '/members',
    GET_ALL: '/members/active',
    GET_BY_ID: (id: number) => `/members/${id}`,
    CREATE: '/members',
    UPDATE: (id: number) => `/members/${id}`,
    DELETE: (id: number) => `/members/${id}`,
    UPDATE_STATUS: (id: number) => `/members/${id}/status`,
    UPDATE_ACTIVE: (id: number) => `/members/${id}/active`,
    ACTIVATE: (id: number) => `/members/${id}/activate`,
    CHANGE_PASSWORD: (id: number) => `/members/${id}/password`,
    EXTEND_EXPIRY: (id: number) => `/members/${id}/extend-valid-time`,
    
    // Filter endpoints
    FILTER_ACTIVE: '/members/active',
    FILTER_INACTIVE: '/members/filter/inactive',
    FILTER_EXPIRED: '/members/expired',
    FILTER_EXPIRING: '/members/filter/expiring-within',
    FILTER_BY_STATUS: (status: number) => `/members/status/${status}`,
    FILTER_BY_GROUP: (group: number) => `/members/filter/group/${group}`,
    
    // Search endpoints
    SEARCH_BY_USERNAME: (term: string) => `/members/search/username/${term}`,
    SEARCH_BY_EMAIL: (term: string) => `/members/search/email/${term}`,
    
    // Stats
    STATS: '/members/stats',
  },
} as const;