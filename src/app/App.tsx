import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Providers } from './providers';
import { useAuthStore } from '@/features/auth';

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize auth on app load (check for existing token)
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
