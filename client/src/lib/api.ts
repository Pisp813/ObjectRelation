// Objects API functions
export const objectsAPI = {
  getAll: async () => {
    const response = await fetch('/api/objects');
    if (!response.ok) throw new Error('Failed to fetch objects');
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`/api/objects/${id}`);
    if (!response.ok) throw new Error('Failed to fetch object');
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch('/api/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create object');
    return response.json();
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`/api/objects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update object');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/objects/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete object');
    return response.json();
  }
};

// Relations API functions
export const relationsAPI = {
  getAll: async () => {
    const response = await fetch('/api/relations');
    if (!response.ok) throw new Error('Failed to fetch relations');
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch('/api/relations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create relation');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`/api/relations/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete relation');
    return response.json();
  }
};

// Hierarchies API functions
export const hierarchiesAPI = {
  getAll: async () => {
    const response = await fetch('/api/hierarchies');
    if (!response.ok) throw new Error('Failed to fetch hierarchies');
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch('/api/hierarchies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create hierarchy');
    return response.json();
  }
};

// AI Search API
export const searchAPI = {
  search: async (query: string) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }
};

// Chat API
export const chatAPI = {
  sendMessage: async (message: string, sessionId?: string) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId })
    });
    if (!response.ok) throw new Error('Chat failed');
    return response.json();
  }
};

// Reports API functions
export const reportsAPI = {
  generate: async (type: 'objects' | 'relations' | 'hierarchies' | 'full'): Promise<Blob> => {
    const response = await fetch(`/api/reports/${type}`);
    if (!response.ok) throw new Error('Failed to generate report');
    return response.blob();
  }
};
