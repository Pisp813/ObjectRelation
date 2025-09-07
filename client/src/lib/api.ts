import { apiRequest } from './queryClient';
import { ObjectType, Relation, Hierarchy, AISearchResponse } from '@shared/schema';

// Object API functions
export const objectsAPI = {
  getAll: async (): Promise<ObjectType[]> => {
    const response = await fetch('/api/objects');
    if (!response.ok) throw new Error('Failed to fetch objects');
    return response.json();
  },

  getById: async (id: string): Promise<ObjectType> => {
    const response = await fetch(`/api/objects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch object');
    return response.json();
  },

  create: async (data: any): Promise<ObjectType> => {
    const response = await apiRequest('POST', '/api/objects', data);
    return response.json();
  },

  update: async (id: string, data: any): Promise<ObjectType> => {
    const response = await apiRequest('PUT', `/api/objects/${id}`, data);
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest('DELETE', `/api/objects/${id}`);
  },

  getRelations: async (id: string): Promise<Relation[]> => {
    const response = await fetch(`/api/objects/${id}/relations`);
    if (!response.ok) throw new Error('Failed to fetch relations');
    return response.json();
  },

  getHierarchy: async (id: string): Promise<Hierarchy[]> => {
    const response = await fetch(`/api/objects/${id}/hierarchy`);
    if (!response.ok) throw new Error('Failed to fetch hierarchy');
    return response.json();
  }
};

// Relations API functions
export const relationsAPI = {
  create: async (data: any): Promise<Relation> => {
    const response = await apiRequest('POST', '/api/relations', data);
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest('DELETE', `/api/relations/${id}`);
  }
};

// Hierarchy API functions
export const hierarchiesAPI = {
  create: async (data: any): Promise<Hierarchy> => {
    const response = await apiRequest('POST', '/api/hierarchies', data);
    return response.json();
  }
};

// Search and Chat API functions
export const aiAPI = {
  search: async (query: string): Promise<AISearchResponse> => {
    const response = await apiRequest('POST', '/api/search', { query });
    return response.json();
  },

  chat: async (message: string, sessionId?: string): Promise<{ message: string; sessionId: string }> => {
    const response = await apiRequest('POST', '/api/chat', { message, sessionId });
    return response.json();
  }
};

// Reports API functions
export const reportsAPI = {
  generate: async (type: 'objects' | 'relations' | 'hierarchies' | 'full'): Promise<any> => {
    const response = await fetch(`/api/reports/${type}`);
    if (!response.ok) throw new Error('Failed to generate report');
    return response.json();
  }
};
