import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
});

const IS_DEMO_MODE = true;

// Automatically attach the role header to every request
api.interceptors.request.use((config) => {
  const role = localStorage.getItem('cinecore_role') || 'AUDIENCE';
  const superadminKey = localStorage.getItem('cinecore_superadmin');
  
  config.headers['X-User-Role'] = role;
  if (superadminKey) {
    config.headers['X-Superadmin-Key'] = superadminKey;
  }

  const bypassDemoMode = superadminKey === (import.meta.env.VITE_SUPERADMIN_PASSWORD || 'superadminkey123');

  if (IS_DEMO_MODE && !bypassDemoMode) {
    const method = config.method?.toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method || '')) {
      toast.success('Action simulated: Database is in Demo Mode', {
        icon: '🛡️',
        style: {
          borderRadius: '0',
          background: '#0a0a0a',
          color: '#f5f5f0',
          border: '1px solid #d4af37'
        }
      });
      
      config.adapter = async () => {
        return {
          data: { id: 9999, message: 'Mocked Success' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      };
    }
  }

  return config;
});